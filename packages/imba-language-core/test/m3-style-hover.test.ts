import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: C3 (style slice) — hover on style property names expands
// abbreviations via @proxy (the proxied imbacss symbol carries the docs and
// the MDN link) and style modifiers render @detail + docs.

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const file = path.join(fixtureDir, 'style-hover.imba');

describe('M3/C3: style property + modifier hover', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('expands property abbreviations with the proxied docs', async () => {
		const loc = locate(file, 'bd:', 1);
		const hover = await ls.getHover(loc.uri, loc.position);
		const text = JSON.stringify(hover ?? '');
		expect(text).toContain('bd (border)');
		expect(text).toContain('Shorthand property');
		expect(text).toContain('developer.mozilla.org');
	});

	it('expands dashed long-name abbreviations', async () => {
		const loc = locate(file, 'bgc:', 1);
		const hover = await ls.getHover(loc.uri, loc.position);
		const text = JSON.stringify(hover ?? '');
		expect(text).toContain('bgc (background-color)');
		expect(text).toContain('background color');
	});

	it('describes style modifiers', async () => {
		const loc = locate(file, '@hover', 2);
		const hover = await ls.getHover(loc.uri, loc.position);
		const text = JSON.stringify(hover ?? '');
		expect(text).toContain('@hover');
		expect(text).toContain('hovers over an element');
	});
});
