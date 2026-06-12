import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { applyImbaConfig, getImbaConfig, DEFAULT_CONFIG } from '../src/config';
import { isProjectCompilerEnabled } from '../src/projectCompiler';
import { createFixtureLanguageService, locate } from './harness';

// parity: F3 (configurePlugin/ipc → LSP configuration) + B5 (debugLevel ≥ 2
// keeps rule-suppressed TS diagnostics visible as tagged warnings).

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const usagePath = path.join(fixtureDir, 'usage.imba');

afterEach(() => applyImbaConfig(undefined));

describe('M3/F3: configuration', () => {
	it('normalizes raw settings and applies side effects', () => {
		expect(getImbaConfig()).toEqual(DEFAULT_CONFIG);

		const applied = applyImbaConfig({
			useImbaFromProject: true,
			debugLevel: 2,
			workspaceSymbols: { scope: 'imba' },
		});
		expect(applied.useImbaFromProject).toBe(true);
		expect(applied.debugLevel).toBe(2);
		expect(applied.workspaceSymbolsScope).toBe('imba');
		expect(isProjectCompilerEnabled()).toBe(true);

		// full-section semantics: a partial update resets unspecified keys
		applyImbaConfig({ debugLevel: 1 });
		expect(getImbaConfig().useImbaFromProject).toBe(false);
		expect(isProjectCompilerEnabled()).toBe(false);
	});

	it('ignores garbage input', () => {
		const applied = applyImbaConfig({ debugLevel: 'loud', workspaceSymbolsScope: 'everything' });
		expect(applied).toEqual(DEFAULT_CONFIG);
	});
});

describe('M3/F3+B5: config-driven behavior', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('debugLevel 2 surfaces suppressed diagnostics as tagged warnings', async () => {
		const uri = locate(usagePath, 'tag UsageApp').uri;

		const normal = (await ls.getDiagnostics(uri)) ?? [];
		expect(normal.filter(d => d.source === 'imba-suppressed')).toEqual([]);

		applyImbaConfig({ debugLevel: 2 });
		const debug = (await ls.getDiagnostics(uri)) ?? [];
		const surfaced = debug.filter(d => d.source === 'imba-suppressed');
		// the known-tag 2305 import suppression becomes visible
		expect(surfaced.length).toBeGreaterThan(0);
		for (const diag of surfaced) {
			expect(diag.severity).toBe(2);
		}
	});

	it('workspaceSymbolsScope imba drops ts/js results', async () => {
		const before = (await ls.getWorkspaceSymbols('bad')) ?? [];
		expect(before.some(s => s.location.uri.toString().endsWith('.ts'))).toBe(true);

		applyImbaConfig({ workspaceSymbolsScope: 'imba' });
		const after = (await ls.getWorkspaceSymbols('bad')) ?? [];
		expect(after.some(s => s.location.uri.toString().endsWith('.ts'))).toBe(false);
	});
});
