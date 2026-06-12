import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ImbaCompilation } from './compiler';

/**
 * Two-layer compile cache (G2). Compilation is deterministic for a given
 * (compiler version, options, fileName, source), so entries never need
 * revalidation — the key IS the validity check.
 *
 * - memory: bounded map, absorbs Volar re-creating virtual codes
 * - disk: ~/tmp imba-tooling dir (override: IMBA_CACHE_DIR), absorbs cold
 *   opens across sessions — the old plugin's biggest startup cost was
 *   recompiling every file of a project on every editor launch
 */

/** bump when BASE_OPTIONS or the cached shape changes */
const SCHEMA = 1;
const MEMORY_LIMIT = 256;

const memory = new Map<string, ImbaCompilation>();

let compilerVersion: string | undefined;

function getCompilerVersion(): string {
	if (compilerVersion !== undefined) {
		return compilerVersion;
	}
	try {
		// imba's exports map hides package.json — walk up from the compiler entry
		let dir = path.dirname(require.resolve('imba/compiler'));
		for (let i = 0; i < 4; i++) {
			const pkgPath = path.join(dir, 'package.json');
			if (fs.existsSync(pkgPath)) {
				const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
				if (pkg.name === 'imba') {
					return (compilerVersion = String(pkg.version));
				}
			}
			dir = path.dirname(dir);
		}
	} catch {
		// fall through
	}
	return (compilerVersion = 'unknown');
}

export function getCacheDir(): string {
	return process.env.IMBA_CACHE_DIR || path.join(os.tmpdir(), 'imba-tooling-cache');
}

export function compileCacheKey(fileName: string, source: string, flags: string): string {
	const hash = crypto.createHash('sha1');
	hash.update(`${SCHEMA}|${getCompilerVersion()}|${flags}|${fileName}|`);
	hash.update(source);
	return hash.digest('hex');
}

function diskPath(key: string): string {
	return path.join(getCacheDir(), key.slice(0, 2), `${key}.json`);
}

export function getCachedCompilation(key: string): ImbaCompilation | undefined {
	const hit = memory.get(key);
	if (hit) {
		return hit;
	}
	try {
		const raw = fs.readFileSync(diskPath(key), 'utf8');
		const parsed = JSON.parse(raw) as ImbaCompilation;
		if (typeof parsed.js === 'string' && Array.isArray(parsed.spans)) {
			remember(key, parsed);
			return parsed;
		}
	} catch {
		// miss or unreadable — recompile
	}
	return undefined;
}

export function setCachedCompilation(key: string, result: ImbaCompilation): void {
	remember(key, result);
	// fire-and-forget; never block the compile path on disk io
	const target = diskPath(key);
	fs.mkdir(path.dirname(target), { recursive: true }, err => {
		if (err) {
			return;
		}
		const payload = JSON.stringify({
			js: result.js,
			spans: result.spans,
			diagnostics: result.diagnostics,
		});
		fs.writeFile(target, payload, () => {});
	});
}

function remember(key: string, result: ImbaCompilation): void {
	memory.set(key, result);
	if (memory.size > MEMORY_LIMIT) {
		// Map preserves insertion order — drop the oldest entry
		const oldest = memory.keys().next().value;
		if (oldest !== undefined) {
			memory.delete(oldest);
		}
	}
}

export function clearCompileMemoryCache(): void {
	memory.clear();
}
