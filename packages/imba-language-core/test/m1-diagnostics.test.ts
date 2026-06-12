import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as ts from 'typescript';
import { createTypeScriptChecker } from '@volar/kit';
import { create as createTypeScriptServices } from 'volar-service-typescript';
import { createImbaDiagnosticsPlugin, createImbaLanguagePlugin } from '../src/index';

// parity: typescript-imba-plugin script.imba getImbaDiagnostics (B2)

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');
const brokenPath = path.join(fixtureDir, 'broken.imba');

describe('M1.4: imba compiler parse diagnostics (B2)', () => {
	const checker = createTypeScriptChecker(
		[createImbaLanguagePlugin()],
		[...createTypeScriptServices(ts), createImbaDiagnosticsPlugin()],
		tsconfigPath
	);

	it('surfaces parse errors from the imba compiler at the right range', async () => {
		const diagnostics = await checker.check(brokenPath);
		const parseErrors = diagnostics.filter(d => d.source === 'imba-parser');

		expect(parseErrors.length).toBe(1);
		const [diag] = parseErrors;
		expect(diag.severity).toBe(1);
		expect(diag.message).toContain('Unexpected');

		// the error must point at `123` on the third line (0-based line 2)
		const source = fs.readFileSync(brokenPath, 'utf8');
		const line = source.split('\n')[diag.range.start.line];
		expect(diag.range.start.line).toBe(2);
		expect(line.slice(diag.range.start.character, diag.range.end.character)).toBe('123');
	});

	it('does not leak TS noise from the empty-module fallback', async () => {
		const diagnostics = await checker.check(brokenPath);
		const tsErrors = diagnostics.filter(d => d.source !== 'imba-parser' && d.severity === 1);
		expect(tsErrors).toEqual([]);
	});
});
