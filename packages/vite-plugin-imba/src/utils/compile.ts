import { CompileOptions, ResolvedOptions } from './options';
import {compile} from '../../../imba/dist/compiler.mjs'

// @ts-ignore
import { createMakeHot } from 'imba-hmr';
import { ImbaRequest } from './id';
import { safeBase64Hash } from './hash';
import { log } from './log';

const scriptLangRE = /<script [^>]*lang=["']?([^"' >]+)["']?[^>]*>/;

const _createCompileImba = (makeHot?: Function) =>
	async function compileImba(
		imbaRequest: ImbaRequest,
		code: string,
		options: Partial<ResolvedOptions>
	): Promise<CompileData> {
		const { filename, normalizedFilename, cssId, ssr } = imbaRequest;
		const { emitCss = true } = options;
		const dependencies = [];
		options.hot = false
		// todo maybe: generate unique short references for all unique paths, cache them between runs, and send those in via sourceId
		const compileOptions: CompileOptions = {
			...options.compilerOptions,
			filename,
			generate: ssr ? 'ssr' : 'dom',
			format: 'esm',
			sourcePath: filename,
			sourcemap: "inline"
		};
		if (options.hot && options.emitCss) {
			const hash = `s-${safeBase64Hash(normalizedFilename)}`;
			log.debug(`setting cssHash ${hash} for ${normalizedFilename}`);
			compileOptions.cssHash = () => hash;
		}
		if (ssr && compileOptions.enableSourcemap !== false) {
			if (typeof compileOptions.enableSourcemap === 'object') {
				compileOptions.enableSourcemap.css = false;
			} else {
				compileOptions.enableSourcemap = { js: true, css: false };
			}
		}

		let preprocessed;

		// if (options.preprocess) {
		// 	try {
		// 		preprocessed = await preprocess(code, options.preprocess, { filename });
		// 	} catch (e) {
		// 		e.message = `Error while preprocessing ${filename}${e.message ? ` - ${e.message}` : ''}`;
		// 		throw e;
		// 	}

		// 	if (preprocessed.dependencies) dependencies.push(...preprocessed.dependencies);
		// }
		const finalCode = preprocessed ? preprocessed.code : code;
		const dynamicCompileOptions = await options.experimental?.dynamicCompileOptions?.({
			filename,
			code: finalCode,
			compileOptions
		});
		if (dynamicCompileOptions && log.debug.enabled) {
			log.debug(
				`dynamic compile options for  ${filename}: ${JSON.stringify(dynamicCompileOptions)}`
			);
		}
		const finalCompileOptions = dynamicCompileOptions
			? {
					...compileOptions,
					...dynamicCompileOptions
			  }
			: compileOptions;
		finalCompileOptions.config = finalCompileOptions
		const compiled = compile(finalCode, finalCompileOptions);
		finalCompileOptions.styles = "extern"
		// compile the code twice, to get the CSS that includes the theme transformations and js that doesn't include 
		// styles.register call which adds a style tag to the DOM.
		const compiled_extern = compile(finalCode, finalCompileOptions);
		compiled.js = {code: compiled_extern.js}
		compiled.css = {code: compiled.css}
		if (emitCss && compiled.css.code) {
			// TODO properly update sourcemap?
			compiled.js.code += `\nimport ${JSON.stringify(cssId)};\n`;
		}
		// https://vitejs.dev/guide/api-plugin.html#handlehotupdate
		// only apply hmr when not in ssr context and hot options are set
		if (!ssr && makeHot) {
			compiled.js.code = makeHot({
				id: filename,
				compiledCode: compiled.js.code,
				hotOptions: options.hot,
				compiled,
				originalCode: code,
				compileOptions: finalCompileOptions
			});
		}

		compiled.js.dependencies = dependencies;
		return {
			filename,
			normalizedFilename,
			lang: code.match(scriptLangRE)?.[1] || 'js',
			// @ts-ignore
			compiled,
			ssr,
			dependencies
		};
	};

// function buildMakeHot(options: ResolvedOptions) {
// 	const needsMakeHot = options.hot !== false && options.isServe && !options.isProduction;
// 	if (needsMakeHot) {
// 		// @ts-ignore
// 		const hotApi = options?.hot?.hotApi;
// 		// @ts-ignore
// 		const adapter = options?.hot?.adapter;
// 		return createMakeHot({
// 			walk,
// 			hotApi,
// 			adapter,
// 			hotOptions: { noOverlay: true, ...(options.hot as object) }
// 		});
// 	}
// }

export function createCompileImba(options: ResolvedOptions) {
	// const makeHot = buildMakeHot(options);
	return _createCompileImba();
}

export interface Code {
	code: string;
	map?: any;
	dependencies?: any[];
}

export interface Compiled {
	js: Code;
	css: Code;
	ast: any; // TODO type
	warnings: any[]; // TODO type
	vars: {
		name: string;
		export_name: string;
		injected: boolean;
		module: boolean;
		mutated: boolean;
		reassigned: boolean;
		referenced: boolean;
		writable: boolean;
		referenced_from_script: boolean;
	}[];
	stats: {
		timings: {
			total: number;
		};
	};
}

export interface CompileData {
	filename: string;
	normalizedFilename: string;
	lang: string;
	compiled: Compiled;
	ssr: boolean | undefined;
	dependencies: string[];
}
