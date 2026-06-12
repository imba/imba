import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: E4 — references via the mappings; rename round-trips the
// identifier encoding (EXACT_FEATURES navigation hooks: new name encoded for
// TS, edit text decoded into imba source, ts/js files keep encoded names).
// Style vars + mixins never reach TS — monarch token families in imbaTags.

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');

function lineAt(uri: string, line: number): string {
	const file = decodeURIComponent(uri.replace('file://', ''));
	return fs.readFileSync(file, 'utf8').split('\n')[line] ?? '';
}

describe('M3/E4: references + rename', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('finds references across imba and ts files', async () => {
		const loc = locate(path.join(fixtureDir, 'sig.imba'), 'greet("hi")', 2);
		const refs = (await ls.getReferences(loc.uri, loc.position, { includeDeclaration: true })) ?? [];
		const files = refs.map(ref => path.basename(ref.uri.toString()));
		expect(files).toContain('consumer.ts');
		expect(files).toContain('main.imba');
		expect(files).toContain('sig.imba');
		const decl = refs.find(ref => ref.uri.toString().includes('main.imba'))!;
		expect(lineAt(decl.uri.toString(), decl.range.start.line)).toContain('export def greet');
	});

	it('renames a dashed identifier within imba sources', async () => {
		const loc = locate(path.join(fixtureDir, 'sig.imba'), 'fancy-pad("y", 3)', 2);
		const edits = await ls.getRenameEdits(loc.uri, loc.position, 'cool-pad');
		const fileEdits = Object.entries(edits?.changes ?? {}).flatMap(([uri, list]) =>
			list.map(edit => ({ file: path.basename(uri), text: edit.newText }))
		);
		expect(fileEdits.length).toBeGreaterThanOrEqual(2);
		for (const edit of fileEdits) {
			expect(edit.file).toBe('sig.imba');
			expect(edit.text).toBe('cool-pad');
		}
	});

	it('rename keeps encoded names in ts files and imba names in imba files', async () => {
		const loc = locate(path.join(fixtureDir, 'main.imba'), 'export def greet', 'export def '.length + 2);
		const edits = await ls.getRenameEdits(loc.uri, loc.position, 'say-hello');
		const byFile = Object.entries(edits?.changes ?? {});
		expect(byFile.length).toBeGreaterThan(1);
		let sawTs = false;
		for (const [uri, list] of byFile) {
			for (const edit of list) {
				if (uri.endsWith('.ts')) {
					sawTs = true;
					expect(edit.newText).toBe('sayΞhello');
				} else {
					expect(edit.newText).toContain('say-hello');
					expect(edit.newText).not.toMatch(/[ΞΦΨΓΩα]/);
				}
			}
		}
		expect(sawTs, 'rename must reach consumer.ts').toBe(true);
	});

	it('finds style var references on both declaration and usage sides', async () => {
		const loc = locate(path.join(fixtureDir, 'style-vars-ref.imba'), '--gap', 2);
		const refs = (await ls.getReferences(loc.uri, loc.position, { includeDeclaration: true })) ?? [];
		const files = refs.map(ref => path.basename(ref.uri.toString()));
		expect(files).toContain('style-vars.imba');
		expect(files).toContain('style-vars-ref.imba');
		const decl = refs.find(ref => ref.uri.toString().includes('style-vars.imba'))!;
		expect(lineAt(decl.uri.toString(), decl.range.start.line)).toContain('--gap: 4px');
	});

	it('renames a style var program-wide, sigil intact', async () => {
		const loc = locate(path.join(fixtureDir, 'style-vars-ref.imba'), '--gap', 2);
		const range = await ls.getRenameRange(loc.uri, loc.position);
		expect(JSON.stringify(range)).toContain('"line":3');
		const edits = await ls.getRenameEdits(loc.uri, loc.position, '--gutter');
		const byFile = Object.fromEntries(
			Object.entries(edits?.changes ?? {}).map(([uri, list]) => [path.basename(uri), list])
		);
		expect(byFile['style-vars.imba']?.[0]?.newText).toBe('--gutter');
		expect(byFile['style-vars-ref.imba']?.[0]?.newText).toBe('--gutter');
	});

	it('renames a mixin from its usage', async () => {
		const loc = locate(path.join(fixtureDir, 'style-vars-ref.imba'), '%card', 2);
		const edits = await ls.getRenameEdits(loc.uri, loc.position, 'chip');
		const files = Object.keys(edits?.changes ?? {}).map(uri => path.basename(uri));
		expect(files).toContain('mixin-decl.imba');
		expect(files).toContain('style-vars-ref.imba');
		for (const list of Object.values(edits?.changes ?? {})) {
			for (const edit of list) {
				expect(edit.newText).toBe('chip');
			}
		}
	});
});
