import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: D5 slice 1 — completions.imba CT.StyleProp (checker.styleprops with
// @alias/@proxy) and CT.StyleModifier (checker.stylemods with @detail)

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');

describe('M2/D5: style property + modifier completions', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('offers css properties — full names and abbreviations with cross-references', async () => {
		const file = path.join(fixtureDir, 'style-prop.imba');
		const loc = locate(file, 'bgc', 'bgc'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const byLabel = new Map(list.items.map(i => [String(i.label), i]));

		expect(byLabel.has('background-color'), 'full css property names').toBe(true);
		expect(byLabel.has('bgc'), 'imba abbreviations').toBe(true);
		expect(byLabel.has('display')).toBe(true);
		// abbreviation entries point at their full property
		expect(byLabel.get('bgc')!.detail).toContain('background-color');
		// no encoded characters anywhere
		for (const label of byLabel.keys()) {
			expect(label).not.toMatch(/[αΨΞΦ]/);
		}
		// modifiers and internals are not properties
		expect(byLabel.has('@hover')).toBe(false);
		expect(byLabel.has('_')).toBe(false);
	});

	it('offers style modifiers with selector details after @', async () => {
		const file = path.join(fixtureDir, 'style-mod.imba');
		const loc = locate(file, '@ho', '@ho'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		const byLabel = new Map(list.items.map(i => [String(i.label), i]));

		expect(byLabel.has('@hover')).toBe(true);
		expect(byLabel.has('@odd')).toBe(true);
		expect(byLabel.get('@odd')!.detail).toContain('nth-child');
		// inserting replaces only the partial after the sigil
		const hover = byLabel.get('@hover')!;
		expect((hover.textEdit as { newText: string }).newText).toBe('hover');
	});
});
