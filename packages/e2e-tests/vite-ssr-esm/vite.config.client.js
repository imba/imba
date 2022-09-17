import { build, defineConfig } from 'vite';
import { imba } from 'vite-plugin-imba';
import { resolve } from 'path'
import {builtinModules} from 'module'

// ENTRY
const entry = resolve(__dirname, "src/main.js")

export default defineConfig(({ command, mode }) => {
	return {
		plugins: [
			imba()
		],
		resolve:{
			extensions: ['.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
		},
		ssr: true,
		build: {
			ssrManifest: true,
			manifest: true,
			minify: true,
			rollupOptions: {
				output: {
					dir: "./dist",
					name: "main",
				},
				input:{
					entry,
				},
			}
		},
		server: {
			watch: {
				// During tests we edit the files too fast and sometimes chokidar
				// misses change events, so enforce polling for consistency
				usePolling: true,
				interval: 100
			}
		}
	}
});
