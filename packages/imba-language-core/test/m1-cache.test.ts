import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

// isolate this suite's disk cache before importing the module under test
const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'imba-cache-test-'));
process.env.IMBA_CACHE_DIR = cacheDir;

const { clearCompileMemoryCache, compileCacheKey, compileImba } = await import('../src/index');

afterAll(() => {
	fs.rmSync(cacheDir, { recursive: true, force: true });
});

const SOURCE = 'export def cachedFn a\\number\n\ta * 2\n';
const FILE = '/virtual/cache-test.imba';

function diskEntryPath(key: string): string {
	return path.join(cacheDir, key.slice(0, 2), `${key}.json`);
}

async function waitForFile(file: string, tries = 50): Promise<void> {
	for (let i = 0; i < tries; i++) {
		if (fs.existsSync(file)) {
			return;
		}
		await new Promise(r => setTimeout(r, 20));
	}
	throw new Error(`cache file never appeared: ${file}`);
}

describe('G2: compile cache', () => {
	it('memory layer returns the identical result object', () => {
		const a = compileImba(FILE, SOURCE);
		const b = compileImba(FILE, SOURCE);
		expect(a.error).toBeUndefined();
		expect(b).toBe(a);
	});

	it('different content or file misses the cache', () => {
		const a = compileImba(FILE, SOURCE);
		const b = compileImba(FILE, SOURCE + '\n# comment\n');
		const c = compileImba('/virtual/other.imba', SOURCE);
		expect(b).not.toBe(a);
		expect(c).not.toBe(a);
	});

	it('disk layer survives a memory wipe (poisoned-entry proof)', async () => {
		const source = 'export def diskProof\n\t42\n';
		const file = '/virtual/disk-proof.imba';
		const key = compileCacheKey(file, source, '');

		compileImba(file, source);
		await waitForFile(diskEntryPath(key));

		// poison the disk entry, wipe memory: a disk hit returns the marker,
		// a recompile would return real output
		const marker = 'export {}; // poisoned-cache-marker\n';
		fs.writeFileSync(diskEntryPath(key), JSON.stringify({ js: marker, spans: [], diagnostics: [] }));
		clearCompileMemoryCache();

		const result = compileImba(file, source);
		expect(result.js).toBe(marker);
	});

	it('deterministic parse failures are cached with their diagnostics', () => {
		// the compiler returns (not throws) for unparseable source — that
		// result is deterministic and cacheable; only thrown errors are not
		const broken = 'def broken\n\tlet 1x = 2\n';
		const a = compileImba('/virtual/broken-cache.imba', broken);
		const b = compileImba('/virtual/broken-cache.imba', broken);
		expect(a.js).toContain('export {}');
		expect(a.diagnostics.length).toBeGreaterThan(0);
		expect(b).toBe(a);
	});
});
