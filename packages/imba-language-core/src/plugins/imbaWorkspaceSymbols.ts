import type { LanguageServicePlugin } from '@volar/language-service';
import { URI } from 'vscode-uri';
import { toImbaIdentifier } from '../conversion';
import { ImbaVirtualCode } from '../virtualCode';
import { getTypeScriptService } from './checkerUtils';
import { LSP_SYMBOL_KIND } from './imbaDocumentSymbols';

// parity: E6 — service.imba getNavigateToItems override: monarch symbols
// from every imba file, fuzzy-matched like the old plugin (query characters
// in order, case-insensitive). TS results for ts/js files merge in from the
// TS plugin; its imba-backed duplicates are filtered in the wrapper.

export function createImbaWorkspaceSymbolsPlugin(): LanguageServicePlugin {
	return {
		name: 'imba-workspace-symbols',
		capabilities: {
			workspaceSymbolProvider: {},
		},
		create(context) {
			return {
				provideWorkspaceSymbols(query) {
					const program = getTypeScriptService(context)?.getProgram();
					if (!program) {
						return [];
					}
					const regex = new RegExp(
						query
							.split('')
							.map(ch => ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
							.join('.*'),
						'i'
					);
					const symbols = [];
					for (const sourceFile of program.getSourceFiles()) {
						if (!sourceFile.fileName.endsWith('.imba')) {
							continue;
						}
						const root = context.language.scripts.get(URI.file(sourceFile.fileName))?.generated?.root;
						if (!(root instanceof ImbaVirtualCode)) {
							continue;
						}
						const text = root.snapshot.getText(0, root.snapshot.getLength());
						for (const item of root.monarchDoc.getNavigateToItems()) {
							const name = toImbaIdentifier(item.name ?? '');
							if (!name || !regex.test(name)) {
								continue;
							}
							const span = item.textSpan;
							symbols.push({
								name,
								kind: LSP_SYMBOL_KIND[String(item.kind ?? '').toLowerCase()] ?? 13,
								containerName: item.containerName || undefined,
								location: {
									uri: URI.file(root.fileName).toString(),
									range: rangeInText(text, span.start, span.length),
								},
							});
						}
					}
					return symbols as never[];
				},
			};
		},
	};
}

function rangeInText(text: string, offset: number, length: number) {
	const before = text.slice(0, offset);
	const line = before.split('\n').length - 1;
	const character = offset - (before.lastIndexOf('\n') + 1);
	return {
		start: { line, character },
		end: { line, character: character + length },
	};
}
