import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: D3 — completions.imba tagattrs() + the old isTagAttr filtering

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');

function applyEdit(source: string, edit: { newText: string; range?: never; insert?: never } & Record<string, unknown>): string {
	const range = (edit.range ?? edit.insert) as { start: { line: number; character: number }; end: { line: number; character: number } };
	const lines = source.split('\n');
	const offsetOf = (pos: { line: number; character: number }) =>
		lines.slice(0, pos.line).reduce((n, l) => n + l.length + 1, 0) + pos.character;
	return source.slice(0, offsetOf(range.start)) + edit.newText + source.slice(offsetOf(range.end));
}

describe('M2/D3: tag attribute completions', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('offers settable element properties on html tags, filtered', async () => {
		const file = path.join(fixtureDir, 'attr-html.imba');
		const loc = locate(file, '<input ti', '<input ti'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const labels = list.items.map(i => String(i.label));

		expect(labels).toContain('title');
		expect(labels).toContain('value');
		expect(labels).toContain('placeholder');
		// isTagAttr filtering: no event handlers, no className, no readonly
		expect(labels).not.toContain('onclick');
		expect(labels).not.toContain('className');
		expect(labels).not.toContain('validity'); // readonly on HTMLInputElement
		for (const label of labels) {
			expect(label).not.toMatch(/[αΨΦΞ]/);
		}

		const title = list.items.find(i => String(i.label) === 'title')!;
		const applied = applyEdit(fs.readFileSync(file, 'utf8'), title.textEdit as never);
		expect(applied).toContain('<input title>');
	});

	it('offers component props on custom tags (via the global tag-name map)', async () => {
		const file = path.join(fixtureDir, 'attr-custom.imba');
		const loc = locate(file, '<cool-widget mes', '<cool-widget mes'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const message = list.items.find(i => String(i.label) === 'message');
		expect(message, 'prop message should be offered').toBeTruthy();
		expect(message!.detail).toContain('string');

		const applied = applyEdit(fs.readFileSync(file, 'utf8'), message!.textEdit as never);
		expect(applied).toContain('<cool-widget message>');
	});
});
