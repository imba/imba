import type { LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
import * as monarchModule from 'imba-monarch';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { create as createBaseTypeScriptServices } from 'volar-service-typescript';
import { toImbaIdentifier, toImbaString } from '../conversion';
import { getTagIndex } from '../tagIndex';
import { ImbaVirtualCode } from '../virtualCode';
import { filterTsDiagnostic } from './tsDiagnosticRules';

// defensive CJS/ESM interop, same as virtualCode.ts
const CompletionTypes: typeof import('imba-monarch').CompletionTypes =
	(monarchModule as any).CompletionTypes ?? (monarchModule as any).default?.CompletionTypes;

const NO_EXPORTED_MEMBER = /has no exported member '([^']+)'/;

/**
 * The compiler's tsc target registers tag classes globally (namespace Global
 * + declare global) but does NOT export them as module members — while the
 * runtime target does. A user-written `import { my-tag } from './x'` is
 * therefore correct at runtime but a false 2305 in the type world. Suppress
 * when the named member is a known workspace tag. Compiler follow-up tracked
 * in PLAN A9: export tag classes from the module in the tsc target too.
 */
function isKnownTagImport(context: LanguageServiceContext, message: string): boolean {
	const match = message.match(NO_EXPORTED_MEMBER);
	if (!match) {
		return false;
	}
	const name = toImbaIdentifier(match[1]);
	const roots = (context.env.workspaceFolders ?? [])
		.filter(uri => uri.scheme === 'file')
		.map(uri => uri.fsPath);
	const index = getTagIndex(roots);
	index.refresh();
	return index.tags.some(tag => tag.name === name);
}

/**
 * volar-service-typescript with imba presentation applied:
 * - suppression/downgrade rules for TS noise on imba-backed documents
 *   (parity: diagnostics.imba Rules + patches.imba filterDiagnostics)
 * - compiler-encoded identifiers (Greek letters) converted back to imba
 *   names in diagnostic messages (parity: util.imba toImbaString — but per
 *   feature result, never whole-protocol)
 */
export function createTypeScriptServices(ts: typeof import('typescript')): LanguageServicePlugin[] {
	return createBaseTypeScriptServices(ts).map(wrapPlugin);
}

function isImbaBacked(context: LanguageServiceContext, documentUri: string): boolean {
	const decoded = context.decodeEmbeddedDocumentUri(URI.parse(documentUri));
	if (!decoded) {
		return false;
	}
	return context.language.scripts.get(decoded[0])?.generated?.root instanceof ImbaVirtualCode;
}

function inImbaCompletionContext(
	context: LanguageServiceContext,
	document: TextDocument,
	position: { line: number; character: number }
): boolean {
	if (!CompletionTypes) {
		return false;
	}
	const decoded = context.decodeEmbeddedDocumentUri(URI.parse(document.uri));
	if (!decoded) {
		return false;
	}
	const sourceScript = context.language.scripts.get(decoded[0]);
	const root = sourceScript?.generated?.root;
	if (!sourceScript || !(root instanceof ImbaVirtualCode)) {
		return false;
	}

	// the TS plugin runs on the embedded TS document — map the generated
	// position back to a source offset before asking monarch for flags
	let sourceOffset: number | undefined;
	if (decoded[1] === root.id) {
		sourceOffset = document.offsetAt(position);
	} else {
		const virtualCode = sourceScript.generated?.embeddedCodes.get(decoded[1]);
		if (!virtualCode) {
			return false;
		}
		const mapper = context.language.maps.get(virtualCode, sourceScript);
		for (const [mapped] of mapper.toSourceLocation(document.offsetAt(position))) {
			sourceOffset = mapped;
			break;
		}
	}
	if (sourceOffset === undefined) {
		return false;
	}
	const flags = root.monarchDoc.getContextAtOffset(sourceOffset)?.suggest?.flags ?? 0;
	return !!(
		flags &
		(CompletionTypes.TagName | CompletionTypes.TagEvent | CompletionTypes.TagEventModifier | CompletionTypes.TagProp)
	);
}

// parity: service.imba getDefinitionAndBoundSpan — "for convenience, hide
// certain definitions": when imba-source definitions exist, drop the parallel
// entries pointing into the shipped typings (imba.d.ts family). The old
// __new filtering is obsolete (current compiler emits real constructors).
const IMBA_TYPINGS_DTS = /\/typings\/(imba|styles)[^/]*\.d\.ts$/;

export function preferImbaDefinitions<T extends { targetUri?: unknown; uri?: unknown }>(links: T[]): T[] {
	const uriOf = (link: T) => String(link.targetUri ?? link.uri ?? '');
	const hasImbaSource = links.some(link => uriOf(link).endsWith('.imba'));
	if (!hasImbaSource) {
		return links;
	}
	const filtered = links.filter(link => {
		const uri = uriOf(link);
		return uri.endsWith('.imba') || !IMBA_TYPINGS_DTS.test(uri);
	});
	return filtered.length ? filtered : links;
}

const UNUSED_NAME = /^'([^']+)' is declared but/;

/**
 * parity: patches.imba filterDiagnostics — "hide the diagnostic if it doesnt
 * map perfectly" plus its mapped-text comparison. Volar's transform fallback-
 * maps unmappable ranges onto degenerate positions (compiler-generated
 * params/temporaries end up at 0:0), so we require a no-fallback range
 * mapping up front; for unused-declaration diagnostics we additionally
 * require the mapped source text to BE the reported name — a generated
 * handler param `e` mapping onto unrelated source text gets dropped, while
 * a user's own unused `do(e)` param maps onto its real `e` and stays.
 */
function mapsCleanly(
	context: LanguageServiceContext,
	documentUri: string,
	document: TextDocument,
	range: { start: { line: number; character: number }; end: { line: number; character: number } },
	message: string
): boolean {
	const decoded = context.decodeEmbeddedDocumentUri(URI.parse(documentUri));
	if (!decoded) {
		return true;
	}
	const sourceScript = context.language.scripts.get(decoded[0]);
	const virtualCode = sourceScript?.generated?.embeddedCodes.get(decoded[1]);
	if (!sourceScript || !virtualCode) {
		return true;
	}
	const mapper = context.language.maps.get(virtualCode, sourceScript);
	const start = document.offsetAt(range.start);
	const end = document.offsetAt(range.end);
	for (const [sourceStart, sourceEnd] of mapper.toSourceRange(start, end, false)) {
		const unused = message.match(UNUSED_NAME);
		if (unused) {
			const sourceText = sourceScript.snapshot.getText(sourceStart, sourceEnd);
			return sourceText === unused[1];
		}
		return true;
	}
	return false;
}

type HoverContents = NonNullable<
	Awaited<ReturnType<NonNullable<ReturnType<LanguageServicePlugin['create']>['provideHover']>>>
>['contents'];

function convertHoverContents(contents: HoverContents): HoverContents {
	if (typeof contents === 'string') {
		return toImbaString(contents);
	}
	if (Array.isArray(contents)) {
		return contents.map(item =>
			typeof item === 'string' ? toImbaString(item) : { ...item, value: toImbaString(item.value) }
		);
	}
	return { ...contents, value: toImbaString(contents.value) };
}

type CompletionItemLike = {
	insertText?: string;
	filterText?: string;
	textEdit?:
		| { newText: string; range: RangeLike }
		| { newText: string; insert: RangeLike; replace: RangeLike };
};
type RangeLike = { start: { line: number; character: number }; end: { line: number; character: number } };

function stripDotAccessor(document: TextDocument, item: CompletionItemLike): void {
	const edit = item.textEdit;
	if (!edit || !edit.newText.startsWith('.') || edit.newText.startsWith('..')) {
		return;
	}
	const first = 'range' in edit ? edit.range : edit.insert;
	const startOffset = document.offsetAt(first.start);
	if (document.getText().slice(startOffset, startOffset + 1) !== '.') {
		return;
	}
	// vol-service-ts SHARES range objects across all items of a list —
	// never mutate them; build fresh ranges/edits per item
	const advance = (range: RangeLike): RangeLike => ({
		start: document.positionAt(document.offsetAt(range.start) + 1),
		end: { ...range.end },
	});
	item.textEdit =
		'range' in edit
			? { ...edit, newText: edit.newText.slice(1), range: advance(edit.range) }
			: { ...edit, newText: edit.newText.slice(1), insert: advance(edit.insert), replace: advance(edit.replace) };
	if (item.insertText?.startsWith('.')) {
		item.insertText = item.insertText.slice(1);
	}
	if (item.filterText?.startsWith('.')) {
		item.filterText = item.filterText.slice(1);
	}
}

function wrapPlugin(base: LanguageServicePlugin): LanguageServicePlugin {
	return {
		...base,
		create(context) {
			const instance = base.create(context);
			const provideDiagnostics = instance.provideDiagnostics?.bind(instance);
			const provideHover = instance.provideHover?.bind(instance);
			const provideDocumentSymbols = instance.provideDocumentSymbols?.bind(instance);
			const provideCompletionItems = instance.provideCompletionItems?.bind(instance);
			const provideDefinition = instance.provideDefinition?.bind(instance);
			if (!provideDiagnostics && !provideHover && !provideDocumentSymbols && !provideCompletionItems && !provideDefinition) {
				return instance;
			}
			return {
				...instance,
				async provideDefinition(document, position, token) {
					const result = await provideDefinition?.(document, position, token);
					if (Array.isArray(result) && isImbaBacked(context, document.uri)) {
						return preferImbaDefinitions(result) as never;
					}
					return result;
				},
				async provideCompletionItems(document, position, completionContext, token) {
					// parity: the imba-specific completion contexts (tag names,
					// events, modifiers) are served EXCLUSIVELY by the imba
					// plugins — TS member completions at the mapped positions
					// (event-object properties, raw α-methods) are noise there
					if (inImbaCompletionContext(context, document, position)) {
						return undefined;
					}
					const result = await provideCompletionItems?.(document, position, completionContext, token);
					if (result && isImbaBacked(context, document.uri)) {
						for (const item of result.items) {
							// TS optional-chain completions insert `?.name`
							// (over a range including the dot); imba spells
							// it `..name`. Rebuild rather than mutate — edit
							// internals are shared across items.
							if (item.textEdit?.newText.startsWith('?.')) {
								item.textEdit = { ...item.textEdit, newText: '..' + item.textEdit.newText.slice(2) };
							}
							if (item.insertText?.startsWith('?.')) {
								item.insertText = '..' + item.insertText.slice(2);
							}
							if (typeof item.filterText === 'string' && item.filterText.startsWith('?.')) {
								item.filterText = '..' + item.filterText.slice(2);
							}
							// TS dot-accessor member completions ship `.name`
							// over a range that starts at the dot. VS Code's
							// native TS extension special-cases these; LSP
							// clients don't — once the user types more, the
							// range no longer contains the cursor and the
							// client's word-based fallback double-applies or
							// eats the dot. Normalize: dotless text, range
							// starting after the dot.
							stripDotAccessor(document, item);
						}
					}
					return result;
				},
				async provideDocumentSymbols(document, token) {
					// parity: getNavigationTree intercept — the monarch outline
					// REPLACES TS symbols for imba files (avoids duplicates and
					// container-mapped ranges violating the LSP containment
					// invariant); plain ts/js files keep TS symbols
					if (isImbaBacked(context, document.uri)) {
						return undefined;
					}
					return provideDocumentSymbols?.(document, token);
				},
				async provideDocumentSemanticTokens(document, range, legend, token) {
					// parity: getEncodedSemanticClassifications intercept —
					// monarch tokens replace TS classifications for imba files
					if (isImbaBacked(context, document.uri)) {
						return undefined;
					}
					return instance.provideDocumentSemanticTokens?.call(instance, document, range, legend, token);
				},
				async provideHover(document, position, token) {
					const hover = await provideHover?.(document, position, token);
					// parity: util.imba toImbaDisplayParts — convert encoded
					// identifiers in hover text (C2). Ω-prefixed internal
					// names are A9 territory and revisited there.
					if (hover?.contents) {
						hover.contents = convertHoverContents(hover.contents);
					}
					return hover;
				},
				async provideDiagnostics(document, token) {
					const result = await provideDiagnostics?.(document, token);
					if (!result) {
						return result;
					}
					const filter = isImbaBacked(context, document.uri);
					const kept = [];
					for (const diag of result) {
						const messageText = typeof diag.message === 'string' ? diag.message : diag.message.value;
						if (filter) {
							if (!mapsCleanly(context, document.uri, document, diag.range, messageText)) {
								continue;
							}
							if (Number(diag.code) === 2305 && isKnownTagImport(context, messageText)) {
								continue;
							}
							const verdict = filterTsDiagnostic({
								code: diag.code as number,
								message: messageText,
								text: document.getText(diag.range),
							});
							if (verdict === 'suppress') {
								continue;
							}
							if (verdict === 'downgrade' && (diag.severity ?? 1) === 1) {
								diag.severity = 2;
							}
						}
						if (typeof diag.message === 'string') {
							diag.message = toImbaString(diag.message);
						} else {
							diag.message.value = toImbaString(diag.message.value);
						}
						for (const info of diag.relatedInformation ?? []) {
							info.message = toImbaString(info.message);
						}
						kept.push(diag);
					}
					return kept;
				},
			};
		},
	};
}
