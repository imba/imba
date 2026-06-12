import type { LanguageServicePlugin } from '@volar/language-service';
import { createImbaDiagnosticsPlugin } from './plugins/imbaDiagnostics';
import { createImbaDocumentSymbolsPlugin } from './plugins/imbaDocumentSymbols';
import { createImbaEventsPlugin } from './plugins/imbaEvents';
import { createImbaSemanticTokensPlugin } from './plugins/imbaSemanticTokens';
import { createTypeScriptServices } from './plugins/typescriptServices';

/**
 * The canonical service plugin list. The language server AND every test
 * harness must use this single factory — the M2/E5 work caught the harness
 * silently exercising TS-provided features because the lists had drifted.
 */
export function createImbaServicePlugins(ts: typeof import('typescript')): LanguageServicePlugin[] {
	return [
		// TS-backed features over the virtual code, with imba presentation
		// (suppression rules, identifier conversion) applied
		...createTypeScriptServices(ts),
		// imba compiler parse diagnostics on the source document
		createImbaDiagnosticsPlugin(),
		// monarch-driven semantic highlighting on the root imba document
		createImbaSemanticTokensPlugin(),
		// monarch-driven outline / breadcrumbs
		createImbaDocumentSymbolsPlugin(),
		// event names + modifiers: monarch token → ImbaEvents lookup
		createImbaEventsPlugin(ts),
	];
}
