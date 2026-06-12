import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: D9 — types after `\`. The compiler's annotation spans cover `\str`
// in source but `str` in generated (off-by-one container → position features
// dead at type positions); spansToMappings now shifts verified
// backslash-spans to exact, so the whole TS type-position surface works.

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const typesFile = path.join(fixtureDir, 'types.imba');

describe('M3/D9: type positions', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('completes builtin types after a partial annotation', async () => {
		const loc = locate(typesFile, 'a\\str', 5);
		const result = await ls.getCompletionItems(loc.uri, loc.position);
		const item = result?.items.find(i => i.label === 'string');
		expect(item, 'string in type completions').toBeTruthy();
		// the edit replaces exactly the typed partial, not the backslash
		const edit = item!.textEdit as { replace: { start: { character: number }; end: { character: number } } };
		expect(edit.replace.start.character).toBe('def fn a\\'.length);
		expect(edit.replace.end.character).toBe('def fn a\\str'.length);
	});

	it('completes imported class types', async () => {
		const loc = locate(typesFile, 'b\\Poi', 5);
		const result = await ls.getCompletionItems(loc.uri, loc.position);
		expect(result?.items.some(i => i.label === 'Point')).toBe(true);
	});

	it('does not mix imba keywords into type positions', async () => {
		const loc = locate(typesFile, 'a\\str', 5);
		const result = await ls.getCompletionItems(loc.uri, loc.position);
		expect(result?.items.some(i => i.label === 'elif')).toBe(false);
	});

	it('hover works on type annotations', async () => {
		// (builtin keyword types like `string` give no TS quickInfo — same as
		// in plain .ts files — so assert on a named annotation)
		const loc = locate(typesFile, 'b\\Poi', 3);
		const hover = await ls.getHover(loc.uri, loc.position);
		expect(JSON.stringify(hover ?? '')).toContain('Poi');
		expect(hover?.range?.start.character).toBe('def gn b\\'.length);
	});
});
