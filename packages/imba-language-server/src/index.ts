import * as path from 'node:path';
import { createConnection, createServer, loadTsdkByPath } from '@volar/language-server/node';
import { createTypeScriptProject } from '@volar/language-server/lib/project/typescriptProject';
import { applyImbaConfig, createImbaLanguagePlugin, createImbaServicePlugins, setupImbaProject } from 'imba-language-core';

const connection = createConnection();
const server = createServer(connection);

connection.onInitialize(params => {
	const tsdkPath: string =
		params.initializationOptions?.typescript?.tsdk ??
		path.dirname(require.resolve('typescript/lib/typescript.js'));

	const tsdk = loadTsdkByPath(tsdkPath, params.locale);

	// F3: settings arrive via initializationOptions and (below) live updates
	applyImbaConfig(params.initializationOptions?.imba);

	return server.initialize(
		params,
		createTypeScriptProject(tsdk.typescript, tsdk.diagnosticMessages, () => ({
			languagePlugins: [createImbaLanguagePlugin()],
			// inject imba compiler options + global typings into every
			// project (parity: setCompilerOptions patch + typings lib)
			setup: setupImbaProject,
		})),
		createImbaServicePlugins(tsdk.typescript)
	);
});

connection.onDidChangeConfiguration(change => {
	const settings = (change.settings ?? {}) as { imba?: unknown };
	if (settings.imba !== undefined) {
		applyImbaConfig(settings.imba);
		// suppression/scoping changed — drop cached services so open docs re-check
		server.project?.reload();
	}
});

connection.onInitialized(server.initialized);
connection.onShutdown(server.shutdown);
connection.listen();
