import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: C1 explicit e2e coverage — hover (intercept.getQuickInfoAtPosition)
// and go-to-def (intercept.getDefinitionAndBoundSpan) through Volar mappings

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');
const mainImba = path.join(fixtureDir, 'main.imba');
const appImba = path.join(fixtureDir, 'app.imba');
const consumerTs = path.join(fixtureDir, 'consumer.ts');

function hoverText(hover: unknown): string {
	return JSON.stringify(hover ?? '');
}

describe('M1.7: hover and go-to-def e2e (C1)', () => {
	const ls = createFixtureLanguageService(tsconfigPath);

	it('hover inside an imba file shows the inferred type', async () => {
		// hover `greet` at its usage inside app.imba's tag body
		const loc = locate(appImba, 'greet("imba")', 1);
		const hover = await ls.getHover(loc.uri, loc.position);
		expect(hover).toBeTruthy();
		const text = hoverText(hover);
		expect(text).toContain('greet');
		expect(text).toContain('string');
	});

	it('go-to-def from an imba usage lands on the imba definition', async () => {
		const loc = locate(appImba, 'greet("imba")', 1);
		const defs = (await ls.getDefinition(loc.uri, loc.position)) ?? [];
		expect(defs.length).toBeGreaterThan(0);
		const def = defs[0];
		expect(def.targetUri.toString()).toContain('main.imba');
		const expected = locate(mainImba, 'greet name');
		expect(def.targetSelectionRange.start.line).toBe(expected.position.line);
		expect(def.targetSelectionRange.start.character).toBe(expected.position.character);
	});

	it('go-to-def from a ts file crosses into the imba file', async () => {
		const loc = locate(consumerTs, 'p.dist()', 3);
		const defs = (await ls.getDefinition(loc.uri, loc.position)) ?? [];
		expect(defs.length).toBeGreaterThan(0);
		const def = defs[0];
		expect(def.targetUri.toString()).toContain('main.imba');
		const expected = locate(mainImba, 'def dist', 4);
		expect(def.targetSelectionRange.start.line).toBe(expected.position.line);
	});

	it('hover in a ts file over an imba import shows imba-derived types', async () => {
		const loc = locate(consumerTs, 'greet }', 1);
		const hover = await ls.getHover(loc.uri, loc.position);
		expect(hoverText(hover)).toContain('greet');
	});

	it('hover shows imba identifiers, never greek-encoded ones (C2)', async () => {
		// fancy-name compiles to fancyΞname; hover must show the imba form
		const fancyImba = path.join(fixtureDir, 'fancy.imba');
		const loc = locate(fancyImba, 'fancy-name!', 1);
		const hover = await ls.getHover(loc.uri, loc.position);
		const text = hoverText(hover);
		expect(text).toContain('fancy-name');
		expect(text).not.toContain('Ξ');
	});
});
