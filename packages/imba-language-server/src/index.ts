import * as path from 'node:path';
import { createConnection, createServer, loadTsdkByPath } from '@volar/language-server/node';
import { createTypeScriptProject } from '@volar/language-server/lib/project/typescriptProject';
import { createImbaLanguagePlugin, createImbaServicePlugins } from 'imba-language-core';

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
		createImbaServicePlugins(tsdk.typescript)
	);
});

connection.onInitialized(server.initialized);
connection.onShutdown(server.shutdown);
connection.listen();
