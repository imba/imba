import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { TextEdit } from '@volar/language-service';
import { createFixtureLanguageService, locate } from './harness';

// parity: D4 — completions.imba CT.TagEvent / CT.TagEventModifier branches.
// One fixture per caret state: parse-recovered states behave differently from
// final states (the $CARET$ lesson), so each is pinned in isolation.

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');

function applyEdit(source: string, edit: { newText: string; range?: TextEdit['range']; insert?: TextEdit['range'] }): string {
	const range = edit.range ?? edit.insert!;
	const lines = source.split('\n');
	const offsetOf = (pos: { line: number; character: number }) =>
		lines.slice(0, pos.line).reduce((n, l) => n + l.length + 1, 0) + pos.character;
	return source.slice(0, offsetOf(range.start)) + edit.newText + source.slice(offsetOf(range.end));
}

describe('M2/D4: event name + modifier completions', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	async function itemsAt(file: string, needle: string, triggerCharacter: string) {
		const fullPath = path.join(fixtureDir, file);
		const loc = locate(fullPath, needle, needle.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 2, triggerCharacter });
		return { list, fullPath };
	}

	it('@ offers event names with type details and docs', async () => {
		const { list, fullPath } = await itemsAt('ev-at.imba', '<div @', '@');
		const labels = list.items.map(i => String(i.label));
		expect(labels).toContain('@click');
		expect(labels).toContain('@intersect');
		expect(labels).toContain('@touch');

		const click = list.items.find(i => String(i.label) === '@click')!;
		expect(click.detail).toContain('MouseEvent');
		// accepting inserts the bare name after the typed @
		const applied = applyEdit(fs.readFileSync(fullPath, 'utf8'), click.textEdit as never);
		expect(applied).toContain('<div @click>');
	});

	it('partial event name is replaced by exact token range', async () => {
		const { list, fullPath } = await itemsAt('ev-partial.imba', '<div @cl', '');
		const click = list.items.find(i => String(i.label) === '@click')!;
		expect(click, '@click should match partial @cl').toBeTruthy();
		const applied = applyEdit(fs.readFileSync(fullPath, 'utf8'), click.textEdit as never);
		expect(applied).toContain('<div @click>');
		expect(applied).not.toContain('@@');
		expect(applied).not.toContain('clcl');
	});

	it('. after an event offers its modifiers with docs, excluding options', async () => {
		const { list, fullPath } = await itemsAt('mod-dot.imba', '<div @click.', '.');
		const labels = list.items.map(i => String(i.label));
		expect(labels).toContain('silent');
		expect(labels).toContain('prevent');
		expect(labels).toContain('stop');
		expect(labels).not.toContain('options');

		const silent = list.items.find(i => String(i.label) === 'silent')!;
		expect(JSON.stringify(silent.documentation).toLowerCase()).toContain('commit');
		const applied = applyEdit(fs.readFileSync(fullPath, 'utf8'), silent.textEdit as never);
		expect(applied).toContain('<div @click.silent>');
	});

	it('partial modifier name is replaced by exact token range', async () => {
		const { list, fullPath } = await itemsAt('mod-partial.imba', '<div @click.si', '');
		const silent = list.items.find(i => String(i.label) === 'silent')!;
		expect(silent, 'silent should match partial .si').toBeTruthy();
		const applied = applyEdit(fs.readFileSync(fullPath, 'utf8'), silent.textEdit as never);
		expect(applied).toContain('<div @click.silent>');
	});

	it('touch modifiers convert encoded names (moved-x) and carry detail signatures', async () => {
		const { list } = await itemsAt('mod-touch.imba', '<div @touch.', '.');
		const labels = list.items.map(i => String(i.label));
		expect(labels).toContain('moved-x');
		expect(labels).toContain('reframe');
		expect(labels).toContain('meta');
		for (const label of labels) {
			expect(label).not.toMatch(/[αΞ]/);
		}
		const hold = list.items.find(i => String(i.label) === 'hold');
		expect(hold?.detail).toContain('(');
	});
});
