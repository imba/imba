import type { CodeMapping, IScriptSnapshot, VirtualCode } from '@volar/language-core';
import ImbaScriptInfo from 'imba-monarch';
import { compileImba, type ImbaCompilation } from './compiler';
import { spansToMappings, EXACT_FEATURES } from './mappings';

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
				data: EXACT_FEATURES,
			},
		];

		const js = this.compilation.js;
		this.embeddedCodes = [
			{
				id: 'ts',
				languageId: 'typescript',
				snapshot: {
					getText: (start, end) => js.substring(start, end),
					getLength: () => js.length,
					getChangeRange: () => undefined,
				},
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
