import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { URI } from 'vscode-uri';
import { createFixtureLanguageService, locate } from './harness';

// app-scale regression guard: style completions over a REAL project (the
// harness once skipped setupImbaProject, silently losing the imbacss
// namespace — value completions returned 0 items and no fixture caught it).
// Latency is logged, not asserted (2026-06-12 baseline: 11–14ms post-edit).

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../apps/imba.io');

describe.skipIf(!fs.existsSync(path.join(appDir, 'jsconfig.json')))('app-scale: style completions post-edit', () => {
	const ls = createFixtureLanguageService(path.join(appDir, 'jsconfig.json'));
	const stylesFile = path.join(appDir, 'src/styles.imba');

	it('serves style values fast after edits', async () => {
		const lsAny = ls as unknown as {
			context: { language: { scripts: { set(uri: URI, snap: ts.IScriptSnapshot): void } } };
		};
		const uri = URI.file(stylesFile);
		const original = fs.readFileSync(stylesFile, 'utf8');
		// value position: after `d:` in `.menu-heading d:block …`
		const loc = locate(stylesFile, 'd:block p:0', 2);

		// cold first request (program build + first style table)
		let t = performance.now();
		await ls.getCompletionItems(loc.uri, loc.position);
		console.log('[perf] cold first request:', Math.round(performance.now() - t), 'ms');

		// simulated keystrokes: append a comment char at the end, re-request
		for (let round = 1; round <= 5; round++) {
			const edited = original + `\n# edit${round}\n`;
			lsAny.context.language.scripts.set(uri, ts.ScriptSnapshot.fromString(edited));
			t = performance.now();
			const result = await ls.getCompletionItems(loc.uri, loc.position);
			console.log(
				`[perf] post-edit round ${round}:`,
				Math.round(performance.now() - t),
				'ms —',
				result?.items.length,
				'items'
			);
			// the regression: 0 items when the imbacss namespace is missing
			expect(result?.items.length ?? 0).toBeGreaterThan(50);
			expect(result?.items.some(i => i.label === 'block')).toBe(true);
		}
	}, 120000);
});
