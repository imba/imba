import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// Tag USAGE intelligence (Sindre's question: "once you hover over a tag after
// you have used it"). Attributes flow through TS mappings; the tag name
// itself resolves through the workspace index.

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const usagePath = path.join(fixtureDir, 'usage.imba');
const widgetsPath = path.join(fixtureDir, 'widgets.imba');

describe('M2: tag usage definition/hover', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('go-to-def on a used tag name lands on the tag declaration', async () => {
		const loc = locate(usagePath, '<cool-widget', 3);
		const defs = (await ls.getDefinition(loc.uri, loc.position)) ?? [];
		expect(defs.length).toBeGreaterThan(0);
		const def = defs[0];
		expect(def.targetUri.toString()).toContain('widgets.imba');
		const expected = locate(widgetsPath, 'cool-widget');
		expect(def.targetSelectionRange.start.line).toBe(expected.position.line);
		expect(def.targetSelectionRange.start.character).toBe(expected.position.character);
	});

	it('hover on a used tag name shows the tag declaration', async () => {
		const loc = locate(usagePath, '<cool-widget', 3);
		const hover = await ls.getHover(loc.uri, loc.position);
		const text = JSON.stringify(hover ?? '');
		expect(text).toContain('tag cool-widget');
		expect(text).toContain('widgets.imba');
	});

	it('go-to-def on a tag ATTRIBUTE flows through TS to the prop declaration', async () => {
		const loc = locate(usagePath, 'message=', 2);
		const defs = (await ls.getDefinition(loc.uri, loc.position)) ?? [];
		expect(defs.length).toBeGreaterThan(0);
		expect(defs[0].targetUri.toString()).toContain('widgets.imba');
		const expected = locate(widgetsPath, 'prop message', 'prop '.length);
		expect(defs[0].targetSelectionRange.start.line).toBe(expected.position.line);
	});

	it('named tag imports produce no false 2305 (runtime-correct, tsc-target gap)', async () => {
		const diagnostics = await ls.getDiagnostics(locate(usagePath, 'tag UsageApp').uri);
		const errors = (diagnostics ?? []).filter((d: { severity?: number }) => d.severity === 1);
		expect(errors.map((d: { code?: unknown; message?: unknown }) => `${d.code}: ${d.message}`)).toEqual([]);
	});
});
