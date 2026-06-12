import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: D7 — mixin completions (old: tok.match('.mixin') special case +
// checker.getMixinReferences across open scripts; now program-wide)

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const usePath = path.join(fixtureDir, 'mixin-use.imba');

function applyEdit(source: string, edit: Record<string, unknown>): string {
	const range = (edit.range ?? edit.insert) as { start: { line: number; character: number }; end: { line: number; character: number } };
	const lines = source.split('\n');
	const offsetOf = (pos: { line: number; character: number }) =>
		lines.slice(0, pos.line).reduce((n, l) => n + l.length + 1, 0) + pos.character;
	return source.slice(0, offsetOf(range.start)) + String(edit.newText) + source.slice(offsetOf(range.end));
}

describe('M2/D7: mixin completions', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('offers mixins declared in other files at <tag% positions', async () => {
		const loc = locate(usePath, '%ca', '%ca'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const byLabel = new Map(list.items.map(i => [String(i.label), i]));

		expect(byLabel.has('card'), 'cross-file mixin card').toBe(true);
		expect(byLabel.has('pill'), 'cross-file mixin pill').toBe(true);
		expect(byLabel.get('card')!.detail).toContain('mixin-decl.imba');

		const applied = applyEdit(fs.readFileSync(usePath, 'utf8'), byLabel.get('card')!.textEdit as never);
		expect(applied).toContain('<div%card>');
		expect(applied).not.toContain('%%');
	});
});
