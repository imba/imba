import { defineConfig } from 'vite';
import imbaPlugin from 'imba/plugin';
import { resolve } from 'path'
import {builtinModules} from 'module'
import url from 'node:url'

// ENTRY
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const entry = resolve(__dirname, "src/main.js")

export default defineConfig(({ command, mode }) => {
	return {
      bundler: "vite",
      server:{
		build: {
			manifest: true,
			minify: true,
			rollupOptions: {
				output: {
					dir: "./dist_server",
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
	}}
});

