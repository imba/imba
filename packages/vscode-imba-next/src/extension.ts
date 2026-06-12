import * as path from 'node:path';
import * as vscode from 'vscode';
import {
	LanguageClient,
	State,
	TransportKind,
	type LanguageClientOptions,
	type ServerOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;
let statusItem: vscode.StatusBarItem | undefined;

export async function activate(context: vscode.ExtensionContext) {
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
			imba: imbaSettings(),
		},
		// forwards imba.* changes as didChangeConfiguration {settings: {imba}}
		synchronize: { configurationSection: 'imba' },
	};

	client = new LanguageClient('imba-next', 'Imba Next', serverOptions, clientOptions);

	// F2: status bar — server state at a glance, per-file keep-last-good
	// indicator for the active imba editor, click to restart
	statusItem = vscode.window.createStatusBarItem('imba-next.status', vscode.StatusBarAlignment.Right, 99);
	statusItem.name = 'Imba';
	statusItem.command = 'imba-next.restartServer';
	context.subscriptions.push(
		statusItem,
		vscode.commands.registerCommand('imba-next.restartServer', async () => {
			await client?.restart();
		}),
		vscode.window.onDidChangeActiveTextEditor(() => void updateStatus()),
		vscode.languages.onDidChangeDiagnostics(event => {
			const active = vscode.window.activeTextEditor?.document.uri;
			if (active && event.uris.some(uri => uri.toString() === active.toString())) {
				void updateStatus();
			}
		}),
		client.onDidChangeState(() => void updateStatus())
	);

	await client.start();
	void updateStatus();
}

async function updateStatus(): Promise<void> {
	if (!statusItem) {
		return;
	}
	const editor = vscode.window.activeTextEditor;
	if (editor?.document.languageId !== 'imba') {
		statusItem.hide();
		return;
	}
	statusItem.show();
	if (!client || client.state !== State.Running) {
		statusItem.text = '$(error) Imba';
		statusItem.tooltip = 'Imba language server is not running — click to restart';
		statusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
		return;
	}
	let status: { imba?: boolean; recovered?: boolean; crashed?: boolean } = {};
	try {
		status = await client.sendRequest('imba/fileStatus', { uri: editor.document.uri.toString() });
	} catch {
		// server busy/restarting — keep the neutral state
	}
	if (status.crashed) {
		statusItem.text = '$(error) Imba';
		statusItem.tooltip = 'The imba compiler crashed on this file — click to restart the server';
		statusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
	} else if (status.recovered) {
		statusItem.text = '$(warning) Imba';
		statusItem.tooltip =
			'This file does not parse right now — features are served from the last good compilation';
		statusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
	} else {
		statusItem.text = '$(check) Imba';
		statusItem.tooltip = 'Imba language server is running — click to restart';
		statusItem.backgroundColor = undefined;
	}
}

export function deactivate(): Thenable<void> | undefined {
	statusItem?.dispose();
	statusItem = undefined;
	return client?.stop();
}

/** the imba.* section as a plain object for initializationOptions */
function imbaSettings(): Record<string, unknown> {
	const section = vscode.workspace.getConfiguration('imba');
	return {
		useImbaFromProject: section.get('useImbaFromProject'),
		debugLevel: section.get('debugLevel'),
		workspaceSymbolsScope: section.get('workspaceSymbolsScope'),
	};
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
