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
import { createImbaLanguagePlugin, createImbaServicePlugins, setupImbaProject } from '../src/index';

/**
 * Full Volar LanguageService over a fixture tsconfig — the e2e surface for
 * hover/definition/completion tests (kit's checker only exposes diagnostics).
 * Mirrors @volar/kit's internal createTypeScriptCheckerLanguageService,
 * minus file watching and project references (fixtures are static).
 */
export function createFixtureLanguageService(
	tsconfigPath: string,
	options?: { setup?: boolean }
): LanguageService {
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

	// the SAME project setup the language server runs (typings injection,
	// compiler options) — skipping it made imba.io-scale probes silently
	// lose the imbacss namespace. setup: false simulates a project where no
	// imba install is resolvable (fixture-bare sits inside the monorepo, so
	// the real walk-up lookup WOULD find one).
	if (options?.setup !== false) {
		setupImbaProject({ language, project });
	}

	// the SAME plugin list the language server uses — never hand-assemble
	// plugin lists in tests (drift caused silent false positives in M2)
	return createLanguageService(language, createImbaServicePlugins(ts), env, project);
}

/**
 * A7: language service over a directory with NO tsconfig — simulates the
 * server's inferred project (hostile CommonJS-ish synthesized options, no
 * configFileName) with setupImbaProject applied, exactly like the server
 * setup hook would.
 */
export function createBareLanguageService(rootDir: string): LanguageService {
	const root = asPosix(rootDir);
	const imbaPlugin = createImbaLanguagePlugin<URI>();
	const env = createServiceEnvironment(() => ({}));
	env.workspaceFolders = [URI.file(root)];

	const fileNames = fs
		.readdirSync(rootDir)
		.filter(name => name.endsWith('.imba'))
		.map(name => asPosix(path.join(rootDir, name)));

	// worst-case inferred options (the server synthesizes CommonJS-ish ones)
	const settings: ts.CompilerOptions = {
		allowJs: true,
		allowNonTsExtensions: true,
		module: ts.ModuleKind.CommonJS,
		moduleResolution: ts.ModuleResolutionKind.Node10,
		target: ts.ScriptTarget.ES2017,
	};

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
		getCurrentDirectory: () => root,
		getCompilationSettings: () => settings,
		getProjectVersion: () => '1',
		getScriptFileNames: () => fileNames,
		getProjectReferences: () => undefined,
	};

	const project: ProjectContext = {
		typescript: {
			// no configFileName — this IS the inferred-project shape
			sys: ts.sys,
			uriConverter: { asFileName, asUri },
			...createLanguageServiceHost(ts, ts.sys, language, asUri, projectHost),
		},
	};

	setupImbaProject({ language, project });

	return createLanguageService(language, createImbaServicePlugins(ts), env, project);
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
