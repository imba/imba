import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: D12 — TS auto-imports. TS's own import edits target the generated
// preamble (unmappable, silently dropped by the default resolve transform);
// the transformCompletionItem hook rebuilds them with monarch's
// createImportEdit in source coordinates: imba-style statements,
// extensionless specifiers, merging into existing imports.

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');

describe('M3/D12: auto-imports', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('adds an extensionless import for an unimported export', async () => {
		const loc = locate(path.join(fixtureDir, 'autoimport.imba'), 'doub', 4);
		const result = await ls.getCompletionItems(loc.uri, loc.position);
		const item = result?.items.find(i => i.label === 'double' && i.labelDetails?.description === './util.imba');
		expect(item, 'auto-import candidate for double').toBeTruthy();
		const resolved = await ls.resolveCompletionItem(item!);
		const edits = resolved.additionalTextEdits ?? [];
		expect(edits.length).toBe(1);
		expect(edits[0].newText).toContain("import { double } from './util'");
		expect(edits[0].newText).not.toContain('.imba');
		expect(edits[0].range.start).toEqual({ line: 0, character: 0 });
	});

	it('merges into an existing import from the same module', async () => {
		const loc = locate(path.join(fixtureDir, 'autoimport2.imba'), 'gree', 4);
		const result = await ls.getCompletionItems(loc.uri, loc.position);
		// with an existing import statement TS reuses its specifier spelling
		const item = result?.items.find(i => i.label === 'greet' && i.labelDetails?.description?.startsWith('./main'));
		expect(item, 'auto-import candidate for greet').toBeTruthy();
		const resolved = await ls.resolveCompletionItem(item!);
		const edits = resolved.additionalTextEdits ?? [];
		expect(edits.length).toBeGreaterThan(0);
		const text = edits.map(e => e.newText).join('|');
		// merged member list, not a second import statement
		expect(text).toContain('greet');
		expect(text).not.toContain("import { greet } from './main'\n\nimport");
	});
});
