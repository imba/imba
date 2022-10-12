import { defineConfig } from 'vite';
import { imba } from '../vite-plugin-imba';
import { resolve } from 'path'
import {builtinModules} from 'module'

// Server ENTRY
const entry = resolve(__dirname, "server.imba")
// Needed for dev mode in order to keep built-in node modules
const builtins = new RegExp(builtinModules.join("|"), 'gi');

export default defineConfig(({ command, mode }) => {
	return {
		// optimizeDeps: false,
		resolve:{
			extensions: ['.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
		},
		plugins: [
			imba()
		],
		esbuild: {
			target: "node16",
			platform: "node",
		},
		ssr: {
			target:"node",
			transformMode: {ssr: builtins}
		},
		// build: {
		// 	ssr: true,
		// 	target: 'node16',
		// 	minify: false,
		// 	rollupOptions: {
		// 		output: {
		// 			format: 'esm',
		// 			dir: "dist_server"
		// 		},
		// 		input: entry
		// 	}
		// },
	}
});
