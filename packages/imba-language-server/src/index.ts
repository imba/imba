import * as path from 'node:path';
import { createConnection, createServer, loadTsdkByPath } from '@volar/language-server/node';
import { createTypeScriptProject } from '@volar/language-server/lib/project/typescriptProject';
import { createImbaDiagnosticsPlugin, createImbaLanguagePlugin } from 'imba-language-core';
import { create as createTypeScriptServices } from 'volar-service-typescript';

const connection = createConnection();
const server = createServer(connection);

connection.onInitialize(params => {
	const tsdkPath: string =
		params.initializationOptions?.typescript?.tsdk ??
		path.dirname(require.resolve('typescript/lib/typescript.js'));

	const tsdk = loadTsdkByPath(tsdkPath, params.locale);

	return server.initialize(
		params,
		createTypeScriptProject(tsdk.typescript, tsdk.diagnosticMessages, () => ({
			languagePlugins: [createImbaLanguagePlugin()],
		})),
		[
			// TS-backed features over the virtual code: diagnostics, hover,
			// definitions, references, rename, completions, semantic tokens.
			// Imba-specific service plugins (styles, tags, monarch-driven
			// completions) get added alongside these in M2.
			...createTypeScriptServices(tsdk.typescript),
			// imba compiler parse diagnostics on the source document
			createImbaDiagnosticsPlugin(),
		]
	);
});

connection.onInitialized(server.initialized);
connection.onShutdown(server.shutdown);
connection.listen();
