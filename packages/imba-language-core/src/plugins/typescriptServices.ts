import type { LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
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
