import type { CodeMapping, IScriptSnapshot, TextChangeRange, VirtualCode } from '@volar/language-core';
import * as monarchModule from 'imba-monarch';
import { compileImba, type ImbaCompilation } from './compiler';
import { spansToMappings, IDENTITY_FEATURES } from './mappings';

type ImbaScriptInfo = import('imba-monarch').default;

// imba-monarch is a CJS bundle; default-import interop differs between plain
// node (tsc CJS emit) and ESM transforms (vitest/vite-node) — resolve the
// constructor defensively so both work.
const ImbaScriptInfo: new (owner: { fileName: string }, code: string) => ImbaScriptInfo =
	(monarchModule as any).default?.default ?? (monarchModule as any).default ?? (monarchModule as any);

/**
 * Root virtual code: mirrors the .imba source 1:1 (identity mapping), so
 * imba-side service plugins (parse diagnostics, and in M2 hover/completions/
 * semantic tokens) always have a visitable document in source coordinates —
 * even when compilation fails and the TS child has no mappings.
 *
 * The generated TypeScript lives in `embeddedCodes[0]` ('ts'); its span
 * mappings target the source script directly. This is the same root/child
 * shape Vue uses for SFCs.
 */
export class ImbaVirtualCode implements VirtualCode {
	id = 'root';
	languageId = 'imba';
	snapshot: IScriptSnapshot;
	mappings: CodeMapping[];
	embeddedCodes: VirtualCode[];
	compilation: ImbaCompilation;

	constructor(
		public fileName: string,
		sourceSnapshot: IScriptSnapshot
	) {
		const source = sourceSnapshot.getText(0, sourceSnapshot.getLength());
		this.compilation = compileImba(fileName, source);

		this.snapshot = sourceSnapshot;
		this.mappings = [
			{
				sourceOffsets: [0],
				generatedOffsets: [0],
				lengths: [source.length],
				data: IDENTITY_FEATURES,
			},
		];

		this.embeddedCodes = [
			{
				id: 'ts',
				languageId: 'typescript',
				snapshot: createGeneratedSnapshot(this.compilation.js),
				mappings: spansToMappings(this.compilation.spans),
			},
		];
	}

	get tsCode(): VirtualCode {
		return this.embeddedCodes[0];
	}

	#monarchDoc?: ImbaScriptInfo;

	/**
	 * Fault-tolerant token/scope model from imba-monarch — drives the
	 * imba-side features (semantic tokens, document symbols, completion
	 * contexts). Lazy: only files an editor actually touches pay for it.
	 */
	get monarchDoc(): ImbaScriptInfo {
		return (this.#monarchDoc ??= new ImbaScriptInfo(
			{ fileName: this.fileName },
			this.snapshot.getText(0, this.snapshot.getLength())
		));
	}
}

interface GeneratedSnapshot extends IScriptSnapshot {
	__imbaGenerated?: string;
}

/**
 * Generated-TS snapshot with real change ranges (G3): TS reuses the
 * unchanged AST around the edit instead of re-parsing the whole virtual
 * file on every keystroke. parity: the old plugin's fast-diff trick, done
 * with a dependency-free common prefix/suffix span.
 */
function createGeneratedSnapshot(js: string): IScriptSnapshot {
	const snapshot: GeneratedSnapshot = {
		__imbaGenerated: js,
		getText: (start, end) => js.substring(start, end),
		getLength: () => js.length,
		getChangeRange(old) {
			const oldJs = (old as GeneratedSnapshot).__imbaGenerated;
			return typeof oldJs === 'string' ? computeChangeRange(oldJs, js) : undefined;
		},
	};
	return snapshot;
}

export function computeChangeRange(oldText: string, newText: string): TextChangeRange {
	if (oldText === newText) {
		return { span: { start: 0, length: 0 }, newLength: 0 };
	}
	const minLength = Math.min(oldText.length, newText.length);
	let prefix = 0;
	while (prefix < minLength && oldText.charCodeAt(prefix) === newText.charCodeAt(prefix)) {
		prefix++;
	}
	let suffix = 0;
	while (
		suffix < minLength - prefix &&
		oldText.charCodeAt(oldText.length - 1 - suffix) === newText.charCodeAt(newText.length - 1 - suffix)
	) {
		suffix++;
	}
	return {
		span: { start: prefix, length: oldText.length - prefix - suffix },
		newLength: newText.length - prefix - suffix,
	};
}
