import * as path from 'node:path';
import * as vscode from 'vscode';
import {
	LanguageClient,
	TransportKind,
	type LanguageClientOptions,
	type ServerOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export async function activate(_context: vscode.ExtensionContext) {
	// resolved through node_modules (workspace symlink during development)
	const serverModule = require.resolve('imba-language-server');

	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: { execArgv: ['--nolazy', '--inspect=6019'] },
		},
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ language: 'imba' }],
		initializationOptions: {
			typescript: { tsdk: resolveTsdk() },
		},
	};

	client = new LanguageClient('imba-next', 'Imba Next', serverOptions, clientOptions);
	await client.start();
}

export function deactivate(): Thenable<void> | undefined {
	return client?.stop();
}

/** honor typescript.tsdk when set; fall back to the bundled TypeScript */
function resolveTsdk(): string {
	const configured = vscode.workspace.getConfiguration('typescript').get<string>('tsdk');
	if (configured) {
		if (path.isAbsolute(configured)) {
			return configured;
		}
		const folder = vscode.workspace.workspaceFolders?.[0];
		if (folder) {
			return path.join(folder.uri.fsPath, configured);
		}
	}
	return path.dirname(require.resolve('typescript/lib/typescript.js'));
}
