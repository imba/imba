import type { LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { URI } from 'vscode-uri';
import { toImbaIdentifier, toImbaString, toJSIdentifier } from '../conversion';
import { getTagIndex, type WorkspaceTag } from '../tagIndex';
import { ImbaVirtualCode } from '../virtualCode';
import { findGlobalNamespaceExports, getTypeScriptService, tagText } from './checkerUtils';

// style vars and mixins: usage token type → declaration token type
// (parity: E2 — old checker getStyleVarTokens/getMixinReferences synthesis)
const STYLE_DECL_FOR: Record<string, { decl: string; label: string }> = {
	'style.value.var': { decl: 'style.property.var', label: 'style variable' },
	'tag.mixin.name': { decl: 'style.selector.mixin.name', label: 'mixin' },
	'style.selector.mixin.name': { decl: 'tag.mixin.name', label: 'mixin usage' },
};

// references/rename treat declaration + usage tokens as one symbol family
// (parity: E4 — these tokens never reach TS, so the monarch index is the
// whole truth; token values are symmetric across sides, sigils included
// for vars (`--gap`, `$accent`) and bare for mixins (`card`))
const STYLE_TOKEN_FAMILIES: string[][] = [
	['style.property.var', 'style.value.var'],
	['tag.mixin.name', 'style.selector.mixin.name'],
];

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

export function createImbaTagsPlugin(typescript: typeof import('typescript')): LanguageServicePlugin {
	return {
		name: 'imba-tags',
		capabilities: {
			definitionProvider: true,
			hoverProvider: true,
			referencesProvider: true,
			renameProvider: { prepareProvider: true },
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

			function findImbacssExport(rawName: string) {
				const program = getTypeScriptService(context)?.getProgram();
				if (!program) {
					return undefined;
				}
				const checker = program.getTypeChecker();
				for (const symbol of findGlobalNamespaceExports(typescript, program, checker, 'imbacss')) {
					if ((symbol.escapedName as string) === rawName) {
						return { symbol, checker };
					}
				}
				return undefined;
			}

			// C3: hover for style property names (abbreviations expand via
			// @proxy — the proxied symbol carries the docs and MDN link) and
			// style modifiers (@detail carries the css selector equivalent)
			function styleMetaAt(
				documentUri: string,
				offset: number
			): { value: string; range: [number, number] } | undefined {
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

				if (tok.match('style.property.name')) {
					const found = findImbacssExport(toJSIdentifier(tok.value));
					if (!found) {
						return undefined;
					}
					let { symbol } = found;
					let title = tok.value;
					const proxy = tagText(symbol, found.checker, 'proxy');
					if (proxy) {
						title = `${tok.value} (${toImbaIdentifier(proxy)})`;
						const target = findImbacssExport(proxy);
						if (target) {
							symbol = target.symbol;
						}
					}
					const docs = symbol
						.getDocumentationComment(found.checker)
						.map(part => part.text)
						.join('');
					return {
						value: `\`\`\`imba\n${title}\n\`\`\`${docs ? '\n\n' + toImbaString(docs) : ''}`,
						range: [tok.offset, tok.endOffset],
					};
				}

				if (tok.match('style.property.modifier')) {
					const name = tok.value.replace(/^@/, '');
					const found = findImbacssExport('α' + toJSIdentifier(name));
					if (!found) {
						return undefined;
					}
					const detail = tagText(found.symbol, found.checker, 'detail');
					const docs = found.symbol
						.getDocumentationComment(found.checker)
						.map(part => part.text)
						.join('');
					const lines = [`\`\`\`imba\n@${name}\n\`\`\``];
					if (detail) {
						lines.push(`*${toImbaString(detail.trim())}*`);
					}
					if (docs) {
						lines.push(toImbaString(docs));
					}
					return {
						value: lines.join('\n\n'),
						range: [tok.offset, tok.endOffset],
					};
				}

				return undefined;
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

			function styleFamilyAt(
				documentUri: string,
				offset: number
			): { targets: StyleDeclHit['targets']; range: [number, number] } | undefined {
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
				const family = STYLE_TOKEN_FAMILIES.find(types => types.some(type => tok.match(type)));
				if (!family) {
					return undefined;
				}
				const targets = family.flatMap(type => findStyleDeclarations(context, type, tok.value));
				return { targets, range: [tok.offset, tok.endOffset] };
			}

			return {
				provideReferences(document, position) {
					if (document.languageId !== 'imba') {
						return;
					}
					const hit = styleFamilyAt(document.uri, document.offsetAt(position));
					if (!hit?.targets.length) {
						return;
					}
					return hit.targets.map(target => ({
						uri: URI.file(target.fileName).toString(),
						range: rangeInText(target.text, target.offset, target.length),
					})) as never;
				},
				provideRenameRange(document, position) {
					if (document.languageId !== 'imba') {
						return;
					}
					const hit = styleFamilyAt(document.uri, document.offsetAt(position));
					if (!hit) {
						return;
					}
					return {
						start: document.positionAt(hit.range[0]),
						end: document.positionAt(hit.range[1]),
					};
				},
				provideRenameEdits(document, position, newName) {
					if (document.languageId !== 'imba') {
						return;
					}
					const hit = styleFamilyAt(document.uri, document.offsetAt(position));
					if (!hit?.targets.length) {
						return;
					}
					// the token carries its sigil for vars (`--gap`) and rename
					// replaces the full token — newName is inserted verbatim,
					// exactly what the prefilled rename box hands back
					const changes: Record<string, { range: ReturnType<typeof rangeInText>; newText: string }[]> = {};
					for (const target of hit.targets) {
						const uri = URI.file(target.fileName).toString();
						(changes[uri] ??= []).push({
							range: rangeInText(target.text, target.offset, target.length),
							newText: newName,
						});
					}
					return { changes } as never;
				},
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
					const meta = styleMetaAt(document.uri, document.offsetAt(position));
					if (meta) {
						return {
							contents: { kind: 'markdown' as const, value: meta.value },
							range: {
								start: document.positionAt(meta.range[0]),
								end: document.positionAt(meta.range[1]),
							},
						};
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
