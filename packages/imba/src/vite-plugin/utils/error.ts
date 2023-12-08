import { RollupError } from 'rollup';
import { ResolvedOptions, Warning } from './options';
import { buildExtendedLogMessage } from './log';
import { PartialMessage } from 'esbuild';

const defaultSource = "Compilation Error"

/**
 * convert an error thrown by imba.compile to a RollupError so that vite displays it in a user friendly way
 * @param error a imba compiler error, which is a mix of Warning and an error
 * @returns {RollupError} the converted error
 */
export function toRollupError(error: Warning & Error): RollupError {
	if(!error?.errors?.length){
		return {
			name: "Compilation error",
			id: error._sourcePath,
			message: buildExtendedLogMessage({message: `Compilation error: ${error.message}`}),

		} as RollupError;
	}
	const actualError = error?.errors?.length ? error.errors[0] : {
		diagnostics: [{source: defaultSource}],
		options: {filename: error._sourcePath},
		range: {start: {line: 1, column: 1} },
		message: error?.toString!,
	}
	const source = actualError.source ||
		actualError?.diagnostics[0]?.source ||
		defaultSource
	const name = `${source} error`
	const id = error.options.filename
	const {line, character: column} = actualError.range.start
	// include filename:line:column so that it's clickable
	const loc = { line: line + 1, column, file: id }
	const message = buildExtendedLogMessage({message: actualError.message})
	const code = error.sourceCode + "\n"
	const frame = formatFrameForVite(code, loc)
	// the format this object is RollupError and vite's ErrorPayload.err
	// https://github.com/rollup/rollup/blob/master/src/rollup/types.d.ts#L12
	// https://github.com/vitejs/vite/blob/96591bf9989529de839ba89958755eafe4c445ae/packages/vite/types/hmrPayload.d.ts#L41C18-L41C30
	return {
		name,
		message,
		id,
		frame,
		code,
		loc
	} as RollupError;
}

/**
 * convert an error thrown by imba.compile to an esbuild PartialMessage
 * @param error a imba compiler error, which is a mix of Warning and an error
 * @returns {PartialMessage} the converted error
 */
export function toESBuildError(error: Warning & Error, options: ResolvedOptions): PartialMessage {
	const { filename, frame, start, stack } = error;
	const partialMessage: PartialMessage = {
		text: buildExtendedLogMessage(error)
	};
	if (start) {
		partialMessage.location = {
			line: start.line,
			column: start.column,
			file: filename,
			lineText: lineFromFrame(start.line, frame) // needed to get a meaningful error message on cli
		};
	}
	if (options.isBuild || options.isDebug || !frame) {
		partialMessage.detail = stack;
	}
	return partialMessage;
}

/**
 * extract line with number from codeframe
 */
function lineFromFrame(lineNo: number, frame?: string): string {
	if (!frame) {
		return '';
	}
	const lines = frame.split('\n');
	const errorLine = lines.find((line) => line.trimStart().startsWith(`${lineNo}: `));
	return errorLine ? errorLine.substring(errorLine.indexOf(': ') + 3) : '';
}

/**
 * vite error overlay expects a specific format to show frames
 * this reformats imba frame (colon separated, less whitespace)
 * to one that vite displays on overlay ( pipe separated, more whitespace)
 * e.g.
 * ```
 * 1: foo
 * 2: bar;
 *       ^
 * 3: baz
 * ```
 * to
 * ```
 *  1 | foo
 *  2 | bar;
 *         ^
 *  3 | baz
 * ```
 * @see https://github.com/vitejs/vite/blob/96591bf9989529de839ba89958755eafe4c445ae/packages/vite/src/client/overlay.ts#L116
 */
function formatFrameForVite(code:string, start): string {
	if (!code) {
		return '';
	}
	let frame = code.split("\n").slice(start.line - 2, start.line + 2)
	// TODO maybe: remove a max number of tabs in the begining
	// const prefix = frame.reduce((acc, line, i)=>{
	// 	const lineTabs = (line.match(/^\t*/g) || [''])[0]
	// 	if(i == 0 || acc.length > lineTabs.length){
	// 		return lineTabs
	// 	}
	// 	return acc
	// }, "")
	// let f = frame.map((line, i) => `${start.line + i + 1} |${line.replace(prefix2, "").replace(/\t/g, '  ')}`);
	// tabs are displayed differently using tab-size css property
	// it's better to replace tabs with spaces before displaying in browser
  	let f = frame.map((line, i) => `${start.line + i - 2 + 1} |${line.replace(/\t/g, ' ')}`);
  	f.splice(2, 0, `${" ".repeat(`${start.line}`.length)} |${" ".repeat(start.column)}^`);
  	return f.join("\n");
}
