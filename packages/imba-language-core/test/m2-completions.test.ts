import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { TextEdit } from '@volar/language-service';
import { createFixtureLanguageService, locate } from './harness';

// Regression for Sindre's dev-host report: accepting RELUNIT after
// `FLAGS.RE` produced `FLAGS..RELUNIT`. The accepted item's textEdit,
// applied to the source, must yield exactly one dot.

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const probePath = path.join(fixtureDir, 'completion-probe.imba');

function applyEdit(source: string, edit: TextEdit | { newText: string; insert: TextEdit['range'] }): string {
	const range = 'range' in edit ? edit.range : edit.insert;
	const lines = source.split('\n');
	const offsetOf = (pos: { line: number; character: number }) =>
		lines.slice(0, pos.line).reduce((n, l) => n + l.length + 1, 0) + pos.character;
	return source.slice(0, offsetOf(range.start)) + edit.newText + source.slice(offsetOf(range.end));
}

describe('M2: member completion edits (D1)', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('accepting a member completion never duplicates the accessor dot', async () => {
		const loc = locate(probePath, 'FLAGS.RE', 'FLAGS.RE'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const item = list.items.find(i => String(i.label) === 'RELUNIT');
		expect(item, 'RELUNIT should be offered').toBeTruthy();
		expect(item!.textEdit, 'item should carry a mapped textEdit').toBeTruthy();

		const source = fs.readFileSync(probePath, 'utf8');
		const applied = applyEdit(source, item!.textEdit as never);
		expect(applied).toContain('FLAGS.RELUNIT');
		expect(applied).not.toContain('..RELUNIT');
		expect(applied).not.toContain('?.');
	});

	it('no completion item carries raw ?. inserts (imba spells it ..)', async () => {
		const loc = locate(probePath, 'FLAGS.RE', 'FLAGS.RE'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		for (const item of list.items) {
			const newText = (item.textEdit as { newText?: string } | undefined)?.newText ?? item.insertText ?? '';
			expect(newText.startsWith('?.'), `item ${item.label} inserts ${newText}`).toBe(false);
		}
	});
});
