import { compile, type ImbaRawDiagnostic } from 'imba/compiler';
import { compileCacheKey, getCachedCompilation, setCachedCompilation } from './cache';
import { getProjectCompilerForFile, markProjectCompilerFailed } from './projectCompiler';

export interface ImbaCompilation {
	js: string;
	/** [generatedStart, generatedEnd, sourceStart, sourceEnd] quadruples from the compiler */
	spans: number[][];
	diagnostics: ImbaRawDiagnostic[];
	/** set when the compiler threw */
	error?: unknown;
	/**
	 * G4: js + spans are the last GOOD compilation of this file — the current
	 * source is broken beyond parse recovery (or the compiler threw), and an
	 * empty module would cascade missing-export errors into every importer
	 * mid-keystroke. Diagnostics are always from the CURRENT attempt; spans
	 * are stale relative to the live source by exactly the unparsable edit.
	 */
	recovered?: boolean;
}

const EMPTY_JS = 'export {};\n';

const BASE_OPTIONS = {
	target: 'tsc',
	platform: 'tsc',
	imbaPath: null,
	silent: true,
	noAnyTypes: true,
	sourcemap: 'hidden',
} as const;

// parity: typescript-imba-plugin compiler.imba — the imba stdlib sources are
// compiled with nocheck (they predate noAnyTypes and would drown in noise).
// The second pattern matches the monorepo/symlinked layout.
const STDLIB_PATH = /node_modules\/imba\/src\/imba\/|\/packages\/imba\/src\/imba\//;

// last successful compilation per file, for the keep-last-good substitution.
// Session-scoped on purpose: the content-hash cache stores RAW results only,
// so a substituted module can never leak into another session via the cache.
const LAST_GOOD_LIMIT = 256;
const lastGoodByFile = new Map<string, { js: string; spans: number[][] }>();

function rememberLastGood(fileName: string, js: string, spans: number[][]): void {
	lastGoodByFile.delete(fileName);
	lastGoodByFile.set(fileName, { js, spans });
	if (lastGoodByFile.size > LAST_GOOD_LIMIT) {
		const oldest = lastGoodByFile.keys().next().value;
		if (oldest !== undefined) {
			lastGoodByFile.delete(oldest);
		}
	}
}

/** mirrors imbaDiagnostics' toSeverity: anything not warning/info is an error */
function hasErrorDiagnostic(diagnostics: ImbaRawDiagnostic[]): boolean {
	return diagnostics.some(d => {
		const raw = d.severity as unknown;
		if (typeof raw === 'number') {
			return raw === 1 || raw < 1 || raw > 4;
		}
		return raw !== 'warning' && raw !== 'info';
	});
}

/**
 * Serve the last good module while the current source is unparsable. A file
 * the user deliberately emptied compiles CLEANLY to an empty module and is
 * never substituted — only parse failures and compiler crashes are.
 */
function withLastGood(fileName: string, raw: ImbaCompilation): ImbaCompilation {
	const failed = raw.error !== undefined || (raw.js === EMPTY_JS && hasErrorDiagnostic(raw.diagnostics));
	if (!failed) {
		rememberLastGood(fileName, raw.js, raw.spans);
		return raw;
	}
	const lastGood = lastGoodByFile.get(fileName);
	if (!lastGood) {
		return raw;
	}
	return {
		js: lastGood.js,
		spans: lastGood.spans,
		diagnostics: raw.diagnostics,
		error: raw.error,
		recovered: true,
	};
}

export function compileImba(fileName: string, source: string): ImbaCompilation {
	const nocheck = STDLIB_PATH.test(fileName.split('\\').join('/'));
	// A10 (opt-in): compile with the project's own imba version. The cache
	// key carries that version — entries from different compilers never mix.
	const projectCompiler = getProjectCompilerForFile(fileName);
	const flags = `${nocheck ? 'nocheck' : ''}${projectCompiler ? `|imba@${projectCompiler.version}` : ''}`;
	const key = compileCacheKey(fileName, source, flags);

	const cached = getCachedCompilation(key);
	if (cached) {
		return withLastGood(fileName, cached);
	}

	const options = {
		...BASE_OPTIONS,
		fileName,
		sourcePath: fileName,
		nocheck: nocheck || undefined,
	};

	if (projectCompiler) {
		try {
			const res = projectCompiler.compile(source, options);
			const result: ImbaCompilation = {
				js: res.js || EMPTY_JS,
				spans: res.locs?.spans ?? [],
				diagnostics: res.diagnostics ?? [],
			};
			setCachedCompilation(key, result);
			return withLastGood(fileName, result);
		} catch {
			// a crashing project compiler is retired for the session — retry
			// resolves to the bundled compiler with its own cache key (the
			// fallback result must not be stored under the project key)
			markProjectCompilerFailed(projectCompiler.packageDir);
			return compileImba(fileName, source);
		}
	}

	try {
		const res = compile(source, options);
		const result: ImbaCompilation = {
			js: res.js || EMPTY_JS,
			spans: res.locs?.spans ?? [],
			diagnostics: res.diagnostics ?? [],
		};
		setCachedCompilation(key, result);
		return withLastGood(fileName, result);
	} catch (error) {
		// environment-specific failures are not cacheable
		return withLastGood(fileName, { js: EMPTY_JS, spans: [], diagnostics: [], error });
	}
}
