import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: A8 (asset imports — compiler emits `data:text/asset;` specifiers,
// matched by the typings' wildcard module declaring ImbaAsset) and A11
// (multi-root: the old plugin tracked ONE global project, so the most
// recently created one won; Volar scopes per-project natively — pin it).

const testDir = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(testDir, 'fixture');
const fixtureBDir = path.join(testDir, 'fixture-b');

describe('M3/A8: asset imports', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));
	const assetsFile = path.join(fixtureDir, 'assets.imba');

	it('typechecks clean and types the import as ImbaAsset', async () => {
		const loc = locate(assetsFile, 'icon.url', 0);
		const diags = (await ls.getDiagnostics(loc.uri)) ?? [];
		expect(diags).toEqual([]);
		const hover = await ls.getHover(loc.uri, loc.position);
		expect(JSON.stringify(hover ?? '')).toContain('ImbaAsset');
	});

	it('completes asset members', async () => {
		const loc = locate(assetsFile, 'icon.url', 'icon.'.length);
		const result = await ls.getCompletionItems(loc.uri, loc.position);
		const labels = (result?.items ?? []).map(i => i.label);
		for (const member of ['body', 'url', 'absPath', 'path']) {
			expect(labels, `asset member ${member}`).toContain(member);
		}
	});
});

describe('M3/A11: multiple projects stay isolated', () => {
	// two services over two roots, queried interleaved — each must keep its
	// own program (the regression: one global "current project")
	const lsA = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));
	const lsB = createFixtureLanguageService(path.join(fixtureBDir, 'tsconfig.json'));

	it('resolves same-named exports per project', async () => {
		const locA = locate(path.join(fixtureDir, 'main.imba'), 'export def greet', 'export def '.length);
		const locB = locate(path.join(fixtureBDir, 'main.imba'), 'export def greet', 'export def '.length);

		const hoverB = await ls(lsB, locB);
		const hoverA = await ls(lsA, locA);
		expect(hoverA).toContain('name: string');
		expect(hoverB).toContain('count: number');

		// and again in the opposite order, against cached state
		expect(await ls(lsA, locA)).toContain('string');
		expect(await ls(lsB, locB)).toContain('number');
	});

	it('scopes workspace symbols to each project', async () => {
		const symbolsA = (await lsA.getWorkspaceSymbols('widget')) ?? [];
		const symbolsB = (await lsB.getWorkspaceSymbols('widget')) ?? [];
		expect(symbolsA.some(s => s.name === 'cool-widget')).toBe(true);
		expect(symbolsA.some(s => s.name === 'b-widget')).toBe(false);
		expect(symbolsB.some(s => s.name === 'b-widget')).toBe(true);
		expect(symbolsB.some(s => s.name === 'cool-widget')).toBe(false);
	});

	async function ls(
		service: ReturnType<typeof createFixtureLanguageService>,
		loc: ReturnType<typeof locate>
	): Promise<string> {
		const hover = await service.getHover(loc.uri, loc.position);
		return JSON.stringify(hover ?? '');
	}
});
