import { describe, expect, it } from 'vitest';
import { compileImba } from '../src/compiler';

// parity: G4 — while a file is broken beyond parse recovery, serve the last
// good module instead of an empty one (which cascades missing-export errors
// into every importer mid-keystroke). Diagnostics stay current.

const GOOD = 'export def stable-fn a\\number\n\ta * 2\n';
const GOOD_V2 = 'export def stable-fn a\\number\n\ta * 3\n';
const BROKEN = ')}{(\n\t]]]]\n';

describe('M3/G4: keep-last-good compilation', () => {
	it('serves the last good module while the source is unparsable', () => {
		const file = '/tmp/g4-basic.imba';
		const good = compileImba(file, GOOD);
		expect(good.recovered).toBeUndefined();
		expect(good.js).toContain('stableΞfn');

		const broken = compileImba(file, BROKEN);
		expect(broken.recovered).toBe(true);
		expect(broken.js).toBe(good.js);
		expect(broken.spans).toBe(good.spans);
		// diagnostics are from the CURRENT attempt, not the good compile
		expect(broken.diagnostics.length).toBeGreaterThan(0);
		expect(JSON.stringify(broken.diagnostics)).toContain('unmatched');
	});

	it('falls back to an empty module when nothing good was seen', () => {
		const fresh = compileImba('/tmp/g4-never-good.imba', BROKEN);
		expect(fresh.recovered).toBeUndefined();
		expect(fresh.js).toBe('export {};\n');
		expect(fresh.diagnostics.length).toBeGreaterThan(0);
	});

	it('does not resurrect exports for a deliberately emptied file', () => {
		const file = '/tmp/g4-emptied.imba';
		compileImba(file, GOOD);
		const emptied = compileImba(file, '');
		expect(emptied.recovered).toBeUndefined();
		expect(emptied.js).not.toContain('stableΞfn');
		expect(emptied.diagnostics.length).toBe(0);
	});

	it('drops the substitution as soon as the source parses again', () => {
		const file = '/tmp/g4-roundtrip.imba';
		compileImba(file, GOOD);
		const broken = compileImba(file, BROKEN);
		expect(broken.recovered).toBe(true);

		const fixed = compileImba(file, GOOD_V2);
		expect(fixed.recovered).toBeUndefined();
		expect(fixed.js).toContain('a * 3');

		// and the NEW good version is what a later breakage serves
		const brokenAgain = compileImba(file, BROKEN + '\n');
		expect(brokenAgain.recovered).toBe(true);
		expect(brokenAgain.js).toContain('a * 3');
	});

	it('substitutes on cache hits too', () => {
		const file = '/tmp/g4-cached.imba';
		compileImba(file, GOOD);
		const first = compileImba(file, BROKEN);
		// identical content → raw result now served from the compile cache
		const second = compileImba(file, BROKEN);
		expect(first.recovered).toBe(true);
		expect(second.recovered).toBe(true);
		expect(second.js).toBe(first.js);
	});
});
