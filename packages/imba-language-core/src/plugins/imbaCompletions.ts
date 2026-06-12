import type { LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
import * as monarchModule from 'imba-monarch';
import * as path from 'node:path';
import type * as ts from 'typescript';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { toImbaIdentifier } from '../conversion';
import { getTagIndex, type ImbaTagIndex } from '../tagIndex';
import { ImbaVirtualCode } from '../virtualCode';
import { detailOf, findGlobalInterface, getTypeScriptService, summaryOf } from './checkerUtils';

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
				triggerCharacters: ['<', '@', '.'],
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
				const program = getTypeScriptService(context)?.getProgram();
				if (!program) {
					return new Map();
				}
				let cached = htmlTagSymbols.get(program);
				if (cached) {
					return cached;
				}
				cached = new Map();
				const checker = program.getTypeChecker();
				const symbol = findGlobalInterface(typescript, program, checker, 'HTMLElementTagNameMap');
				if (symbol) {
					for (const prop of checker.getDeclaredTypeOfSymbol(symbol).getProperties()) {
						cached.set(prop.escapedName as string, prop);
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
					if (!CompletionTypes) {
						return;
					}

					const tok = mctx.token;
					// replace the partial name token when one is being typed
					const tokenRange = (nameTokenType: string) =>
						tok && tok.match(nameTokenType) && tok.offset <= offset
							? { start: document.positionAt(tok.offset), end: document.positionAt(tok.endOffset) }
							: { start: position, end: position };

					if (flags & CompletionTypes.TagEvent) {
						return eventNameItems(context, typescript, tokenRange('tag.event.name'));
					}
					if (flags & CompletionTypes.TagEventModifier) {
						return eventModifierItems(context, typescript, mctx.eventName, tokenRange('tag.event-modifier.name'));
					}
					if (!(flags & CompletionTypes.TagName)) {
						return;
					}

					const range = tokenRange('tag.name');
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

type LspRange = { start: { line: number; character: number }; end: { line: number; character: number } };

// parity: completions.imba `if flags & CT.TagEvent → add checker.props("ImbaEvents")`
function eventNameItems(context: LanguageServiceContext, typescript: typeof ts, range: LspRange) {
	const program = getTypeScriptService(context)?.getProgram();
	if (!program) {
		return;
	}
	const checker = program.getTypeChecker();
	const imbaEvents = findGlobalInterface(typescript, program, checker, 'ImbaEvents');
	if (!imbaEvents) {
		return;
	}
	const items = [];
	for (const prop of checker.getDeclaredTypeOfSymbol(imbaEvents).getProperties()) {
		const name = prop.escapedName as string;
		if (name.startsWith('α') || name.startsWith('__')) {
			continue;
		}
		const declaration = prop.valueDeclaration ?? prop.declarations?.[0];
		const type = declaration ? checker.getTypeOfSymbolAtLocation(prop, declaration) : undefined;
		const summary = summaryOf(prop, checker);
		items.push({
			label: '@' + name,
			filterText: name,
			sortText: '1' + name,
			kind: 23, // Event
			detail: type ? checker.typeToString(type) : undefined,
			documentation: summary ? { kind: 'markdown' as const, value: toImbaIdentifier(summary) } : undefined,
			commitCharacters: ['.', '=', '('],
			textEdit: { range, newText: name },
		});
	}
	return { isIncomplete: false, items: items as never[] };
}

// parity: completions.imba CT.TagEventModifier → checker.getEventModifiers(ctx.eventName)
function eventModifierItems(
	context: LanguageServiceContext,
	typescript: typeof ts,
	eventName: string | undefined,
	range: LspRange
) {
	if (!eventName) {
		return;
	}
	const program = getTypeScriptService(context)?.getProgram();
	if (!program) {
		return;
	}
	const checker = program.getTypeChecker();
	const imbaEvents = findGlobalInterface(typescript, program, checker, 'ImbaEvents');
	if (!imbaEvents) {
		return;
	}
	const eventsType = checker.getDeclaredTypeOfSymbol(imbaEvents);
	const eventProp = eventsType.getProperty(eventName);
	const stringIndex = checker
		.getIndexInfosOfType(eventsType)
		.find(info => info.keyType.flags & typescript.TypeFlags.String);
	const eventType = eventProp
		? checker.getTypeOfSymbolAtLocation(eventProp, eventProp.valueDeclaration ?? eventProp.declarations![0])
		: stringIndex?.type;
	if (!eventType) {
		return;
	}

	const items = [];
	for (const prop of eventType.getApparentProperties()) {
		const raw = prop.escapedName as string;
		if (!raw.startsWith('α') || raw === 'αoptions') {
			continue;
		}
		const name = toImbaIdentifier(raw.slice(1));
		const detail = detailOf(prop, checker);
		const summary = summaryOf(prop, checker);
		items.push({
			label: name,
			sortText: '1' + name,
			kind: 23, // Event
			detail: detail ? toImbaIdentifier(detail) : undefined,
			documentation: summary ? { kind: 'markdown' as const, value: toImbaIdentifier(summary) } : undefined,
			// parity: old plugin added '(' as commit char when the modifier takes args
			commitCharacters: detail?.startsWith('(') ? ['.', '=', '('] : ['.', '='],
			textEdit: { range, newText: name },
		});
	}
	return { isIncomplete: false, items: items as never[] };
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
