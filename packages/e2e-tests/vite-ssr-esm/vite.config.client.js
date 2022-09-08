import { build, defineConfig } from 'vite';
import { imba } from 'vite-plugin-imba';
import { resolve } from 'path'
import {builtinModules} from 'module'
const entry = resolve(__dirname, "src/entry-client.imba")

export default defineConfig(({ command, mode }) => {
	return {
		plugins: [
			imba()
		],
		ssr: true,
		build: {
			ssrManifest: true,
			manifest: true,
			minify: true,
			rollupOptions: {
				output: {
					dir: "./dist",
					name: "main",
					// assetFileNames:{
					// 	entryFileNames: "assets/[name].js",
					// 	chunkFileNames: "assets/[name].js",
					// 	assetFileNames: "assets/[name].[ext]"
					// }
				},
				input:{
					entry,

				},
			}
		}
	}
});
