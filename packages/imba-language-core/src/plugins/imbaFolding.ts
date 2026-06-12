import type { LanguageServicePlugin } from '@volar/language-service';

// parity: E7 — the old plugin returned null and editors fell back to their
// own indentation folding. As an LSP server we can't rely on client
// fallbacks (and TS folding mapped from the generated code is degenerate
// noise for imba docs), so fold the way the language reads: by indentation.

const TAB_WIDTH = 4;

/** leading-whitespace width in columns; undefined for blank lines */
function indentColumns(line: string): number | undefined {
	let col = 0;
	let i = 0;
	for (; i < line.length; i++) {
		const ch = line[i];
		if (ch === '\t') {
			col += TAB_WIDTH - (col % TAB_WIDTH);
		} else if (ch === ' ') {
			col += 1;
		} else {
			break;
		}
	}
	return i >= line.length ? undefined : col;
}

export function computeIndentFoldingRanges(text: string): { startLine: number; endLine: number }[] {
	const lines = text.split('\n');
	const ranges: { startLine: number; endLine: number }[] = [];
	const stack: { indent: number; line: number }[] = [];
	let lastContent = -1;

	for (let i = 0; i < lines.length; i++) {
		const indent = indentColumns(lines[i]);
		if (indent === undefined) {
			continue; // blank lines neither open nor close blocks
		}
		while (stack.length && indent <= stack[stack.length - 1].indent) {
			const open = stack.pop()!;
			if (lastContent > open.line) {
				ranges.push({ startLine: open.line, endLine: lastContent });
			}
		}
		stack.push({ indent, line: i });
		lastContent = i;
	}
	while (stack.length) {
		const open = stack.pop()!;
		if (lastContent > open.line) {
			ranges.push({ startLine: open.line, endLine: lastContent });
		}
	}

	return ranges.sort((a, b) => a.startLine - b.startLine || b.endLine - a.endLine);
}

export function createImbaFoldingPlugin(): LanguageServicePlugin {
	return {
		name: 'imba-folding',
		capabilities: {
			foldingRangeProvider: true,
		},
		create() {
			return {
				provideFoldingRanges(document) {
					if (document.languageId !== 'imba') {
						return;
					}
					return computeIndentFoldingRanges(document.getText());
				},
			};
		},
	};
}
