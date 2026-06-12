import { describe, expect, it } from 'vitest';
import * as ts from 'typescript';
import { computeChangeRange, ImbaVirtualCode } from '../src/index';

// G3 — generated snapshots report real change ranges so TS parses
// incrementally instead of re-parsing the whole virtual file per edit

function apply(oldText: string, range: { span: { start: number; length: number }; newLength: number }, newText: string): string {
	// reconstruct newText from oldText + range to verify correctness
	const inserted = newText.slice(range.span.start, range.span.start + range.newLength);
	return oldText.slice(0, range.span.start) + inserted + oldText.slice(range.span.start + range.span.length);
}

describe('G3: computeChangeRange', () => {
	const cases: [string, string][] = [
		['hello world', 'hello brave world'], // insert
		['hello brave world', 'hello world'], // delete
		['let x = 1', 'let x = 2'], // replace
		['aaa', 'aa'], // prefix/suffix overlap (classic off-by-one trap)
		['aa', 'aaa'],
		['', 'abc'],
		['abc', ''],
		['same', 'same'],
		['const a = 1;\nconst b = 2;\n', 'const a = 1;\nconst c = 3;\nconst b = 2;\n'],
	];

	for (const [oldText, newText] of cases) {
		it(`round-trips ${JSON.stringify(oldText)} → ${JSON.stringify(newText)}`, () => {
			const range = computeChangeRange(oldText, newText);
			expect(apply(oldText, range, newText)).toBe(newText);
			expect(range.span.start).toBeGreaterThanOrEqual(0);
			expect(range.span.length).toBeGreaterThanOrEqual(0);
			expect(range.newLength).toBeGreaterThanOrEqual(0);
		});
	}

	it('virtual code snapshots report ranges between generations', () => {
		const v1 = new ImbaVirtualCode('/x/cr.imba', ts.ScriptSnapshot.fromString('let a = 1\n'));
		const v2 = new ImbaVirtualCode('/x/cr.imba', ts.ScriptSnapshot.fromString('let a = 1\nlet b = 2\n'));
		const range = v2.tsCode.snapshot.getChangeRange(v1.tsCode.snapshot);
		expect(range).toBeTruthy();
		const oldJs = v1.tsCode.snapshot.getText(0, v1.tsCode.snapshot.getLength());
		const newJs = v2.tsCode.snapshot.getText(0, v2.tsCode.snapshot.getLength());
		expect(apply(oldJs, range!, newJs)).toBe(newJs);
		// foreign snapshots stay safe
		expect(v2.tsCode.snapshot.getChangeRange(ts.ScriptSnapshot.fromString('x'))).toBeUndefined();
	});
});
