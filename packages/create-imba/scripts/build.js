// Builds bin/create-imba.js — a self-contained executable with all deps
// (prompts, cross-spawn, haikunator) bundled, so the published package has
// zero runtime dependencies. Imba sources are compiled with the prebuilt
// compiler from the sibling imba package in this monorepo.

const fs = require('fs');
const np = require('path');
const esbuild = require('esbuild');

const root = np.resolve(__dirname, '..');
const imbaPkgDir = np.resolve(root, '..', 'imba');
const compiler = require(np.join(imbaPkgDir, 'dist', 'compiler.cjs'));

const imbaVersion = require(np.join(imbaPkgDir, 'package.json')).version;
const ownVersion = require(np.join(root, 'package.json')).version;

const imbaPlugin = {
	name: 'imba',
	setup(build) {
		build.onLoad({ filter: /\.imba$/ }, async (args) => {
			const raw = await fs.promises.readFile(args.path, 'utf8');
			const result = compiler.compile(raw, {
				platform: 'node',
				format: 'esm',
				sourcePath: args.path
			});
			if (result.errors && result.errors.length) {
				const messages = result.errors.map((e) => e.message || String(e));
				return { errors: messages.map((text) => ({ text })) };
			}
			return { contents: result.js, loader: 'js' };
		});
	}
};

esbuild.build({
	entryPoints: [np.join(root, 'src', 'create.imba')],
	outfile: np.join(root, 'bin', 'create-imba.js'),
	bundle: true,
	platform: 'node',
	format: 'cjs',
	target: 'node18',
	resolveExtensions: ['.imba', '.js', '.json'],
	alias: { 'imba/runtime': np.join(root, 'src', 'runtime-shim.js') },
	banner: { js: '#!/usr/bin/env node' },
	define: {
		IMBA_VERSION: JSON.stringify('^' + imbaVersion),
		PKG_VERSION: JSON.stringify(ownVersion)
	},
	plugins: [imbaPlugin],
	logLevel: 'info'
}).then(() => {
	fs.chmodSync(np.join(root, 'bin', 'create-imba.js'), 0o755);
});
