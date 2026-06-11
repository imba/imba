import type { CodeMapping, IScriptSnapshot, VirtualCode } from '@volar/language-core';
import { compileImba, type ImbaCompilation } from './compiler';
import { spansToMappings } from './mappings';

export class ImbaVirtualCode implements VirtualCode {
	id = 'root';
	languageId = 'typescript';
	snapshot: IScriptSnapshot;
	mappings: CodeMapping[];
	compilation: ImbaCompilation;

	constructor(
		public fileName: string,
		public sourceSnapshot: IScriptSnapshot
	) {
		const source = sourceSnapshot.getText(0, sourceSnapshot.getLength());
		this.compilation = compileImba(fileName, source);
		this.mappings = spansToMappings(this.compilation.spans);

		const js = this.compilation.js;
		this.snapshot = {
			getText: (start, end) => js.substring(start, end),
			getLength: () => js.length,
			getChangeRange: () => undefined,
		};
	}
}
