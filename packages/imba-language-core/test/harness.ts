import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';
import { URI } from 'vscode-uri';
import {
	createLanguage,
	createLanguageService,
	createUriMap,
	type LanguageService,
	type ProjectContext,
} from '@volar/language-service';
import { createLanguageServiceHost, resolveFileLanguageId } from '@volar/typescript';
import { createServiceEnvironment } from '@volar/kit/lib/createServiceEnvironment';
import { asFileName, asPosix, asUri } from '@volar/kit/lib/utils';
import {
	createImbaDiagnosticsPlugin,
	createImbaLanguagePlugin,
	createTypeScriptServices,
} from '../src/index';

/**
 * Full Volar LanguageService over a fixture tsconfig — the e2e surface for
 * hover/definition/completion tests (kit's checker only exposes diagnostics).
 * Mirrors @volar/kit's internal createTypeScriptCheckerLanguageService,
 * minus file watching and project references (fixtures are static).
 */
export function createFixtureLanguageService(tsconfigPath: string): LanguageService {
	const configPath = asPosix(tsconfigPath);
	const imbaPlugin = createImbaLanguagePlugin<URI>();
	const env = createServiceEnvironment(() => ({}));
	env.workspaceFolders = [URI.file(path.dirname(configPath))];

	const commandLine = ts.parseJsonSourceFileConfigFileContent(
		ts.readJsonConfigFile(configPath, ts.sys.readFile),
		ts.sys,
		path.dirname(configPath),
		undefined,
		configPath,
		undefined,
		imbaPlugin.typescript?.extraFileExtensions ?? []
	);

	const fsFileSnapshots = createUriMap<[number | undefined, ts.IScriptSnapshot | undefined]>();
	const language = createLanguage<URI>(
		[imbaPlugin, { getLanguageId: uri => resolveFileLanguageId(uri.path) }],
		createUriMap(ts.sys.useCaseSensitiveFileNames),
		(uri, includeFsFiles) => {
			if (!includeFsFiles) {
				return;
			}
			const fileName = asFileName(uri);
			const cache = fsFileSnapshots.get(uri);
			const modifiedTime = ts.sys.getModifiedTime?.(fileName)?.valueOf();
			if (!cache || cache[0] !== modifiedTime) {
				const text = ts.sys.fileExists(fileName) ? ts.sys.readFile(fileName) : undefined;
				const snapshot = text !== undefined ? ts.ScriptSnapshot.fromString(text) : undefined;
				fsFileSnapshots.set(uri, [modifiedTime, snapshot]);
			}
			const snapshot = fsFileSnapshots.get(uri)?.[1];
			if (snapshot) {
				language.scripts.set(uri, snapshot);
			} else {
				language.scripts.delete(uri);
			}
		}
	);

	const projectHost = {
		getCurrentDirectory: () => path.dirname(configPath),
		getCompilationSettings: () => commandLine.options,
		getProjectVersion: () => '1',
		getScriptFileNames: () => commandLine.fileNames.map(asPosix),
		getProjectReferences: () => commandLine.projectReferences,
	};

	const project: ProjectContext = {
		typescript: {
			configFileName: configPath,
			sys: ts.sys,
			uriConverter: { asFileName, asUri },
			...createLanguageServiceHost(ts, ts.sys, language, asUri, projectHost),
		},
	};

	return createLanguageService(
		language,
		[...createTypeScriptServices(ts), createImbaDiagnosticsPlugin()],
		env,
		project
	);
}

export interface FixtureLocation {
	uri: URI;
	position: { line: number; character: number };
	fileName: string;
}

/** Locate `needle` in a fixture file and return its LSP position (plus `offset` chars). */
export function locate(fileName: string, needle: string, offset = 0): FixtureLocation {
	const source = fs.readFileSync(fileName, 'utf8');
	const index = source.indexOf(needle);
	if (index < 0) {
		throw new Error(`${JSON.stringify(needle)} not found in ${fileName}`);
	}
	const at = index + offset;
	const before = source.slice(0, at);
	const line = before.split('\n').length - 1;
	const character = at - (before.lastIndexOf('\n') + 1);
	return { uri: URI.file(fileName), position: { line, character }, fileName };
}
