import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { compileImba } from '../src/compiler';
import {
	getProjectCompilerForFile,
	isProjectCompilerEnabled,
	setProjectCompilerEnabled,
} from '../src/projectCompiler';

// parity: A10 — useImbaFromProject (opt-in, old default false). In this
// monorepo node_modules/imba resolves to packages/imba, so the "project"
// compiler is a real second resolution path of the same package.

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixture');
const fixtureFile = path.join(fixtureDir, 'main.imba');

afterEach(() => setProjectCompilerEnabled(false));

describe('M3/A10: project-local compiler', () => {
	it('is disabled by default', () => {
		expect(isProjectCompilerEnabled()).toBe(false);
		expect(getProjectCompilerForFile(fixtureFile)).toBeNull();
	});

	it('resolves the imba package above the file when enabled', () => {
		setProjectCompilerEnabled(true);
		const compiler = getProjectCompilerForFile(fixtureFile);
		expect(compiler).not.toBeNull();
		expect(typeof compiler!.compile).toBe('function');
		expect(compiler!.version).toMatch(/^\d+\./);
		// per-package identity cache
		expect(getProjectCompilerForFile(path.join(fixtureDir, 'app.imba'))).toBe(compiler);
	});

	it('compiles through the project compiler end to end', () => {
		setProjectCompilerEnabled(true);
		const out = compileImba(fixtureFile + '.a10-probe.imba', 'export def project-compiled\n\t1\n');
		expect(out.error).toBeUndefined();
		expect(out.js).toContain('projectΞcompiled');
	});

	it('returns null for files outside any imba project', () => {
		setProjectCompilerEnabled(true);
		expect(getProjectCompilerForFile('/tmp/nowhere/file.imba')).toBeNull();
	});
});
