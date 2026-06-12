import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService } from './harness';

// parity: E6 — service.imba getNavigateToItems override (monarch symbols,
// fuzzy query, TS imba-duplicates dropped)

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');

describe('M2/E6: workspace symbols', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('finds tags and methods across the project with fuzzy queries', async () => {
		const symbols = (await ls.getWorkspaceSymbols('coolwidget')) ?? [];
		const widget = symbols.find(s => s.name === 'cool-widget');
		expect(widget, 'fuzzy coolwidget → cool-widget tag').toBeTruthy();
		expect(widget!.location.uri.toString()).toContain('widgets.imba');

		const bump = ((await ls.getWorkspaceSymbols('bump')) ?? []).find(s => s.name === 'bump');
		expect(bump, 'method bump in app.imba').toBeTruthy();
		expect(bump!.location.uri.toString()).toContain('app.imba');
	});

	it('does not duplicate imba symbols through the TS plugin', async () => {
		const symbols = (await ls.getWorkspaceSymbols('greet')) ?? [];
		const greets = symbols.filter(s => s.name === 'greet' && s.location.uri.toString().includes('main.imba'));
		expect(greets.length).toBe(1);
	});

	it('returns no greek-encoded names', async () => {
		const symbols = (await ls.getWorkspaceSymbols('a')) ?? [];
		for (const symbol of symbols) {
			expect(symbol.name).not.toMatch(/[αΨΞΦΓΩ]/);
		}
	});
});
