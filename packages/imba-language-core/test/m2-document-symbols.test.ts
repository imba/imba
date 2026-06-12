import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { URI } from 'vscode-uri';
import { createFixtureLanguageService } from './harness';

// parity: E5 — service.imba getNavigationTree intercept (doc.getOutline)

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const appImba = path.join(fixtureDir, 'app.imba');

describe('M2/E5: document symbols from monarch', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('outlines a tag component with nested members', async () => {
		const symbols = (await ls.getDocumentSymbols(URI.file(appImba))) ?? [];
		expect(symbols.length).toBeGreaterThan(0);

		const app = symbols.find(s => s.name === 'App');
		expect(app, 'tag App should be in the outline').toBeTruthy();

		const childNames = (app!.children ?? []).map(c => c.name);
		expect(childNames).toContain('bump');
		expect(childNames).toContain('count');

		// LSP invariant: range contains selectionRange (VS Code drops violators)
		const check = (sym: (typeof symbols)[number]) => {
			expect(sym.range.start.line).toBeLessThanOrEqual(sym.selectionRange.start.line);
			expect(sym.range.end.line).toBeGreaterThanOrEqual(sym.selectionRange.end.line);
			for (const child of sym.children ?? []) {
				check(child);
			}
		};
		symbols.forEach(check);
	});
});
