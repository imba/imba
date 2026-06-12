import type { LanguagePlugin } from '@volar/language-core';
import type {} from '@volar/typescript';
import { ImbaVirtualCode } from './virtualCode';

/** Accepts both string fileNames (tsserver plugin mode) and URI objects (language server mode). */
export interface ScriptIdLike {
	fsPath?: string;
	toString(): string;
}

export function isImbaScriptId(scriptId: ScriptIdLike | string): boolean {
	return String(scriptId).toLowerCase().endsWith('.imba');
}

function scriptIdToFileName(scriptId: ScriptIdLike | string): string {
	if (typeof scriptId === 'string') {
		return scriptId;
	}
	if (typeof scriptId.fsPath === 'string') {
		return scriptId.fsPath;
	}
	return scriptId.toString();
}

export function createImbaLanguagePlugin<T extends ScriptIdLike | string>(): LanguagePlugin<T, ImbaVirtualCode> {
	return {
		getLanguageId(scriptId) {
			return isImbaScriptId(scriptId) ? 'imba' : undefined;
		},
		createVirtualCode(scriptId, languageId, snapshot) {
			if (languageId !== 'imba') {
				return undefined;
			}
			return new ImbaVirtualCode(scriptIdToFileName(scriptId), snapshot);
		},
		typescript: {
			extraFileExtensions: [
				// 'web.imba' before 'imba': platform variants win when both
				// exist, matching the old plugin's moduleSuffixes order
				// ['.web.imba', '.imba', '']
				{
					extension: 'web.imba',
					isMixedContent: false,
					scriptKind: 7, // ts.ScriptKind.Deferred
				},
				{
					extension: 'imba',
					isMixedContent: false,
					scriptKind: 7, // ts.ScriptKind.Deferred
				},
			],
			// Makes extensionless `import './foo'` resolve to foo.imba: TS
			// probes foo.d.ts, Volar answers yes when foo.imba exists and
			// rewrites the resolution to the .imba source.
			resolveHiddenExtensions: true,
			getServiceScript(root) {
				return {
					code: root,
					extension: '.ts',
					scriptKind: 3, // ts.ScriptKind.TS
				};
			},
		},
	};
}
