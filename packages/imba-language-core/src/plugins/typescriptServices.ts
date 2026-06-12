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

function wrapPlugin(base: LanguageServicePlugin): LanguageServicePlugin {
	return {
		...base,
		create(context) {
			const instance = base.create(context);
			const provideDiagnostics = instance.provideDiagnostics?.bind(instance);
			if (!provideDiagnostics) {
				return instance;
			}
			return {
				...instance,
				async provideDiagnostics(document, token) {
					const result = await provideDiagnostics(document, token);
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
						kept.push(diag);
					}
					return kept;
				},
			};
		},
	};
}
