import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// Reading a predicate member (`note.readable?`) calls a method with no
// arguments at runtime, so the compiler's tsc output types the read as the
// method's return value - and as a missing-argument error when the method
// has required parameters.

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');
const predicatesImba = path.join(fixtureDir, 'predicates.imba');
const source = fs.readFileSync(predicatesImba, 'utf8');

function textAt(range: { start: { line: number; character: number }; end: { line: number; character: number } }): string {
	const line = source.split('\n')[range.start.line];
	return line.slice(range.start.character, range.end.line === range.start.line ? range.end.character : undefined);
}

describe('predicate member reads', () => {
	const ls = createFixtureLanguageService(tsconfigPath);

	it('types reads as the value, and reports methods that need arguments', async () => {
		const diags = (await ls.getDiagnostics(locate(predicatesImba, 'class Note').uri)) ?? [];
		const errors = diags.filter(d => d.severity === 1);

		// every read assigned to a `\boolean` checks out - only the two
		// deliberate reads of `writable? by` fail, on the source access
		expect(errors.map(d => `${d.code} ${textAt(d.range)}`)).toEqual([
			'2554 note.writable?',
			'2554 writable?',
		]);
		expect(errors[0].range.start.line).toBe(locate(predicatesImba, 'export const missing').position.line);
		expect(errors[1].range.start.line).toBe(locate(predicatesImba, 'let e = writable?').position.line);
	});

	it('keeps hover and go-to-def on the member', async () => {
		const definition = locate(predicatesImba, 'readable? by');
		for (const needle of ['note.readable?', 'self.readable?', 'super.readable?']) {
			const loc = locate(predicatesImba, needle, needle.indexOf('readable'));
			const hover = await ls.getHover(loc.uri, loc.position);
			expect(JSON.stringify(hover ?? ''), needle).toContain('readable?(by?: string): boolean');

			const defs = (await ls.getDefinition(loc.uri, loc.position)) ?? [];
			expect(defs.length, needle).toBeGreaterThan(0);
			expect(defs[0].targetSelectionRange.start, needle).toEqual(definition.position);
		}
	});
});
