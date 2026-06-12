import type { LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { create as createBaseTypeScriptServices } from 'volar-service-typescript';
import { toImbaString } from '../conversion';
import { ImbaVirtualCode } from '../virtualCode';
import { filterTsDiagnostic } from './tsDiagnosticRules';

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

function wrapPlugin(base: LanguageServicePlugin): LanguageServicePlugin {
	return {
		...base,
		create(context) {
			const instance = base.create(context);
			const provideDiagnostics = instance.provideDiagnostics?.bind(instance);
			const provideHover = instance.provideHover?.bind(instance);
			const provideDocumentSymbols = instance.provideDocumentSymbols?.bind(instance);
			const provideCompletionItems = instance.provideCompletionItems?.bind(instance);
			if (!provideDiagnostics && !provideHover && !provideDocumentSymbols && !provideCompletionItems) {
				return instance;
			}
			return {
				...instance,
				async provideCompletionItems(document, position, completionContext, token) {
					const result = await provideCompletionItems?.(document, position, completionContext, token);
					if (result && isImbaBacked(context, document.uri)) {
						// TS optional-chain completions insert `?.name` (over a
						// range that includes the dot); imba spells it `..name`
						for (const item of result.items) {
							if (item.textEdit?.newText.startsWith('?.')) {
								item.textEdit.newText = '..' + item.textEdit.newText.slice(2);
							}
							if (item.insertText?.startsWith('?.')) {
								item.insertText = '..' + item.insertText.slice(2);
							}
							if (typeof item.filterText === 'string' && item.filterText.startsWith('?.')) {
								item.filterText = '..' + item.filterText.slice(2);
							}
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
