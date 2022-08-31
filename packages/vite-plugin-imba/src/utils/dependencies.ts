import { log } from './log';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

export function findRootImbaDependencies(root: string, cwdFallback = true): ImbaDependency[] {
	log.debug(`findImbaDependencies: searching imba dependencies in ${root}`);
	const pkgFile = path.join(root, 'package.json');
	if (!fs.existsSync(pkgFile)) {
		if (cwdFallback) {
			const cwd = process.cwd();
			if (root !== cwd) {
				log.debug(`no package.json found in vite root ${root}`);
				return findRootImbaDependencies(cwd, false);
			}
		}
		log.warn(`no package.json found, findRootImbaDependencies failed`);
		return [];
	}

	const pkg = parsePkg(root);
	if (!pkg) {
		return [];
	}

	const deps = [
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.devDependencies || {})
	].filter((dep) => !is_common_without_imba_field(dep));

	return getImbaDependencies(deps, root);
}

function getImbaDependencies(
	deps: string[],
	pkgDir: string,
	path: string[] = []
): ImbaDependency[] {
	const result = [];
	const localRequire = createRequire(`${pkgDir}/package.json`);
	const resolvedDeps = deps
		.map((dep) => resolveDependencyData(dep, localRequire))
		.filter(Boolean) as DependencyData[];
	for (const { pkg, dir } of resolvedDeps) {
		const type = getImbaDependencyType(pkg);
		if (!type) continue;
		result.push({ name: pkg.name, type, pkg, dir, path });
		// continue crawling for component libraries so we can optimize them, js libraries are fine
		if (type === 'component-library' && pkg.dependencies) {
			let dependencyNames = Object.keys(pkg.dependencies);
			const circular = dependencyNames.filter((name) => path.includes(name));
			if (circular.length > 0) {
				log.warn.enabled &&
					log.warn(
						`skipping circular imba dependencies in automated vite optimizeDeps handling`,
						circular.map((x) => path.concat(x).join('>'))
					);
				dependencyNames = dependencyNames.filter((name) => !path.includes(name));
			}
			if (path.length === 3) {
				log.debug.once(`encountered deep imba dependency tree: ${path.join('>')}`);
			}
			result.push(...getImbaDependencies(dependencyNames, dir, path.concat(pkg.name)));
		}
	}
	return result;
}

export function resolveDependencyData(
	dep: string,
	localRequire: NodeRequire
): DependencyData | void {
	try {
		const pkgJson = `${dep}/package.json`;
		const pkg = localRequire(pkgJson);
		const dir = path.dirname(localRequire.resolve(pkgJson));
		return { dir, pkg };
	} catch (e) {
		log.debug.once(`dependency ${dep} does not export package.json`, e);
		// walk up from default export until we find package.json with name=dep
		try {
			let dir = path.dirname(localRequire.resolve(dep));
			while (dir) {
				const pkg = parsePkg(dir, true);
				if (pkg && pkg.name === dep) {
					return { dir, pkg };
				}
				const parent = path.dirname(dir);
				if (parent === dir) {
					break;
				}
				dir = parent;
			}
		} catch (e) {
			log.debug.once(`error while trying to find package.json of ${dep}`, e);
		}
	}
	log.debug.once(`failed to resolve ${dep}`);
}

function parsePkg(dir: string, silent = false): Pkg | void {
	const pkgFile = path.join(dir, 'package.json');
	try {
		return JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
	} catch (e) {
		!silent && log.warn.enabled && log.warn(`failed to parse ${pkgFile}`, e);
	}
}

function getImbaDependencyType(pkg: Pkg): ImbaDependencyType | undefined {
	if (isImbaComponentLib(pkg)) {
		return 'component-library';
	} else if (isImbaLib(pkg)) {
		return 'js-library';
	} else {
		return undefined;
	}
}

function isImbaComponentLib(pkg: Pkg) {
	return !!pkg.imba;
}

function isImbaLib(pkg: Pkg) {
	return !!pkg.dependencies?.imba || !!pkg.peerDependencies?.imba;
}

const COMMON_DEPENDENCIES_WITHOUT_IMBA_FIELD = [
	'@lukeed/uuid',
	'@playwright/test',
	'@imbajs/vite-plugin-imba',
	'@imbajs/kit',
	'autoprefixer',
	'cookie',
	'dotenv',
	'esbuild',
	'eslint',
	'jest',
	'mdsvex',
	'playwright',
	'postcss',
	'prettier',
	'imba',
	'imba-check',
	'imba-hmr',
	'imba-preprocess',
	'tslib',
	'typescript',
	'vite',
	'vitest',
	'__vite-browser-external' // see https://github.com/imbajs/vite-plugin-imba/issues/362
];
const COMMON_PREFIXES_WITHOUT_IMBA_FIELD = [
	'@fontsource/',
	'@postcss-plugins/',
	'@rollup/',
	'@imbajs/adapter-',
	'@types/',
	'@typescript-eslint/',
	'eslint-',
	'jest-',
	'postcss-plugin-',
	'prettier-plugin-',
	'rollup-plugin-',
	'vite-plugin-'
];

/**
 * Test for common dependency names that tell us it is not a package including a imba field, eg. eslint + plugins.
 *
 * This speeds up the find process as we don't have to try and require the package.json for all of them
 *
 * @param dependency {string}
 * @returns {boolean} true if it is a dependency without a imba field
 */
export function is_common_without_imba_field(dependency: string): boolean {
	return (
		COMMON_DEPENDENCIES_WITHOUT_IMBA_FIELD.includes(dependency) ||
		COMMON_PREFIXES_WITHOUT_IMBA_FIELD.some(
			(prefix) =>
				prefix.startsWith('@')
					? dependency.startsWith(prefix)
					: dependency.substring(dependency.lastIndexOf('/') + 1).startsWith(prefix) // check prefix omitting @scope/
		)
	);
}

export function needsOptimization(dep: string, localRequire: NodeRequire): boolean {
	const depData = resolveDependencyData(dep, localRequire);
	if (!depData) return false;
	const pkg = depData.pkg;
	// only optimize if is cjs, using the below as heuristic
	// see https://github.com/imbajs/vite-plugin-imba/issues/162
	const hasEsmFields = pkg.module || pkg.exports;
	if (hasEsmFields) return false;
	if (pkg.main) {
		// ensure entry is js so vite can prebundle it
		// see https://github.com/imbajs/vite-plugin-imba/issues/233
		const entryExt = path.extname(pkg.main);
		return !entryExt || entryExt === '.js' || entryExt === '.cjs';
	} else {
		// check if has implicit index.js entrypoint
		// https://github.com/imbajs/vite-plugin-imba/issues/281
		try {
			localRequire.resolve(`${dep}/index.js`);
			return true;
		} catch {
			return false;
		}
	}
}

interface DependencyData {
	dir: string;
	pkg: Pkg;
}

export interface ImbaDependency {
	name: string;
	type: ImbaDependencyType;
	dir: string;
	pkg: Pkg;
	path: string[];
}

// component-library => exports imba components
// js-library        => only uses imba api, no components
export type ImbaDependencyType = 'component-library' | 'js-library';

export interface Pkg {
	name: string;
	imba?: string;
	dependencies?: DependencyList;
	devDependencies?: DependencyList;
	peerDependencies?: DependencyList;
	[key: string]: any;
}

export interface DependencyList {
	[key: string]: string;
}
