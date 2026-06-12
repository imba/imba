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
		/** space-separated alternatives, e.g. 'tag.event.name tag.event-modifier.name' */
		match(types: string | RegExp): boolean;
		next?: MonarchToken | null;
		prev?: MonarchToken | null;
	}

	/** context object from getContextAtOffset (meta fields merged onto it) */
	export interface MonarchContext {
		token?: MonarchToken | null;
		eventName?: string;
		eventModifierName?: string;
		tagName?: string;
		tagAttrName?: string;
	}

	export interface MonarchOutlineSpan {
		start: number;
		length: number;
	}

	/** tsserver NavigationTree-shaped item from getOutline() */
	export interface MonarchOutlineItem {
		text?: string;
		name?: string;
		kind?: string | number;
		kindModifiers?: string;
		spans?: MonarchOutlineSpan[];
		nameSpan?: MonarchOutlineSpan;
		childItems?: MonarchOutlineItem[];
	}

	export default class ImbaScriptInfo {
		constructor(owner: { fileName: string }, code: string | unknown);
		tokens: MonarchToken[];
		getOutline(walker?: unknown): MonarchOutlineItem;
		getContextAtOffset(offset: number, forwardLooking?: boolean): MonarchContext;
		varsAtOffset(offset: number, globals?: boolean): unknown[];
	}
}
