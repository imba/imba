import { promises as fs } from 'fs';
// import { compile } from 'imba/compiler';
import {compile} from '../../../imba/dist/compiler.mjs'

import { DepOptimizationOptions } from 'vite';
import { Compiled } from './compile';
import { log } from './log';
import { CompileOptions, ResolvedOptions } from './options';
import { toESBuildError } from './error';

type EsbuildOptions = NonNullable<DepOptimizationOptions['esbuildOptions']>;
type EsbuildPlugin = NonNullable<EsbuildOptions['plugins']>[number];

export const facadeEsbuildImbaPluginName = 'vite-plugin-imba:facade';

export function esbuildImbaPlugin(options: ResolvedOptions): EsbuildPlugin {
	return {
		name: 'vite-plugin-imba:optimize-imba',
		setup(build) {
			// Skip in scanning phase as Vite already handles scanning Imba files.
			// Otherwise this would heavily slow down the scanning phase.
			// if (build.initialOptions.plugins?.some((v) => v.name === 'vite:dep-scan')) return;

			const imbaExtensions = (options.extensions ?? ['.imba']).map((ext) => ext.slice(1));
			const imbaFilter = new RegExp(`\\.(` + imbaExtensions.join('|') + `)(\\?.*)?$`);

			build.onLoad({ filter: imbaFilter }, async ({ path: filename }) => {
				const code = await fs.readFile(filename, 'utf8');
				try {
					const contents = await compileImba(options, { filename, code });
					return { contents };
				} catch (e) {
					return { errors: [toESBuildError(e, options)] };
				}
			});
		}
	};
}

async function compileImba(
	options: ResolvedOptions,
	{ filename, code }: { filename: string; code: string }
): Promise<string> {
	const compileOptions: CompileOptions = {
		...options.compilerOptions,
		css: true,
		filename,
		format: 'esm',
		generate: 'dom',
		sourcePath: filename,
	};

	let preprocessed;

	// if (options.preprocess) {
	// 	try {
	// 		preprocessed = await preprocess(code, options.preprocess, { filename });
	// 	} catch (e) {
	// 		e.message = `Error while preprocessing ${filename}${e.message ? ` - ${e.message}` : ''}`;
	// 		throw e;
	// 	}
	// 	if (preprocessed.map) compileOptions.sourcemap = preprocessed.map;
	// }

	const finalCode = preprocessed ? preprocessed.code : code;

	const dynamicCompileOptions = await options.experimental?.dynamicCompileOptions?.({
		filename,
		code: finalCode,
		compileOptions
	});

	if (dynamicCompileOptions && log.debug.enabled) {
		log.debug(`dynamic compile options for  ${filename}: ${JSON.stringify(dynamicCompileOptions)}`);
	}

	const finalCompileOptions = dynamicCompileOptions
		? {
				...compileOptions,
				...dynamicCompileOptions
		  }
		: compileOptions;

	const compiled = compile(finalCode, finalCompileOptions) as Compiled;

	return compiled.js.code + '//# sourceMappingURL=' + compiled.js.map.toUrl();
}
