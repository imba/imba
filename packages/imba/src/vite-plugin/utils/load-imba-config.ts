import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { log } from './log';
import { Options, ImbaOptions } from './options';
import { UserConfig } from 'vite';

// used to require cjs config in esm.
// NOTE dynamic import() cjs technically works, but timestamp query cache bust
// have no effect, likely because it has another internal cache?
let esmRequire: NodeRequire;

export const knownImbaConfigNames = [
	'imba.config.mjs',
	'imba.config.js',
	'imbaconfig.json',
	'imba.config.json',
	// 'imba.config.imba',
	// 'imba.config.ts',
	// 'imba.config.cjs',
	// 'imba.config.mjs'
];

// hide dynamic import from ts transform to prevent it turning into a require
// see https://github.com/microsoft/TypeScript/issues/43329#issuecomment-811606238
// also use timestamp query to avoid caching on reload
const dynamicImportDefault = new Function(
	'path',
	'timestamp',
	'return import(path + "?t=" + timestamp).then(m => m.default)'
);

const dynamicImportJSON = new Function(
	'path',
	'timestamp',
	'return import(path + "?t=" + timestamp, {assert: {type: "json"}}).then(m => m.default)'
);

export async function loadImbaConfig(
	viteConfig?: UserConfig,
	inlineOptions?: Partial<Options>
): Promise<Partial<ImbaOptions> | undefined> {
	if (inlineOptions?.configFile === false) {
		return;
	}
	const configFile = findConfigToLoad(viteConfig, inlineOptions);
	if (configFile) {
		let err;
		if (configFile.endsWith('.json')) {
			try {
				const result = await dynamicImportJSON(
					pathToFileURL(configFile).href,
					fs.statSync(configFile).mtimeMs
				);
				if (result != null) {
					return {
						...result,
						configFile
					};
				} else {
					throw new Error(`invalid export in ${configFile}`);
				}
			} catch (e) {
				log.error(`failed to import config ${configFile}`, e);
				err = e;
			}
		}
		// try to use dynamic import for imba.config.js first
		if (configFile.endsWith('.js') || configFile.endsWith('.mjs') || configFile.endsWith('.json')) {
			try {
				const result = await dynamicImportDefault(
					pathToFileURL(configFile).href,
					fs.statSync(configFile).mtimeMs
				);
				if (result != null) {
					return {
						...result,
						configFile
					};
				} else {
					throw new Error(`invalid export in ${configFile}`);
				}
			} catch (e) {
				log.error(`failed to import config ${configFile}`, e);
				err = e;
			}
		}
		// cjs or error with dynamic import
		if (!configFile.endsWith('.mjs')) {
			try {
				// identify which require function to use (esm and cjs mode)
				const _require = import.meta.url
					? (esmRequire ??= createRequire(import.meta.url))
					: require;

				// avoid loading cached version on reload
				delete _require.cache[_require.resolve(configFile)];
				const result = _require(configFile);
				if (result != null) {
					return {
						...result,
						configFile
					};
				} else {
					throw new Error(`invalid export in ${configFile}`);
				}
			} catch (e) {
				log.error(`failed to require config ${configFile}`, e);
				if (!err) {
					err = e;
				}
			}
		}
		// failed to load existing config file
		throw err;
	}
}

function findConfigToLoad(viteConfig?: UserConfig, inlineOptions?: Partial<Options>) {
	const root = viteConfig?.root || process.cwd();
	if (inlineOptions?.configFile) {
		const abolutePath = path.isAbsolute(inlineOptions.configFile)
			? inlineOptions.configFile
			: path.resolve(root, inlineOptions.configFile);
		if (!fs.existsSync(abolutePath)) {
			throw new Error(`failed to find imba config file ${abolutePath}.`);
		}
		return abolutePath;
	} else {
		const existingKnownConfigFiles = knownImbaConfigNames
			.map((candidate) => path.resolve(root, candidate))
			.filter((file) => fs.existsSync(file));
		if (existingKnownConfigFiles.length === 0) {
			log.debug(`no imba config found at ${root}`);
			return;
		} else if (existingKnownConfigFiles.length > 1) {
			log.warn(
				`found more than one imba config file, using ${existingKnownConfigFiles[0]}. you should only have one!`,
				existingKnownConfigFiles
			);
		}
		return existingKnownConfigFiles[0];
	}
}
