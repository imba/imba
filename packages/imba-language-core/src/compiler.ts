import { compile, type ImbaRawDiagnostic } from 'imba/compiler';

export interface ImbaCompilation {
	js: string;
	/** [generatedStart, generatedEnd, sourceStart, sourceEnd] quadruples from the compiler */
	spans: number[][];
	diagnostics: ImbaRawDiagnostic[];
	/** set when the compiler threw — js falls back to an empty module */
	error?: unknown;
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

export function compileImba(fileName: string, source: string): ImbaCompilation {
	try {
		const res = compile(source, {
			...BASE_OPTIONS,
			fileName,
			sourcePath: fileName,
			nocheck: STDLIB_PATH.test(fileName.split('\\').join('/')) || undefined,
		});
		return {
			js: res.js || EMPTY_JS,
			spans: res.locs?.spans ?? [],
			diagnostics: res.diagnostics ?? [],
		};
	} catch (error) {
		return { js: EMPTY_JS, spans: [], diagnostics: [], error };
	}
}
