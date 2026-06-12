import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { URI } from 'vscode-uri';
import { computeIndentFoldingRanges } from '../src/plugins/imbaFolding';
import { compileImba } from '../src/compiler';
import { warmImbaCompileCache } from '../src/warmer';
import { createFixtureLanguageService } from './harness';

// parity: E7 (indentation folding; TS folding suppressed for imba docs —
// mapped from generated code it was degenerate noise) and G1 (background
// compile-cache warmer for project files).

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');

describe('M3/E7: indentation folding', () => {
	it('folds indented blocks with blank-line tolerance', () => {
		const text = 'tag a\n\tdef b\n\t\tx\n\n\t\ty\n\ndef c\n\tz\n';
		const ranges = computeIndentFoldingRanges(text);
		expect(ranges).toEqual([
			{ startLine: 0, endLine: 4 }, // tag a → last content inside (y)
			{ startLine: 1, endLine: 4 }, // def b → y, across the blank line
			{ startLine: 6, endLine: 7 }, // def c → z
		]);
	});

	it('serves clean ranges through the language service', async () => {
		const ls = createFixtureLanguageService(path.join(fixtureDir, 'tsconfig.json'));
		const uri = URI.file(path.join(fixtureDir, 'widgets.imba'));
		const ranges = (await ls.getFoldingRanges(uri)) ?? [];
		// tag cool-widget (0→3), <self> (2→3), global x-comp (5→6)
		expect(ranges).toEqual([
			{ startLine: 0, endLine: 3 },
			{ startLine: 2, endLine: 3 },
			{ startLine: 5, endLine: 6 },
		]);
		// the regression: TS folding leaked degenerate single-line duplicates
		for (const range of ranges) {
			expect(range.endLine).toBeGreaterThan(range.startLine);
		}
	});
});

describe('M3/G1: compile-cache warmer', () => {
	it('pre-compiles files so later compiles hit the cache', async () => {
		const files = fs
			.readdirSync(fixtureDir)
			.filter(name => name.endsWith('.imba'))
			.map(name => path.join(fixtureDir, name));
		const warmed = await warmImbaCompileCache(files, { chunkSize: 8, chunkDelay: 0 });
		expect(warmed).toBe(files.length);

		// memory-cache hit returns the identical object
		const file = path.join(fixtureDir, 'widgets.imba');
		const source = fs.readFileSync(file, 'utf8');
		const first = compileImba(file, source);
		const second = compileImba(file, source);
		expect(second).toBe(first);
	});

	it('skips unreadable files without failing', async () => {
		const warmed = await warmImbaCompileCache([path.join(fixtureDir, 'does-not-exist.imba')]);
		expect(warmed).toBe(0);
	});
});
