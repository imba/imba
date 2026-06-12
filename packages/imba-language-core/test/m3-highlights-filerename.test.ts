import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { URI } from 'vscode-uri';
import { createFixtureLanguageService, locate } from './harness';

// parity: E8 (document highlights — TS via mappings; same-delta exact spans
// merged so Volar's per-mapping fan-out can't duplicate the sets) and
// E10 (file-rename import edits — TS-backed, `.imba` endings stripped to
// keep idiomatic extensionless specifiers).

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');

describe('M3/E8: document highlights', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('highlights reads and writes of a local without duplicates', async () => {
		const loc = locate(path.join(fixtureDir, 'sig.imba'), 'text + char + len', 1);
		const highlights = (await ls.getDocumentHighlights(loc.uri, loc.position)) ?? [];
		expect(highlights.length).toBe(2);
		expect(highlights.map(h => h.kind).sort()).toEqual([2, 3]);
	});

	it('highlights an imported name once per occurrence', async () => {
		// the import name maps to several generated spans — the regression
		// here was every entry appearing twice
		const loc = locate(path.join(fixtureDir, 'sig.imba'), 'greet("hi")', 2);
		const highlights = (await ls.getDocumentHighlights(loc.uri, loc.position)) ?? [];
		const keys = highlights.map(h => `${h.kind}:${h.range.start.line}:${h.range.start.character}`);
		expect(new Set(keys).size).toBe(keys.length);
		expect(highlights.length).toBe(3);
	});

	it('covers dashed identifiers with full-token ranges', async () => {
		const loc = locate(path.join(fixtureDir, 'sig.imba'), 'fancy-pad("y", 3)', 2);
		const highlights = (await ls.getDocumentHighlights(loc.uri, loc.position)) ?? [];
		expect(highlights.length).toBe(2);
		for (const highlight of highlights) {
			expect(highlight.range.end.character - highlight.range.start.character).toBe('fancy-pad'.length);
		}
	});
});

describe('M3/E10: file-rename import edits', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('updates importers in imba and ts, keeping extensionless specifiers', async () => {
		const oldUri = URI.file(path.join(fixtureDir, 'util.imba'));
		const newUri = URI.file(path.join(fixtureDir, 'helpers.imba'));
		const edit = await ls.getFileRenameEdits(oldUri, newUri);
		const changes = (edit?.documentChanges ?? []) as {
			textDocument: { uri: string };
			edits: { newText: string }[];
		}[];
		const files = changes.map(change => path.basename(change.textDocument.uri));
		expect(files).toContain('main.imba');
		expect(files).toContain('consumer.ts');
		for (const change of changes) {
			for (const textEdit of change.edits) {
				expect(textEdit.newText).toBe('./helpers');
			}
		}
	});
});
