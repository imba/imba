// Minimal typings for the imba-monarch document model (the package ships no
// declarations; it is actively evolving, so only the surface we consume is
// typed here). Imba `?`-suffixed getters compile to `Φ`-suffixed properties.
declare module 'imba-monarch' {
	export interface MonarchSym {
		name: string;
		semanticKind: string;
		globalΦ?: boolean;
		staticΦ?: boolean;
		importedΦ?: boolean;
		rootΦ?: boolean;
	}

	export interface MonarchToken {
		offset: number;
		endOffset: number;
		type: string;
		value: string;
		symbol?: MonarchSym | null;
	}

	export default class ImbaScriptInfo {
		constructor(owner: { fileName: string }, code: string | unknown);
		tokens: MonarchToken[];
		getOutline(walker?: unknown): unknown;
		getContextAtOffset(offset: number, forwardLooking?: boolean): unknown;
		varsAtOffset(offset: number, globals?: boolean): unknown[];
	}
}
