import type { LanguageServicePlugin } from '@volar/language-service';
import type * as ts from 'typescript';
import { URI } from 'vscode-uri';
import { ImbaVirtualCode } from '../virtualCode';
import { findGlobalInterface, getTypeScriptService } from './checkerUtils';

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

export function createImbaDiagnosticsPlugin(typescript?: typeof ts): LanguageServicePlugin {
	return {
		name: 'imba-diagnostics',
		capabilities: {
			diagnosticProvider: {
				interFileDependencies: false,
				workspaceDiagnostics: false,
			},
		},
		create(context) {
			// F2 health check: a broken type environment used to read as a
			// cryptic 2339 cascade on every tag — surface ONE clear signal
			const healthByProgram = new WeakMap<ts.Program, boolean>();
			function environmentHealthy(): boolean {
				if (!typescript) {
					return true;
				}
				const program = getTypeScriptService(context)?.getProgram();
				if (!program) {
					return true;
				}
				let healthy = healthByProgram.get(program);
				if (healthy === undefined) {
					healthy = !!findGlobalInterface(typescript, program, program.getTypeChecker(), 'ImbaEvents');
					healthByProgram.set(program, healthy);
				}
				return healthy;
			}

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
					const diagnostics = root.compilation.diagnostics.map(d => ({
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
					if (root.compilation.error !== undefined) {
						// a compiler CRASH (not a parse diagnostic) was silent
						// before — surface it so the dead file explains itself
						const message = root.compilation.error instanceof Error
							? root.compilation.error.message
							: String(root.compilation.error);
						diagnostics.unshift({
							range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
							severity: 1,
							source: 'imba',
							message: `imba compiler crashed on this file: ${message}`,
						});
					}
					if (!environmentHealthy()) {
						diagnostics.unshift({
							range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
							severity: 2,
							source: 'imba',
							message:
								'imba types are not loaded for this project — checking and completions are degraded. ' +
								'Ensure the imba package (with typings/) is installed and resolvable.',
						});
					}
					return diagnostics;
				},
			};
		},
	};
}
