import type { LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { URI } from 'vscode-uri';
import { getTagIndex, type WorkspaceTag } from '../tagIndex';
import { ImbaVirtualCode } from '../virtualCode';
import { getTypeScriptService } from './checkerUtils';

// style vars and mixins: usage token type → declaration token type
// (parity: E2 — old checker getStyleVarTokens/getMixinReferences synthesis)
const STYLE_DECL_FOR: Record<string, { decl: string; label: string }> = {
	'style.value.var': { decl: 'style.property.var', label: 'style variable' },
	'tag.mixin.name': { decl: 'style.selector.mixin.name', label: 'mixin' },
	'style.selector.mixin.name': { decl: 'tag.mixin.name', label: 'mixin usage' },
};

interface StyleDeclHit {
	label: string;
	targets: { fileName: string; text: string; offset: number; length: number }[];
	range: [number, number];
}

function findStyleDeclarations(
	context: LanguageServiceContext,
	tokenType: string,
	value: string
): StyleDeclHit['targets'] {
	const program = getTypeScriptService(context)?.getProgram();
	if (!program) {
		return [];
	}
	const targets = [];
	for (const sourceFile of program.getSourceFiles()) {
		if (!sourceFile.fileName.endsWith('.imba')) {
			continue;
		}
		const root = context.language.scripts.get(URI.file(sourceFile.fileName))?.generated?.root;
		if (!(root instanceof ImbaVirtualCode)) {
			continue;
		}
		for (const token of root.monarchDoc.getMatchingTokens(tokenType)) {
			if (token.value === value) {
				targets.push({
					fileName: root.fileName,
					text: root.snapshot.getText(0, root.snapshot.getLength()),
					offset: token.offset,
					length: token.endOffset - token.offset,
				});
			}
		}
	}
	return targets;
}

// Tag NAME tokens at usage sites (`<cool-widget ...>`) cannot travel the TS
// mapping path: the generated reference is the Γ-prefixed registry name with
// a different length, so only container spans cover it. Definition/hover for
// the name itself resolve through the workspace tag index instead — while
// ATTRIBUTES on the same tag flow through TS mappings (exact spans) and need
// no help here.

export function createImbaTagsPlugin(): LanguageServicePlugin {
	return {
		name: 'imba-tags',
		capabilities: {
			definitionProvider: true,
			hoverProvider: true,
		},
		create(context) {
			function tagAt(documentUri: string, offset: number): { tags: WorkspaceTag[]; range: [number, number] } | undefined {
				const decoded = context.decodeEmbeddedDocumentUri(URI.parse(documentUri));
				if (!decoded) {
					return undefined;
				}
				const root = context.language.scripts.get(decoded[0])?.generated?.root;
				if (!(root instanceof ImbaVirtualCode) || decoded[1] !== root.id) {
					return undefined;
				}
				const tok = root.monarchDoc.getContextAtOffset(offset)?.token;
				if (!tok?.match('tag.name')) {
					return undefined;
				}
				const roots = (context.env.workspaceFolders ?? [])
					.filter(uri => uri.scheme === 'file')
					.map(uri => uri.fsPath);
				const index = getTagIndex(roots);
				index.refresh();
				const tags = index.tags.filter(tag => tag.name === tok.value);
				if (!tags.length) {
					return undefined;
				}
				return { tags, range: [tok.offset, tok.endOffset] };
			}

			function styleAt(documentUri: string, offset: number): StyleDeclHit | undefined {
				const decoded = context.decodeEmbeddedDocumentUri(URI.parse(documentUri));
				if (!decoded) {
					return undefined;
				}
				const root = context.language.scripts.get(decoded[0])?.generated?.root;
				if (!(root instanceof ImbaVirtualCode) || decoded[1] !== root.id) {
					return undefined;
				}
				const tok = root.monarchDoc.getContextAtOffset(offset)?.token;
				if (!tok) {
					return undefined;
				}
				for (const [usageType, { decl, label }] of Object.entries(STYLE_DECL_FOR)) {
					if (tok.match(usageType)) {
						const targets = findStyleDeclarations(context, decl, tok.value);
						if (targets.length) {
							return { label, targets, range: [tok.offset, tok.endOffset] };
						}
					}
				}
				return undefined;
			}

			return {
				provideDefinition(document, position) {
					if (document.languageId !== 'imba') {
						return;
					}
					const styleHit = styleAt(document.uri, document.offsetAt(position));
					if (styleHit) {
						const origin = {
							start: document.positionAt(styleHit.range[0]),
							end: document.positionAt(styleHit.range[1]),
						};
						return styleHit.targets.map(target => {
							const range = rangeInText(target.text, target.offset, target.length);
							return {
								targetUri: URI.file(target.fileName).toString(),
								targetRange: range,
								targetSelectionRange: range,
								originSelectionRange: origin,
							};
						}) as never;
					}
					const hit = tagAt(document.uri, document.offsetAt(position));
					if (!hit) {
						return;
					}
					const origin = {
						start: document.positionAt(hit.range[0]),
						end: document.positionAt(hit.range[1]),
					};
					return hit.tags.map(tag => {
						const target = offsetToRange(tag.fileName, tag.offset, tag.name.length);
						return {
							targetUri: URI.file(tag.fileName).toString(),
							targetRange: target,
							targetSelectionRange: target,
							originSelectionRange: origin,
						};
					}) as never;
				},
				provideHover(document, position) {
					if (document.languageId !== 'imba') {
						return;
					}
					const styleHit = styleAt(document.uri, document.offsetAt(position));
					if (styleHit) {
						const value = document.getText({
							start: document.positionAt(styleHit.range[0]),
							end: document.positionAt(styleHit.range[1]),
						});
						const files = [...new Set(styleHit.targets.map(t => path.basename(t.fileName)))].join(', ');
						return {
							contents: {
								kind: 'markdown' as const,
								value: `\`\`\`imba\n${value}\n\`\`\`\n\n*${styleHit.label}* — ${files}`,
							},
							range: {
								start: document.positionAt(styleHit.range[0]),
								end: document.positionAt(styleHit.range[1]),
							},
						};
					}
					const hit = tagAt(document.uri, document.offsetAt(position));
					if (!hit) {
						return;
					}
					const tag = hit.tags[0];
					const kind = tag.global ? 'global tag' : 'tag';
					return {
						contents: {
							kind: 'markdown' as const,
							value: `\`\`\`imba\n${kind} ${tag.name}\n\`\`\`\n\n${path.basename(tag.fileName)}`,
						},
						range: {
							start: document.positionAt(hit.range[0]),
							end: document.positionAt(hit.range[1]),
						},
					};
				},
			};
		},
	};
}

function offsetToRange(fileName: string, offset: number, length: number) {
	let text = '';
	try {
		text = fs.readFileSync(fileName, 'utf8');
	} catch {
		// fall through to position 0
	}
	return rangeInText(text, offset, length);
}

function rangeInText(text: string, offset: number, length: number) {
	const before = text.slice(0, offset);
	const line = before.split('\n').length - 1;
	const character = offset - (before.lastIndexOf('\n') + 1);
	return {
		start: { line, character },
		end: { line, character: character + length },
	};
}
