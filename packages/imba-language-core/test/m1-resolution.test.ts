import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import * as ts from 'typescript';
import { createTypeScriptChecker } from '@volar/kit';
import { create as createTypeScriptServices } from 'volar-service-typescript';
import { createImbaLanguagePlugin } from '../src/index';

// parity: typescript-imba-plugin moduleSuffixes ['.web.imba', '.imba', '']
// (constants.imba) + System.fileExists / TSBase.resolveModuleName patches

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');
const probePath = path.join(fixtureDir, 'probe-resolution.ts');

fs.writeFileSync(
	probePath,
	[
		"import { variant } from './dual';",
		"// if dual.web.imba won (correct), variant() is string; if dual.imba won, number",
		"export const v: string = variant();",
		'',
	].join('\n')
);

afterAll(() => {
	fs.unlinkSync(probePath);
});

describe('M1.1: module resolution (A3/A4)', () => {
	const checker = createTypeScriptChecker(
		[createImbaLanguagePlugin()],
		createTypeScriptServices(ts),
		tsconfigPath
	);

	it('prefers the .web.imba platform variant when both variants exist', async () => {
		const diagnostics = (await checker.check(probePath)).filter(d => d.severity === 1);
		// no 2307 (resolution) and no 2322 (string/number — would mean dual.imba won)
		expect(diagnostics.map(d => `${d.code}: ${d.message}`)).toEqual([]);
	});
});
