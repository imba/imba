import type { LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
import * as monarchModule from 'imba-monarch';
import * as path from 'node:path';
import type * as ts from 'typescript';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { getTagIndex, type ImbaTagIndex } from '../tagIndex';
import { ImbaVirtualCode } from '../virtualCode';

// parity: completions.imba tagnames() — but the listing comes from the
// workspace tag index (ultrafast scan) + cached HTMLElementTagNameMap lookup
// instead of the old getExportInfoMap crawl; auto-import edits via monarch's
// createImportEdit (the same helper the old plugin used).

// defensive CJS/ESM interop, same as virtualCode.ts
const CompletionTypes: typeof import('imba-monarch').CompletionTypes =
	(monarchModule as any).CompletionTypes ?? (monarchModule as any).default?.CompletionTypes;

const TAG_COMMIT_CHARACTERS = ['>', ' ', '.', '[', '#'];

export function createImbaCompletionsPlugin(typescript: typeof ts): LanguageServicePlugin {
	return {
		name: 'imba-completions',
		capabilities: {
			completionProvider: {
				triggerCharacters: ['<'],
			},
		},
		create(context) {
			const htmlTagSymbols = new WeakMap<ts.Program, Map<string, ts.Symbol>>();

			function workspaceTagIndex(): ImbaTagIndex {
				const roots = (context.env.workspaceFolders ?? [])
					.filter(uri => uri.scheme === 'file')
					.map(uri => uri.fsPath);
				return getTagIndex(roots);
			}

			function getHtmlTags(): Map<string, ts.Symbol> {
				const empty = new Map<string, ts.Symbol>();
				let program: ts.Program | undefined;
				try {
					program = (context.inject('typescript/languageService') as ts.LanguageService)?.getProgram();
				} catch {
					return empty;
				}
				if (!program) {
					return empty;
				}
				let cached = htmlTagSymbols.get(program);
				if (cached) {
					return cached;
				}
				cached = new Map();
				const checker = program.getTypeChecker();
				outer: for (const file of program.getSourceFiles()) {
					if (!file.fileName.endsWith('.d.ts')) {
						continue;
					}
					for (const statement of file.statements) {
						if (typescript.isInterfaceDeclaration(statement) && statement.name.text === 'HTMLElementTagNameMap') {
							const symbol = checker.getSymbolAtLocation(statement.name);
							if (symbol) {
								const type = checker.getDeclaredTypeOfSymbol(symbol);
								for (const prop of type.getProperties()) {
									cached.set(prop.escapedName as string, prop);
								}
								break outer;
							}
						}
					}
				}
				htmlTagSymbols.set(program, cached);
				return cached;
			}

			return {
				provideCompletionItems(document, position) {
					if (document.languageId !== 'imba') {
						return;
					}
					const decoded = context.decodeEmbeddedDocumentUri(URI.parse(document.uri));
					if (!decoded) {
						return;
					}
					const root = context.language.scripts.get(decoded[0])?.generated?.root;
					if (!(root instanceof ImbaVirtualCode) || decoded[1] !== root.id) {
						return;
					}

					const offset = document.offsetAt(position);
					const mctx = root.monarchDoc.getContextAtOffset(offset);
					const flags = mctx.suggest?.flags ?? 0;
					if (!CompletionTypes || !(flags & CompletionTypes.TagName)) {
						return;
					}

					// replace the partial tag name when one is being typed
					const tok = mctx.token;
					const range =
						tok && tok.match('tag.name') && tok.offset <= offset
							? { start: document.positionAt(tok.offset), end: document.positionAt(tok.endOffset) }
							: { start: position, end: position };

					const currentFile = decoded[0].fsPath;
					const items = [];
					const seen = new Set<string>();

					const index = workspaceTagIndex();
					index.refresh();
					for (const tag of index.tags) {
						if (seen.has(tag.name)) {
							continue;
						}
						seen.add(tag.name);
						const local = tag.fileName === currentFile;
						const item: Record<string, unknown> = {
							label: tag.name,
							kind: 7, // Class
							sortText: '1' + tag.name,
							detail: local ? undefined : path.relative(path.dirname(currentFile), tag.fileName),
							commitCharacters: TAG_COMMIT_CHARACTERS,
							textEdit: { range, newText: tag.name },
						};
						if (!local && !tag.global && tag.exported) {
							const edits = importEditsFor(document, root, currentFile, tag.fileName, tag.name);
							if (edits.length) {
								item.additionalTextEdits = edits;
							}
						}
						items.push(item);
					}

					for (const [name] of getHtmlTags()) {
						if (seen.has(name)) {
							continue;
						}
						items.push({
							label: name,
							kind: 12, // Value
							sortText: '2' + name,
							commitCharacters: TAG_COMMIT_CHARACTERS,
							textEdit: { range, newText: name },
						});
					}

					return { isIncomplete: false, items: items as never[] };
				},
			};
		},
	};
}

function importEditsFor(
	document: TextDocument,
	root: ImbaVirtualCode,
	fromFile: string,
	tagFile: string,
	tagName: string
): { range: { start: { line: number; character: number }; end: { line: number; character: number } }; newText: string }[] {
	let importPath = path.relative(path.dirname(fromFile), tagFile).split(path.sep).join('/');
	importPath = importPath.replace(/\.imba$/, '');
	if (!importPath.startsWith('.')) {
		importPath = './' + importPath;
	}
	try {
		const result = root.monarchDoc.createImportEdit(importPath, tagName);
		return result.changes.map(change => ({
			range: {
				start: document.positionAt(change.start),
				end: document.positionAt(change.start + change.length),
			},
			newText: change.newText,
		}));
	} catch {
		return [];
	}
}
