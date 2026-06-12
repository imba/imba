import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: completions.imba tagnames() (D2) — workspace tag index + HTML map
// + auto-import via monarch createImportEdit

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const treePath = path.join(fixtureDir, 'tagtree.imba');

describe('M2.2/D2: tag-name completions', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	async function tagItems() {
		const source = fs.readFileSync(treePath, 'utf8');
		const offset = source.lastIndexOf('<') + 1;
		const before = source.slice(0, offset);
		const position = {
			line: before.split('\n').length - 1,
			character: offset - (before.lastIndexOf('\n') + 1),
		};
		const loc = locate(treePath, 'tag Tree'); // just for the uri
		return ls.getCompletionItems(loc.uri, position, { triggerKind: 2, triggerCharacter: '<' });
	}

	it('offers local tags, workspace tags, web components and html tags', async () => {
		const list = await tagItems();
		const labels = list.items.map(i => String(i.label));
		expect(labels).toContain('local-card'); // same file
		expect(labels).toContain('cool-widget'); // other file, exported
		expect(labels).toContain('x-comp'); // global web component
		expect(labels).toContain('div'); // HTMLElementTagNameMap
		expect(labels).toContain('button');
	});

	it('imba tags rank above html tags', async () => {
		const list = await tagItems();
		const byLabel = new Map(list.items.map(i => [String(i.label), i]));
		const widget = byLabel.get('cool-widget')!;
		const div = byLabel.get('div')!;
		expect(String(widget.sortText) < String(div.sortText)).toBe(true);
	});

	it('replaces a partially typed tag name', async () => {
		const partialPath = path.join(fixtureDir, 'tagtree-partial.imba');
		const loc = locate(partialPath, '<co', '<co'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const widget = list.items.find(i => String(i.label) === 'cool-widget');
		expect(widget, 'cool-widget should match partial <co').toBeTruthy();
		const edit = widget!.textEdit as { newText: string; range: { start: { character: number }; end: { character: number } } };
		expect(edit.newText).toBe('cool-widget');
		// range must cover exactly the typed `co`, not the angle bracket
		const source = fs.readFileSync(partialPath, 'utf8');
		const line = source.split('\n')[2];
		expect(line.slice(edit.range.start.character, edit.range.end.character)).toBe('co');
	});

	it('cross-file exported tags carry an auto-import edit', async () => {
		const list = await tagItems();
		const widget = list.items.find(i => String(i.label) === 'cool-widget')!;
		expect(widget.additionalTextEdits?.length, 'cool-widget should auto-import').toBeGreaterThan(0);
		const edit = widget.additionalTextEdits![0];
		expect(edit.newText).toContain("import { cool-widget } from './widgets'");
		// import inserted at the top of the file
		expect(edit.range.start.line).toBe(0);

		// local and global tags must NOT import
		const local = list.items.find(i => String(i.label) === 'local-card')!;
		const comp = list.items.find(i => String(i.label) === 'x-comp')!;
		expect(local.additionalTextEdits ?? []).toEqual([]);
		expect(comp.additionalTextEdits ?? []).toEqual([]);
	});
});
