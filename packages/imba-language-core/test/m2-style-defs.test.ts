import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: E2 — def/refs for style vars and mixins (old checker token
// synthesis). Target-line content asserted, never just the file.

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const refPath = path.join(fixtureDir, 'style-vars-ref.imba');

function textAtTarget(def: { targetUri: { toString(): string }; targetSelectionRange: { start: { line: number } } }): string {
	const file = decodeURIComponent(def.targetUri.toString().replace('file://', ''));
	return fs.readFileSync(file, 'utf8').split('\n')[def.targetSelectionRange.start.line] ?? '';
}

describe('M2/E2: style var + mixin definitions', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('go-to-def on a style var usage lands on the cross-file declaration', async () => {
		const loc = locate(refPath, '--gap', 2);
		const defs = (await ls.getDefinition(loc.uri, loc.position)) ?? [];
		expect(defs.length).toBeGreaterThan(0);
		expect(defs[0].targetUri.toString()).toContain('style-vars.imba');
		expect(textAtTarget(defs[0])).toContain('--gap: 4px');
	});

	it('go-to-def on a $colorvar usage lands on its declaration', async () => {
		const loc = locate(refPath, '$accent', 2);
		const defs = (await ls.getDefinition(loc.uri, loc.position)) ?? [];
		expect(defs.length).toBeGreaterThan(0);
		expect(textAtTarget(defs[0])).toContain('$accent: red');
	});

	it('go-to-def on a mixin usage lands on the css %mixin declaration', async () => {
		const loc = locate(refPath, '%card', 2);
		const defs = (await ls.getDefinition(loc.uri, loc.position)) ?? [];
		expect(defs.length).toBeGreaterThan(0);
		expect(defs[0].targetUri.toString()).toContain('mixin-decl.imba');
		expect(textAtTarget(defs[0])).toContain('%card');
	});

	it('hover on a style var shows kind and declaring file', async () => {
		const loc = locate(refPath, '--gap', 2);
		const hover = await ls.getHover(loc.uri, loc.position);
		const text = JSON.stringify(hover ?? '');
		expect(text).toContain('--gap');
		expect(text).toContain('style variable');
		expect(text).toContain('style-vars.imba');
	});
});
