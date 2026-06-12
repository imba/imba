import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: M2.3 — script.imba getInfoAt event branches + checker.getEventModifier.
// Mirrors Sindre's dev-host report: hover/click on `@intersect.silent` did
// nothing because event tokens never exist in the generated TS.

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');
const appImba = path.join(fixtureDir, 'app.imba');

function hoverText(hover: unknown): string {
	return JSON.stringify(hover ?? '');
}

describe('M2.3: event name + modifier intelligence', () => {
	const ls = createFixtureLanguageService(tsconfigPath);

	it('hover over an event name resolves through ImbaEvents', async () => {
		const loc = locate(appImba, '@click', 1);
		const hover = await ls.getHover(loc.uri, loc.position);
		const text = hoverText(hover);
		expect(text).toContain('ImbaEvents');
		expect(text).toContain('click');
		expect(text).not.toContain('α');
	});

	it('hover over a modifier shows the modifier with its docs', async () => {
		const loc = locate(appImba, 'silent', 1);
		const hover = await ls.getHover(loc.uri, loc.position);
		const text = hoverText(hover);
		expect(text).toContain('@silent');
		// the typings document silent as suppressing imba.commit
		expect(text.toLowerCase()).toContain('commit');
		expect(text).not.toContain('αsilent');
		// TS chops `@click`/`@intersect` inside the doc example into bogus
		// jsdoc tags (the typings don't escape them) — the renderer must
		// stitch the example back together (dev-host finding 2026-06-12)
		expect(text).toContain('@click.silent=handler');
		expect(text).not.toContain('*@click*');
	});

	it('custom events resolve through the ImbaEvents index signature', async () => {
		// parity: old checker.member() getStringIndexType fallback — dev-host
		// report: hover dead on `@intercept` (not a declared ImbaEvents member)
		const loc = locate(appImba, '@boom', 1);
		const hover = await ls.getHover(loc.uri, loc.position);
		const text = hoverText(hover);
		expect(text).toContain('ImbaEvents.boom');
		expect(text).toContain('CustomEvent');
		expect(text).toContain('custom event');

		// modifiers on custom events resolve against the index value type
		const modLoc = locate(appImba, 'boom.silent', 'boom.'.length);
		const modHover = await ls.getHover(modLoc.uri, modLoc.position);
		expect(hoverText(modHover)).toContain('@silent');

		// go-to-def on the custom event lands on the index signature
		const defs = (await ls.getDefinition(loc.uri, loc.position)) ?? [];
		expect(defs.length).toBeGreaterThan(0);
		expect(defs[0].targetUri.toString()).toContain('imba.events.d.ts');
	});

	it('touch modifiers include the key modifiers (@touch.meta)', async () => {
		// dev-host report: runtime Touch implements @meta/@alt/@shift/@ctrl
		// (proxying originalEvent) but the typings mirror had drifted —
		// the fixture usage also keeps the m1-typings clean-check honest
		const loc = locate(appImba, 'touch.meta', 'touch.'.length);
		const hover = await ls.getHover(loc.uri, loc.position);
		const text = hoverText(hover);
		expect(text).toContain('@meta');
		expect(text.toLowerCase()).toContain('meta key');
	});

	function textAtTarget(def: { targetUri: { toString(): string }; targetSelectionRange: { start: { line: number } } }): string {
		const file = def.targetUri.toString().replace('file://', '');
		return fs.readFileSync(decodeURIComponent(file), 'utf8').split('\n')[def.targetSelectionRange.start.line] ?? '';
	}

	it('go-to-def on a modifier lands ON the modifier declaration', async () => {
		const loc = locate(appImba, 'silent', 1);
		const defs = (await ls.getDefinition(loc.uri, loc.position)) ?? [];
		expect(defs.length).toBeGreaterThan(0);
		expect(defs[0].targetUri.toString()).toContain('imba.events.d.ts');
		// dev-host report was a WRONG POSITION inside the right file —
		// always assert the target line content, never just the file
		expect(textAtTarget(defs[0])).toContain('αsilent');
	});

	it('go-to-def on event names lands on the exact property', async () => {
		const clickLoc = locate(appImba, '@click', 1);
		const clickDefs = (await ls.getDefinition(clickLoc.uri, clickLoc.position)) ?? [];
		expect(clickDefs.length).toBeGreaterThan(0);
		expect(textAtTarget(clickDefs[0])).toContain('click: MouseEvent');

		const boomLoc = locate(appImba, '@boom', 1);
		const boomDefs = (await ls.getDefinition(boomLoc.uri, boomLoc.position)) ?? [];
		expect(boomDefs.length).toBeGreaterThan(0);
		expect(textAtTarget(boomDefs[0])).toContain('[event: string]');
	});

	it('the modifier usage itself produces no error diagnostics', async () => {
		// guards the original screenshot bug: 2339 "@silent does not exist"
		const diagnostics = await ls.getDiagnostics(locate(appImba, 'tag App').uri);
		const errors = (diagnostics ?? []).filter((d: { severity?: number }) => d.severity === 1);
		expect(errors.map((d: { message: unknown }) => d.message)).toEqual([]);
	});
});
