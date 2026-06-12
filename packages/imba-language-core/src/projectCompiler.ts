import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';

// parity: A10 — service.imba getImbaCompilerForPath / `useImbaFromProject`.
// Opt-in (old default was false): when enabled, files compile with the imba
// version installed in THEIR project instead of the bundled one. Loading is
// synchronous require (Volar's createVirtualCode is sync), so ESM-only
// compiler builds fall back to the bundled compiler.

export interface ProjectCompiler {
	compile: (source: string, options: Record<string, unknown>) => any;
	version: string;
	packageDir: string;
}

let enabled = process.env.IMBA_USE_PROJECT_COMPILER === '1';

export function setProjectCompilerEnabled(value: boolean): void {
	enabled = value;
}

export function isProjectCompilerEnabled(): boolean {
	return enabled;
}

// per-directory package lookup + per-package loaded compiler (error-once)
const packageDirByDir = new Map<string, string | null>();
const compilerByPackageDir = new Map<string, ProjectCompiler | null>();

function findImbaPackageDir(fromDir: string): string | null {
	const cached = packageDirByDir.get(fromDir);
	if (cached !== undefined) {
		return cached;
	}
	let dir = fromDir;
	let result: string | null = null;
	const visited: string[] = [];
	for (;;) {
		visited.push(dir);
		const candidate = path.join(dir, 'node_modules', 'imba');
		if (fs.existsSync(path.join(candidate, 'package.json'))) {
			result = candidate;
			break;
		}
		const parent = path.dirname(dir);
		if (parent === dir) {
			break;
		}
		dir = parent;
	}
	for (const seen of visited) {
		packageDirByDir.set(seen, result);
	}
	return result;
}

function resolveCompilerEntry(packageDir: string): string | null {
	try {
		const pkg = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
		const entry = pkg.exports?.['./compiler'];
		// require() needs a CJS build — prefer the explicit require condition
		const relative = typeof entry === 'string' ? entry : entry?.require ?? entry?.node ?? entry?.default;
		if (typeof relative !== 'string') {
			return null;
		}
		return path.resolve(packageDir, relative);
	} catch {
		return null;
	}
}

function loadCompiler(packageDir: string): ProjectCompiler | null {
	const cached = compilerByPackageDir.get(packageDir);
	if (cached !== undefined) {
		return cached;
	}
	let result: ProjectCompiler | null = null;
	try {
		const entry = resolveCompilerEntry(packageDir);
		if (entry) {
			const requireFrom = createRequire(path.join(packageDir, 'package.json'));
			const mod = requireFrom(entry);
			const compile = mod?.compile ?? mod?.default?.compile;
			if (typeof compile === 'function') {
				const pkg = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
				result = { compile, version: String(pkg.version ?? 'unknown'), packageDir };
			}
		}
	} catch {
		// ESM-only build, broken install, … — error-once, fall back to bundled
		result = null;
	}
	compilerByPackageDir.set(packageDir, result);
	return result;
}

/**
 * The project-local compiler for a file, or null to use the bundled one.
 * Never returns the project compiler when the feature is disabled.
 */
export function getProjectCompilerForFile(fileName: string): ProjectCompiler | null {
	if (!enabled) {
		return null;
	}
	const packageDir = findImbaPackageDir(path.dirname(fileName));
	return packageDir ? loadCompiler(packageDir) : null;
}

/** a project compiler that crashed at compile time is retired for the session */
export function markProjectCompilerFailed(packageDir: string): void {
	compilerByPackageDir.set(packageDir, null);
}
