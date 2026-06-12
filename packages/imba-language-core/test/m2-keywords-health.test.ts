import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as ts from 'typescript';
import { createTypeScriptChecker } from '@volar/kit';
import { createImbaLanguagePlugin, createImbaServicePlugins } from '../src/index';
import { createFixtureLanguageService, locate } from './harness';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(testDir, 'fixture');

describe('M2/D11: keyword completions', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('offers imba-specific keywords at plain-code positions, below symbols', async () => {
		const file = path.join(fixtureDir, 'kw.imba');
		const loc = locate(file, '\tre', '\tre'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		// imba-only keywords come from us (TS covers the JS set)
		const unless = list.items.find(i => String(i.label) === 'unless');
		expect(unless, 'unless keyword should be offered').toBeTruthy();
		expect(String(unless!.sortText)).toMatch(/^9/); // ranked below symbol items
		// JS keywords are not duplicated by our plugin
		const returns = list.items.filter(i => String(i.label) === 'return' && String(i.sortText).startsWith('9'));
		expect(returns).toEqual([]);
	});

	it('does not inject keywords into style contexts', async () => {
		const file = path.join(fixtureDir, 'style-prop.imba');
		const loc = locate(file, 'bgc', 'bgc'.length);
		const list = await ls.getCompletionItems(loc.uri, loc.position, { triggerKind: 1 });
		expect(list.items.some(i => String(i.label) === 'return')).toBe(false);
	});
});

describe('M2/F2: environment health check', () => {
	it('a project without imba typings gets ONE clear warning, not a cascade', async () => {
		const checker = createTypeScriptChecker(
			[createImbaLanguagePlugin()],
			createImbaServicePlugins(ts),
			path.join(testDir, 'fixture-bare', 'tsconfig.json')
		);
		const diagnostics = await checker.check(path.join(testDir, 'fixture-bare', 'bare.imba'));
		const health = diagnostics.filter(d => String(d.message).includes('imba types are not loaded'));
		expect(health.length).toBe(1);
		expect(health[0].severity).toBe(2);
		expect(health[0].range.start.line).toBe(0);
	});

	it('healthy projects show no health warning', async () => {
		const checker = createTypeScriptChecker(
			[createImbaLanguagePlugin()],
			createImbaServicePlugins(ts),
			path.join(fixtureDir, 'tsconfig.json')
		);
		const diagnostics = await checker.check(path.join(fixtureDir, 'app.imba'));
		expect(diagnostics.some(d => String(d.message).includes('imba types'))).toBe(false);
	});
});
