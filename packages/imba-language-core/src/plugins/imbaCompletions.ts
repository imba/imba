import type { LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
import * as monarchModule from 'imba-monarch';
import * as path from 'node:path';
import type * as ts from 'typescript';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { toImbaIdentifier, toJSIdentifier } from '../conversion';
import { getTagIndex, type ImbaTagIndex } from '../tagIndex';
import { ImbaVirtualCode } from '../virtualCode';
import {
	detailOf,
	findGlobalInterface,
	findGlobalNamespaceExports,
	findModuleExportsByFileSuffix,
	getTypeScriptService,
	summaryOf,
} from './checkerUtils';

// parity: completions.imba tagnames() — but the listing comes from the
// workspace tag index (ultrafast scan) + cached HTMLElementTagNameMap lookup
// instead of the old getExportInfoMap crawl; auto-import edits via monarch's
// createImportEdit (the same helper the old plugin used).

// defensive CJS/ESM interop, same as virtualCode.ts
const CompletionTypes: typeof import('imba-monarch').CompletionTypes =
	(monarchModule as any).CompletionTypes ?? (monarchModule as any).default?.CompletionTypes;

const TAG_COMMIT_CHARACTERS = ['>', ' ', '.', '[', '#'];

// keywords TS itself completes at mapped positions — ours add the imba set
const JS_KEYWORDS = new Set(
	'await async break case catch class const continue debugger default delete do else export extends false finally for function if implements import in instanceof interface let new null of return static super switch this throw true try typeof undefined var void while yield'.split(
		' '
	)
);

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
					if (flags & CompletionTypes.Decorator) {
						return decoratorItems(context, root, document.offsetAt(position), tokenRange('decorator.name'));
					}
					const styleTokenRange = () =>
						tok && /^style\.value/.test(tok.type) && /^[-$\w]*$/.test(tok.value) && tok.offset <= offset
							? { start: document.positionAt(tok.offset), end: document.positionAt(tok.endOffset) }
							: { start: position, end: position };
					if (flags & (CompletionTypes.StyleVar | CompletionTypes.StyleColor)) {
						return { isIncomplete: false, items: styleVarItems(context, decoded[0].fsPath, styleTokenRange()) as never[] };
					}
					if (flags & CompletionTypes.StyleValue && mctx.suggest?.styleProperty) {
						const valueRange = styleTokenRange();
						const result = styleValueItems(context, typescript, mctx.suggest.styleProperty, valueRange);
						if (result) {
							// declared style vars are valid values anywhere
							result.items.push(...(styleVarItems(context, decoded[0].fsPath, valueRange) as never[]));
						}
						return result;
					}
					if (flags & (CompletionTypes.StyleProp | CompletionTypes.StyleModifier)) {
						// the partial token's TYPE is ambiguous in style
						// contexts (selector vs property) — trust the flags,
						// take the range from any word-ish style token
						const styleRange =
							tok && /^style\./.test(tok.type) && /^[\w-]*$/.test(tok.value) && tok.offset <= offset
								? { start: document.positionAt(tok.offset), end: document.positionAt(tok.endOffset) }
								: { start: position, end: position };
						return flags & CompletionTypes.StyleModifier
							? styleModifierItems(context, typescript, styleRange)
							: stylePropertyItems(context, typescript, styleRange);
					}
					if (flags & CompletionTypes.TagProp && mctx.tagName) {
						const elementSymbol = getHtmlTags().get(mctx.tagName);
						if (elementSymbol) {
							return tagAttrItems(context, typescript, elementSymbol, tokenRange('tag.attr'));
						}
						return;
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

// parity: completions.imba Keywords list (weight 800) — imba-specific
// keywords only; TS provides the JS set as the main completion source, so
// this plugin contributes as ADDITIONAL (Volar allows one main list + any
// number of additional ones)
export function createImbaKeywordsPlugin(): LanguageServicePlugin {
	return {
		name: 'imba-keywords',
		capabilities: {
			completionProvider: {},
		},
		create(context) {
			return {
				isAdditionalCompletion: true,
				provideCompletionItems(document, position) {
					// additional plugins only run on the FIRST visited mapping
					// (usually the embedded TS doc) — be layer-agnostic and
					// translate offsets/ranges for whichever layer this is
					const decoded = context.decodeEmbeddedDocumentUri(URI.parse(document.uri));
					if (!decoded) {
						return;
					}
					const sourceScript = context.language.scripts.get(decoded[0]);
					const root = sourceScript?.generated?.root;
					if (!sourceScript || !(root instanceof ImbaVirtualCode)) {
						return;
					}
					const isRootLayer = decoded[1] === root.id;
					const virtualCode = sourceScript.generated?.embeddedCodes.get(decoded[1]);
					if (!virtualCode) {
						return;
					}
					const mapper = context.language.maps.get(virtualCode, sourceScript);

					let sourceOffset: number | undefined;
					if (isRootLayer) {
						sourceOffset = document.offsetAt(position);
					} else {
						for (const [mapped] of mapper.toSourceLocation(document.offsetAt(position))) {
							sourceOffset = mapped;
							break;
						}
					}
					if (sourceOffset === undefined) {
						return;
					}

					const mctx = root.monarchDoc.getContextAtOffset(sourceOffset);
					const flags = mctx.suggest?.flags ?? 0;
					if (!CompletionTypes || flags & (CompletionTypes.TagName | CompletionTypes.StyleProp | CompletionTypes.StyleValue)) {
						return;
					}
					const keywords = mctx.suggest?.keywords?.filter(k => !JS_KEYWORDS.has(k));
					if (!keywords?.length) {
						return;
					}

					// word range in THIS document's coordinates
					let wordRange = { start: position, end: position };
					const tok = mctx.token;
					if (tok && /^[a-z]+$/.test(tok.value) && tok.offset <= sourceOffset) {
						if (isRootLayer) {
							wordRange = { start: document.positionAt(tok.offset), end: document.positionAt(tok.endOffset) };
						} else {
							for (const [genStart, genEnd] of mapper.toGeneratedRange(tok.offset, tok.endOffset, false)) {
								wordRange = { start: document.positionAt(genStart), end: document.positionAt(genEnd) };
								break;
							}
						}
					}

					return {
						isIncomplete: false,
						items: keywords.map(keyword => ({
							label: keyword,
							kind: 14, // Keyword
							sortText: '9' + keyword, // parity: old weight 800, below symbols
							commitCharacters: [' '],
							textEdit: { range: wordRange, newText: keyword },
						})) as never[],
					};
				},
			};
		},
	};
}

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

// parity: completions.imba CT.StyleProp → checker.styleprops (imbacss
// namespace exports; full names carry @alias abbreviations, abbreviation
// entries carry @proxy back-references shown as the qualifier)
function stylePropertyItems(context: LanguageServiceContext, typescript: typeof ts, range: LspRange) {
	const program = getTypeScriptService(context)?.getProgram();
	if (!program) {
		return;
	}
	const checker = program.getTypeChecker();
	const items = [];
	for (const symbol of findGlobalNamespaceExports(typescript, program, checker, 'imbacss')) {
		const raw = symbol.escapedName as string;
		// old isStyleProp: /^[a-zA-ZΞ]/ — excludes α modifiers, Ψ types, _ base
		if (!/^[a-zA-ZΞ]/.test(raw) || raw === '_') {
			continue;
		}
		const name = toImbaIdentifier(raw);
		const proxy = tagText(symbol, checker, 'proxy');
		const alias = tagText(symbol, checker, 'alias');
		const docs = symbol
			.getDocumentationComment(checker)
			.map(part => part.text)
			.join('');
		items.push({
			label: name,
			kind: 10, // Property
			sortText: '1' + name,
			detail: proxy ? `→ ${toImbaIdentifier(proxy)}` : alias ? `alias: ${toImbaIdentifier(alias)}` : undefined,
			documentation: docs ? { kind: 'markdown' as const, value: toImbaIdentifier(docs) } : undefined,
			commitCharacters: [':'],
			textEdit: { range, newText: name },
		});
	}
	return { isIncomplete: false, items: items as never[] };
}

// parity: completions.imba stylevar()/stylecolorvar() via
// ils.findImbaTokensOfType — but across ALL program imba files (the old
// plugin only saw open scripts). Forcing monarchDoc tokenizes each file
// once; instances are recreated (and re-lexed) only when a file changes.
function styleVarItems(context: LanguageServiceContext, currentFile: string, range: LspRange) {
	const program = getTypeScriptService(context)?.getProgram();
	if (!program) {
		return [];
	}
	const seen = new Set<string>();
	const items = [];
	for (const sourceFile of program.getSourceFiles()) {
		if (!sourceFile.fileName.endsWith('.imba')) {
			continue;
		}
		const root = context.language.scripts.get(URI.file(sourceFile.fileName))?.generated?.root;
		if (!(root instanceof ImbaVirtualCode)) {
			continue;
		}
		for (const token of root.monarchDoc.getMatchingTokens('style.property.var')) {
			if (seen.has(token.value)) {
				continue;
			}
			seen.add(token.value);
			const local = root.fileName === currentFile;
			items.push({
				label: token.value,
				kind: 6, // Variable
				sortText: '0' + token.value,
				detail: local ? undefined : path.basename(root.fileName),
				commitCharacters: [' '],
				textEdit: { range, newText: token.value },
			});
		}
	}
	return items;
}

// parity: completions.imba decorators() — local @-vars in scope plus the
// imba builtins (α-prefixed exports of the stdlib module, e.g. @lazy/@bound).
// Workspace-exported decorators arrive with D13 auto-import work.
function decoratorItems(
	context: LanguageServiceContext,
	root: ImbaVirtualCode,
	offset: number,
	range: LspRange
) {
	const items: Record<string, unknown>[] = [];
	const seen = new Set<string>();

	for (const variable of root.monarchDoc.varsAtOffset(offset)) {
		if (variable.name.startsWith('@') && !seen.has(variable.name)) {
			seen.add(variable.name);
			items.push({
				label: variable.name,
				kind: 3, // Function
				sortText: '0' + variable.name,
				commitCharacters: [' ', '('],
				textEdit: { range, newText: variable.name },
			});
		}
	}

	const program = getTypeScriptService(context)?.getProgram();
	if (program) {
		const checker = program.getTypeChecker();
		for (const symbol of findModuleExportsByFileSuffix(program, checker, '/src/imba/imba.imba')) {
			const raw = symbol.escapedName as string;
			if (!raw.startsWith('α')) {
				continue;
			}
			const name = '@' + toImbaIdentifier(raw.slice(1));
			if (seen.has(name)) {
				continue;
			}
			seen.add(name);
			const docs = symbol
				.getDocumentationComment(checker)
				.map(part => part.text)
				.join('');
			items.push({
				label: name,
				kind: 3, // Function
				sortText: '1' + name,
				documentation: docs ? { kind: 'markdown' as const, value: toImbaIdentifier(docs) } : undefined,
				commitCharacters: [' ', '('],
				textEdit: { range, newText: name },
			});
		}
	}

	return { isIncomplete: false, items: items as never[] };
}

// parity: completions.imba stylevalue() → checker.stylevalues — the generated
// style typings declare each property's value keywords as interface members
// with docs; abbreviations resolve through @proxy to the full property
function styleValueItems(
	context: LanguageServiceContext,
	typescript: typeof ts,
	propertyName: string,
	range: LspRange
) {
	const program = getTypeScriptService(context)?.getProgram();
	if (!program) {
		return;
	}
	const checker = program.getTypeChecker();
	const exports = findGlobalNamespaceExports(typescript, program, checker, 'imbacss');
	const byName = new Map(exports.map(symbol => [symbol.escapedName as string, symbol]));

	let symbol = byName.get(toJSIdentifier(propertyName));
	for (let hops = 0; symbol && hops < 3; hops++) {
		const proxy = tagText(symbol, checker, 'proxy');
		if (!proxy) {
			break;
		}
		symbol = byName.get(toJSIdentifier(proxy)) ?? symbol;
		if (!tagText(symbol, checker, 'proxy')) {
			break;
		}
	}
	if (!symbol) {
		return;
	}

	const type = checker.getDeclaredTypeOfSymbol(symbol);
	const items = [];
	for (const prop of type.getProperties()) {
		const raw = prop.escapedName as string;
		if (raw === 'set' || /^[αΨ_]/.test(raw) || prop.flags & typescript.SymbolFlags.Method) {
			continue;
		}
		const name = toImbaIdentifier(raw);
		const docs = prop
			.getDocumentationComment(checker)
			.map(part => part.text)
			.join('');
		items.push({
			label: name,
			kind: 12, // Value
			// parity: old weighted '-'-prefixed values below the rest
			sortText: (name.startsWith('-') ? '2' : '1') + name,
			documentation: docs ? { kind: 'markdown' as const, value: toImbaIdentifier(docs) } : undefined,
			commitCharacters: [' '],
			textEdit: { range, newText: name },
		});
	}
	return { isIncomplete: false, items: items as never[] };
}

// parity: completions.imba CT.StyleModifier → checker.stylemods (α-prefixed
// imbacss exports; @detail carries the css selector equivalent)
function styleModifierItems(context: LanguageServiceContext, typescript: typeof ts, range: LspRange) {
	const program = getTypeScriptService(context)?.getProgram();
	if (!program) {
		return;
	}
	const checker = program.getTypeChecker();
	const items = [];
	for (const symbol of findGlobalNamespaceExports(typescript, program, checker, 'imbacss')) {
		const raw = symbol.escapedName as string;
		if (!raw.startsWith('α')) {
			continue;
		}
		const name = toImbaIdentifier(raw.slice(1));
		const detail = detailOf(symbol, checker);
		const docs = symbol
			.getDocumentationComment(checker)
			.map(part => part.text)
			.join('');
		items.push({
			label: '@' + name,
			filterText: name,
			kind: 23, // Event (matches the old 'event' kind for modifiers)
			sortText: '1' + name,
			detail: detail ? toImbaIdentifier(detail) : undefined,
			documentation: docs ? { kind: 'markdown' as const, value: toImbaIdentifier(docs) } : undefined,
			commitCharacters: [':', '=', ' '],
			textEdit: { range, newText: name },
		});
	}
	return { isIncomplete: false, items: items as never[] };
}

function tagText(symbol: ts.Symbol, checker: ts.TypeChecker, tagName: string): string | undefined {
	for (const tag of symbol.getJsDocTags(checker)) {
		if (tag.name === tagName) {
			return (tag.text ?? []).map(part => part.text).join('');
		}
	}
	return undefined;
}

// parity: completions.imba tagattrs() + patches.imba isTagAttr — settable,
// non-readonly properties of the element type; HTMLElementTagNameMap covers
// custom tags too via the compiler's per-tag declare-global merge
function tagAttrItems(
	context: LanguageServiceContext,
	typescript: typeof ts,
	elementSymbol: ts.Symbol,
	range: LspRange
) {
	const program = getTypeScriptService(context)?.getProgram();
	if (!program) {
		return;
	}
	const checker = program.getTypeChecker();
	const declaration = elementSymbol.valueDeclaration ?? elementSymbol.declarations?.[0];
	if (!declaration) {
		return;
	}
	const elementType = checker.getTypeOfSymbolAtLocation(elementSymbol, declaration);

	const items = [];
	for (const prop of elementType.getApparentProperties()) {
		const raw = prop.escapedName as string;
		if (/^(α|Ψ|__|on[a-z])/.test(raw) || raw === 'className' || raw.endsWith('__')) {
			continue;
		}
		const settable =
			prop.flags & (typescript.SymbolFlags.Property | typescript.SymbolFlags.SetAccessor) &&
			!(prop.flags & (typescript.SymbolFlags.Method | typescript.SymbolFlags.Function));
		if (!settable) {
			continue;
		}
		const decl = prop.valueDeclaration ?? prop.declarations?.[0];
		if (!decl) {
			continue;
		}
		// skip readonly + event-handler interface noise
		if (typescript.getCombinedModifierFlags(decl) & typescript.ModifierFlags.Readonly) {
			continue;
		}
		const owner = decl.parent;
		if (typescript.isInterfaceDeclaration(owner) && owner.name.text === 'GlobalEventHandlers') {
			continue;
		}
		const name = toImbaIdentifier(raw);
		const type = checker.getTypeOfSymbolAtLocation(prop, decl);
		const summary = summaryOf(prop, checker);
		items.push({
			label: name,
			kind: 10, // Property
			sortText: '1' + name,
			detail: toImbaIdentifier(checker.typeToString(type)),
			documentation: summary ? { kind: 'markdown' as const, value: toImbaIdentifier(summary) } : undefined,
			commitCharacters: ['='],
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
