import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: D8 — completions.imba decorators() (stdlib builtins; local @-vars)

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');

function applyEdit(source: string, edit: Record<string, unknown>): string {
	const range = (edit.range ?? edit.insert) as { start: { line: number; character: number }; end: { line: number; character: number } };
	const lines = source.split('\n');
	const offsetOf = (pos: { line: number; character: number }) =>
		lines.slice(0, pos.line).reduce((n, l) => n + l.length + 1, 0) + pos.character;
	return source.slice(0, offsetOf(range.start)) + String(edit.newText) + source.slice(offsetOf(range.end));
}

describe('M2/D8: decorator completions', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('offers stdlib builtin decorators with docs', async () => {
		const file = path.join(fixtureDir, 'deco.imba');
		const loc = locate(file, '@laz', '@laz'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const byLabel = new Map(list.items.map(i => [String(i.label), i]));

		expect(byLabel.has('@lazy')).toBe(true);
		expect(byLabel.has('@bound')).toBe(true);
		for (const label of byLabel.keys()) {
			expect(label).not.toMatch(/[αΨΞΦ]/);
		}

		const applied = applyEdit(fs.readFileSync(file, 'utf8'), byLabel.get('@lazy')!.textEdit as never);
		expect(applied).toContain('@lazy prop count');
		expect(applied).not.toContain('@@');
	});
});
