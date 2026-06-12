import type { LanguageServicePlugin } from '@volar/language-service';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { URI } from 'vscode-uri';
import { getTagIndex, type WorkspaceTag } from '../tagIndex';
import { ImbaVirtualCode } from '../virtualCode';

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

			return {
				provideDefinition(document, position) {
					if (document.languageId !== 'imba') {
						return;
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
	let before = '';
	try {
		before = fs.readFileSync(fileName, 'utf8').slice(0, offset);
	} catch {
		// fall through to position 0
	}
	const line = before.split('\n').length - 1;
	const character = offset - (before.lastIndexOf('\n') + 1);
	return {
		start: { line, character },
		end: { line, character: character + length },
	};
}
