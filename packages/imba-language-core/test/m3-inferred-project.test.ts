import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createBareLanguageService, locate } from './harness';

// parity: A7 — a folder with no tsconfig at all (the server's inferred
// project, with hostile synthesized CommonJS options) must still get the
// full imba experience: forced module/resolution settings, injected
// typings, extensionless cross-file imports.

const inferredDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture-inferred');
const appFile = path.join(inferredDir, 'app.imba');
const libFile = path.join(inferredDir, 'lib.imba');

describe('M3/A7: config-less project', () => {
	const ls = createBareLanguageService(inferredDir);

	it('typechecks cleanly with extensionless cross-file imports', async () => {
		const loc = locate(appFile, 'shout(');
		const diags = (await ls.getDiagnostics(loc.uri)) ?? [];
		expect(diags.map(d => `${d.code}: ${typeof d.message === 'string' ? d.message : ''}`)).toEqual([]);
	});

	it('resolves imported types across files', async () => {
		const loc = locate(appFile, 'shout(', 2);
		const hover = await ls.getHover(loc.uri, loc.position);
		expect(JSON.stringify(hover ?? '')).toContain('string');
	});

	it('jumps to the cross-file definition', async () => {
		const loc = locate(appFile, 'shout(', 2);
		const defs = (await ls.getDefinition(loc.uri, loc.position)) ?? [];
		expect(defs.length).toBeGreaterThan(0);
		expect(defs[0].targetUri.toString()).toContain('lib.imba');
	});

	it('typings are injected — event modifiers resolve', async () => {
		// @click.flag typechecks only when ImbaEvents/typings load without a
		// tsconfig mentioning them (setupImbaProject appends them)
		const loc = locate(appFile, '.flag(', 2);
		const hover = await ls.getHover(loc.uri, loc.position);
		expect(JSON.stringify(hover ?? '')).toContain('flag');
	});

	it('lib file is healthy too', async () => {
		const loc = locate(libFile, 'export def shout');
		const diags = (await ls.getDiagnostics(loc.uri)) ?? [];
		expect(diags).toEqual([]);
	});
});
