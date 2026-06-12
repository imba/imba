import { setProjectCompilerEnabled } from './projectCompiler';

// parity: F3 — the old plugin's configurePlugin/ipc settings, as plain LSP
// configuration. The module-global config matches how the rest of the core
// holds session state (project-compiler flag, tag index); the server applies
// updates from initializationOptions and didChangeConfiguration.

export interface ImbaToolingConfig {
	/** A10: compile with the project's own imba version (old default: false) */
	useImbaFromProject: boolean;
	/** B5: ≥2 keeps rule-suppressed TS diagnostics visible as warnings */
	debugLevel: number;
	/** E6: 'imba' = monarch symbols only; 'project' adds ts/js results */
	workspaceSymbolsScope: 'imba' | 'project';
}

export const DEFAULT_CONFIG: ImbaToolingConfig = {
	useImbaFromProject: false,
	debugLevel: 0,
	workspaceSymbolsScope: 'project',
};

let current: ImbaToolingConfig = { ...DEFAULT_CONFIG };

export function getImbaConfig(): ImbaToolingConfig {
	return current;
}

/**
 * Normalize a raw settings object (`imba.*` section, initializationOptions,
 * or test input) and apply side effects. Unknown fields are ignored; missing
 * fields keep their defaults — a partial update resets unspecified keys, so
 * callers always pass the full section.
 */
export function applyImbaConfig(raw: unknown): ImbaToolingConfig {
	const source = (raw ?? {}) as Record<string, unknown>;
	const scope = source.workspaceSymbolsScope ?? (source.workspaceSymbols as Record<string, unknown> | undefined)?.scope;
	current = {
		useImbaFromProject: source.useImbaFromProject === true,
		debugLevel: typeof source.debugLevel === 'number' && Number.isFinite(source.debugLevel) ? source.debugLevel : 0,
		workspaceSymbolsScope: scope === 'imba' ? 'imba' : 'project',
	};
	setProjectCompilerEnabled(current.useImbaFromProject);
	return current;
}
