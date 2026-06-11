import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as ts from 'typescript';
import { createTypeScriptChecker } from '@volar/kit';
import { SourceMap } from '@volar/source-map';
import { create as createTypeScriptServices } from 'volar-service-typescript';
import { compileImba, createImbaLanguagePlugin, spansToMappings } from '../src/index';

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const tsconfigPath = path.join(fixtureDir, 'tsconfig.json');
const mainImbaPath = path.join(fixtureDir, 'main.imba');
const consumerTsPath = path.join(fixtureDir, 'consumer.ts');

const mainImbaSource = fs.readFileSync(mainImbaPath, 'utf8');

function lineOf(source: string, needle: string): number {
	const offset = source.indexOf(needle);
	expect(offset, `fixture should contain ${JSON.stringify(needle)}`).toBeGreaterThanOrEqual(0);
	return source.slice(0, offset).split('\n').length - 1;
}

function textAt(source: string, range: { start: { line: number; character: number }; end: { line: number; character: number } }): string {
	const lines = source.split('\n');
	if (range.start.line === range.end.line) {
		return lines[range.start.line].slice(range.start.character, range.end.character);
	}
	return lines[range.start.line].slice(range.start.character);
}

describe('mapping round-trips (source ↔ generated)', () => {
	const compilation = compileImba(mainImbaPath, mainImbaSource);

	it('compiles the fixture without throwing', () => {
		expect(compilation.error).toBeUndefined();
		expect(compilation.js.length).toBeGreaterThan(0);
		expect(compilation.spans.length).toBeGreaterThan(0);
	});

	it('maps identifiers precisely in both directions', () => {
		const map = new SourceMap(spansToMappings(compilation.spans));

		for (const name of ['Point', 'greet', 'dist', 'wrong']) {
			const sourceOffset = mainImbaSource.indexOf(name);
			expect(sourceOffset, `${name} in source`).toBeGreaterThanOrEqual(0);

			const generated = [...map.toGeneratedLocation(sourceOffset)];
			expect(generated.length, `${name} should map to generated code`).toBeGreaterThan(0);

			const [generatedOffset] = generated[0];
			expect(compilation.js.slice(generatedOffset, generatedOffset + name.length), `${name} forward`).toBe(name);

			const back = [...map.toSourceLocation(generatedOffset)];
			expect(back.length, `${name} should map back to source`).toBeGreaterThan(0);
			expect(back[0][0], `${name} round-trip`).toBe(sourceOffset);
		}
	});
});

describe('M0: kit checker over the fixture project', () => {
	const checker = createTypeScriptChecker(
		[createImbaLanguagePlugin()],
		createTypeScriptServices(ts),
		tsconfigPath
	);

	it('includes both the imba file and the ts consumer as roots', () => {
		const roots = checker.getRootFileNames().map(f => path.basename(f));
		expect(roots).toContain('main.imba');
		expect(roots).toContain('consumer.ts');
	});

	it('reports the imba type error in imba coordinates', async () => {
		const all = await checker.check(mainImbaPath);

		// every diagnostic (including the 6133 unused-var hint) must land on
		// the `wrong` identifier in the .imba source — proves range mapping
		for (const d of all) {
			expect(textAt(mainImbaSource, d.range)).toBe('wrong');
		}

		// exactly one error-severity diagnostic: the deliberate type error
		const diagnostics = all.filter(d => d.severity === 1);
		expect(diagnostics.length).toBe(1);
		const [diag] = diagnostics;
		expect(diag.code).toBe(2322);
		expect(diag.range.start.line).toBe(lineOf(mainImbaSource, 'let wrong'));
		// the squiggle must land exactly on the `wrong` identifier in the .imba source
		expect(textAt(mainImbaSource, diag.range)).toBe('wrong');
	});

	it('type-checks a .ts file importing a .imba file (cross-boundary types)', async () => {
		const diagnostics = await checker.check(consumerTsPath);

		// module resolution must succeed
		expect(diagnostics.some(d => d.code === 2307), 'should resolve ./main.imba').toBe(false);

		// the only error is the deliberate string→number assignment, proving
		// Point/greet types flowed from the imba file into the ts file
		expect(diagnostics.length).toBe(1);
		const [diag] = diagnostics;
		expect(diag.code).toBe(2322);
		const consumerSource = fs.readFileSync(consumerTsPath, 'utf8');
		expect(diag.range.start.line).toBe(lineOf(consumerSource, 'const bad'));
	});
});
