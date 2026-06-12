import type { LanguageServicePlugin } from '@volar/language-service';
import { URI } from 'vscode-uri';
import { ImbaVirtualCode } from '../virtualCode';

// parity: typescript-imba-plugin script.imba getImbaDiagnostics — but live on
// every change instead of save-gated, and straight from the stored compilation
// instead of re-deriving through the mapper.

function toSeverity(raw: unknown): 1 | 2 | 3 | 4 {
	if (typeof raw === 'number' && raw >= 1 && raw <= 4) {
		return raw as 1 | 2 | 3 | 4;
	}
	if (raw === 'warning') {
		return 2;
	}
	if (raw === 'info') {
		return 3;
	}
	return 1;
}

export function createImbaDiagnosticsPlugin(): LanguageServicePlugin {
	return {
		name: 'imba-diagnostics',
		capabilities: {
			diagnosticProvider: {
				interFileDependencies: false,
				workspaceDiagnostics: false,
			},
		},
		create(context) {
			return {
				provideDiagnostics(document) {
					if (document.languageId !== 'imba') {
						return;
					}
					// plugins are invoked with embedded documents; the imba
					// root virtual code is identity-mapped to the source, so
					// ranges below are in source coordinates already
					const decoded = context.decodeEmbeddedDocumentUri(URI.parse(document.uri));
					if (!decoded) {
						return;
					}
					const root = context.language.scripts.get(decoded[0])?.generated?.root;
					if (!(root instanceof ImbaVirtualCode) || decoded[1] !== root.id) {
						return;
					}
					return root.compilation.diagnostics.map(d => ({
						// offsets are authoritative; line/character from the
						// compiler can be stale relative to the live document
						range: {
							start: document.positionAt(d.range.start.offset),
							end: document.positionAt(d.range.end.offset),
						},
						severity: toSeverity(d.severity),
						message: d.message,
						source: d.source ?? 'imba',
					}));
				},
			};
		},
	};
}
