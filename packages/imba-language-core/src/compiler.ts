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

export function compileImba(fileName: string, source: string): ImbaCompilation {
	try {
		const res = compile(source, {
			...BASE_OPTIONS,
			fileName,
			sourcePath: fileName,
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
