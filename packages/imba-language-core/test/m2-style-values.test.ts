import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: D5 slice 2 — completions.imba stylevalue() / checker.stylevalues

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');

function applyEdit(source: string, edit: Record<string, unknown>): string {
	const range = (edit.range ?? edit.insert) as { start: { line: number; character: number }; end: { line: number; character: number } };
	const lines = source.split('\n');
	const offsetOf = (pos: { line: number; character: number }) =>
		lines.slice(0, pos.line).reduce((n, l) => n + l.length + 1, 0) + pos.character;
	return source.slice(0, offsetOf(range.start)) + String(edit.newText) + source.slice(offsetOf(range.end));
}

describe('M2/D5 slice 2: style value completions', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('offers value keywords for abbreviated properties via @proxy', async () => {
		const file = path.join(fixtureDir, 'style-value.imba');
		const loc = locate(file, 'd: bl', 'd: bl'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const byLabel = new Map(list.items.map(i => [String(i.label), i]));

		// d → display via @proxy; members of the generated display interface
		expect(byLabel.has('block')).toBe(true);
		expect(byLabel.has('flex')).toBe(true);
		expect(byLabel.has('grid')).toBe(true);
		expect(byLabel.has('set'), 'setter machinery is not a value').toBe(false);
		expect(JSON.stringify(byLabel.get('block')!.documentation)).toContain('block-level');

		const applied = applyEdit(fs.readFileSync(file, 'utf8'), byLabel.get('block')!.textEdit as never);
		expect(applied).toContain('d: block');
	});

	it('offers value keywords for dashed full property names', async () => {
		const file = path.join(fixtureDir, 'style-value-dashed.imba');
		const loc = locate(file, 'align-items: ce', 'align-items: ce'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const center = list.items.find(i => String(i.label) === 'center');
		expect(center, 'center should be offered for align-items').toBeTruthy();
		const applied = applyEdit(fs.readFileSync(file, 'utf8'), center!.textEdit as never);
		expect(applied).toContain('align-items: center');
	});
});
