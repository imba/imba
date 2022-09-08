import { build, defineConfig } from 'vite';
import { imba } from 'vite-plugin-imba';
import { resolve } from 'path'
import {builtinModules} from 'module'
const entry = resolve(__dirname, "server.imba")

const builtins = new RegExp(builtinModules.join("|"), 'gi');

export default defineConfig(({ command, mode }) => {
	return {
		// optimizeDeps: false,
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
		build: {
			ssr: true,
			target: 'node16',
			minify: false,
			rollupOptions: {
				output: {
					format: 'esm',
					dir: "dist_server"
					// dir: "./dist_server"
				},
				input: entry
			}
		}
	}
});
