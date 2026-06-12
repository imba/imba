import type { LanguageServicePlugin, SemanticToken } from '@volar/language-service';
import { URI } from 'vscode-uri';
import { ImbaVirtualCode } from '../virtualCode';

// parity: typescript-imba-plugin script.imba getSemanticTokens +
// service.imba getEncodedSemanticClassifications intercept — but emitted as
// standard LSP token types against the identity-mapped root document, so any
// LSP client gets imba-aware highlighting without tsserver involvement.

/** monarch semanticKind → standard LSP semantic token type */
const TYPE_MAP: Record<string, string> = {
	parameter: 'parameter',
	variable: 'variable',
	type: 'type',
	function: 'function',
	member: 'method',
	component: 'class',
};

export const IMBA_SEMANTIC_LEGEND = {
	tokenTypes: ['namespace', 'class', 'method', 'function', 'variable', 'parameter', 'property', 'type'],
	tokenModifiers: ['static', 'defaultLibrary'],
};

export function createImbaSemanticTokensPlugin(): LanguageServicePlugin {
	return {
		name: 'imba-semantic-tokens',
		capabilities: {
			semanticTokensProvider: {
				legend: IMBA_SEMANTIC_LEGEND,
			},
		},
		create(context) {
			return {
				provideDocumentSemanticTokens(document, range, legend) {
					if (document.languageId !== 'imba') {
						return;
					}
					const decoded = context.decodeEmbeddedDocumentUri(URI.parse(document.uri));
					if (!decoded) {
						return;
					}
					const root = context.language.scripts.get(decoded[0])?.generated?.root;
					if (!(root instanceof ImbaVirtualCode) || decoded[1] !== root.id) {
						return;
					}

					const startOffset = document.offsetAt(range.start);
					const endOffset = document.offsetAt(range.end);
					const fallbackType = legend.tokenTypes.indexOf('variable');
					const staticBit = legend.tokenModifiers.indexOf('static');
					const libraryBit = legend.tokenModifiers.indexOf('defaultLibrary');

					const result: SemanticToken[] = [];
					for (const tok of root.monarchDoc.tokens) {
						const sym = tok.symbol;
						if (!sym || tok.offset < startOffset || tok.endOffset > endOffset) {
							continue;
						}
						let type = TYPE_MAP[sym.semanticKind] ?? 'variable';
						if (sym.importedΦ || sym.rootΦ) {
							type = 'namespace';
						}
						let typeIndex = legend.tokenTypes.indexOf(type);
						if (typeIndex < 0) {
							typeIndex = fallbackType;
						}
						if (typeIndex < 0) {
							continue;
						}
						let modifiers = 0;
						if (sym.staticΦ && staticBit >= 0) {
							modifiers |= 1 << staticBit;
						}
						if (sym.globalΦ && libraryBit >= 0) {
							modifiers |= 1 << libraryBit;
						}
						const pos = document.positionAt(tok.offset);
						result.push([pos.line, pos.character, tok.endOffset - tok.offset, typeIndex, modifiers]);
					}
					return result;
				},
			};
		},
	};
}
