import { build, defineConfig } from 'vite';
import { imba } from 'vite-plugin-imba';
import { resolve } from 'path'
import {builtinModules} from 'module'
// Server ENTRY
// const entry = resolve("server.imba")
// Needed for dev mode in order to keep built-in node modules
const builtins = new RegExp(builtinModules.join("|"), 'gi');

export default defineConfig(({ command, mode }) => {
	return {
		define: {
			__APP_VERSION__: '"a1"'
		},
		appType: "custom",
		resolve:{
			extensions: ['.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
		},
		plugins: [
			imba({ssr: true})
		],
		esbuild: {
			target: "node16",
			platform: "node",
		},
		ssr: {
			target:"node",
			transformMode: {ssr: builtins},
			external: ["imba"]
		},
		build: {
			outDir: "./dist_server",
			ssr: true,
			target: 'node16',
			minify: false,
		}
	}
});