import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: D6 — completions.imba stylevar()/stylecolorvar(), but workspace-
// wide (program files) instead of open-scripts-only

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const usePath = path.join(fixtureDir, 'style-vars-use.imba');

function applyEdit(source: string, edit: Record<string, unknown>): string {
	const range = (edit.range ?? edit.insert) as { start: { line: number; character: number }; end: { line: number; character: number } };
	const lines = source.split('\n');
	const offsetOf = (pos: { line: number; character: number }) =>
		lines.slice(0, pos.line).reduce((n, l) => n + l.length + 1, 0) + pos.character;
	return source.slice(0, offsetOf(range.start)) + String(edit.newText) + source.slice(offsetOf(range.end));
}

describe('M2/D6: style var completions', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('offers $-vars declared in OTHER files at colorvar positions', async () => {
		const loc = locate(usePath, 'color: $ac', 'color: $ac'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const accent = list.items.find(i => String(i.label) === '$accent');
		expect(accent, '$accent (declared in style-vars.imba) should be offered').toBeTruthy();
		expect(accent!.detail).toContain('style-vars.imba');

		const applied = applyEdit(fs.readFileSync(usePath, 'utf8'), accent!.textEdit as never);
		expect(applied).toContain('color: $accent');
		expect(applied).not.toContain('$$');
	});

	it('merges --vars into value completions alongside property keywords', async () => {
		const loc = locate(usePath, 'margin: --g', 'margin: --g'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const labels = list.items.map(i => String(i.label));
		expect(labels).toContain('--gap'); // cross-file var
		expect(labels).toContain('auto'); // margin keyword still present

		const gap = list.items.find(i => String(i.label) === '--gap')!;
		const applied = applyEdit(fs.readFileSync(usePath, 'utf8'), gap.textEdit as never);
		expect(applied).toContain('margin: --gap');
		expect(applied).not.toContain('----');
	});
});
