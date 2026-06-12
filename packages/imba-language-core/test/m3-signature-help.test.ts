import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createFixtureLanguageService, locate } from './harness';

// parity: E9 — getSignatureHelpItems. TS-backed through the mappings; the
// event-modifier case needs no checker hack because modifiers compile to
// plain method calls (`e.αthrottle(500)`). Labels converted from encoded
// identifiers (fancyΞpad → fancy-pad, αthrottle → @throttle).

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const sigFile = path.join(fixtureDir, 'sig.imba');
const evFile = path.join(fixtureDir, 'sig-ev.imba');

describe('M3/E9: signature help', () => {
	const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));

	it('shows the signature inside call parens', async () => {
		const loc = locate(sigFile, 'greet("hi")', 6);
		const help = await ls.getSignatureHelp(loc.uri, loc.position);
		expect(help?.signatures[0]?.label).toBe('greet(name: string): string');
		expect(help?.activeParameter).toBe(0);
	});

	it('works in empty parens', async () => {
		const loc = locate(sigFile, 'greet()\n', 6);
		const help = await ls.getSignatureHelp(loc.uri, loc.position);
		expect(help?.signatures[0]?.label).toBe('greet(name: string): string');
	});

	it('tracks the active parameter across commas', async () => {
		const loc = locate(sigFile, 'pad("x", 2)', 9);
		const help = await ls.getSignatureHelp(loc.uri, loc.position);
		expect(help?.signatures[0]?.label).toMatch(/^pad\(text: string, len: number/);
		expect(help?.activeParameter).toBe(1);
	});

	it('converts encoded callee names (dashed methods)', async () => {
		const loc = locate(sigFile, 'fancy-pad("y", 3)', 10);
		const help = await ls.getSignatureHelp(loc.uri, loc.position);
		expect(help?.signatures[0]?.label).toBe('fancy-pad(text: string, width: number): string');
	});

	it('shows event-modifier signatures inside modifier parens', async () => {
		const loc = locate(evFile, '.throttle(500)', 10);
		const help = await ls.getSignatureHelp(loc.uri, loc.position);
		expect(help?.signatures[0]?.label).toMatch(/^@throttle\(time\?: /);
	});

	it('tracks active parameter and docs in modifier calls', async () => {
		const loc = locate(evFile, ".flag('busy', 200)", 14);
		const help = await ls.getSignatureHelp(loc.uri, loc.position);
		const signature = help?.signatures[0];
		expect(signature?.label).toMatch(/^@flag\(name: string/);
		expect(help?.activeParameter).toBe(1);
		// jsdoc param docs flow through from the typings
		expect(JSON.stringify(signature?.parameters?.[0]?.documentation ?? '')).toContain('class to add');
		// no encoded identifiers anywhere in the rendered labels
		for (const param of signature?.parameters ?? []) {
			expect(String(param.label)).not.toMatch(/[αΞΦΨΓΩ]/);
		}
	});
});
