declare module 'imba/compiler' {
	export interface ImbaRawDiagnostic {
		message: string;
		severity?: 'error' | 'warning' | 'info' | number;
		source?: string;
		range: {
			start: { offset: number; line?: number; character?: number };
			end: { offset: number; line?: number; character?: number };
		};
	}

	export interface ImbaCompileResult {
		js?: string;
		css?: string;
		sourceId?: string;
		diagnostics?: ImbaRawDiagnostic[];
		locs?: {
			/** [generatedStart, generatedEnd, sourceStart, sourceEnd] quadruples, hierarchical/overlapping */
			spans: number[][];
		};
	}

	export function compile(code: string, options: Record<string, unknown>): ImbaCompileResult;
}
