import { builtinModules } from 'module'
import {imba} from 'vite-plugin-imba'
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
	return ({
		appType: "custom",
		envPrefix: ['IMBA','VITE'],
		plugins: [imba({ ssr: true })],
		resolve: {
			extensions: ['.node.imba','.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
		},
		esbuild: {
			target: "node16",
			platform: "node"
		},
		ssr: {
			target: "node",
			transformMode: { ssr: [new RegExp(builtinModules.join("|"), 'gi')] },
			external: ["imba", "imba/plugin"]
		},
		build: {
			outDir: "dist_server",
			ssr: true,
			target: 'node16',
			minify: false,
			rollupOptions: {
				external: [new RegExp("/[^\.]^{entry}.*/")],
				output: {
					format: 'esm',
					dir: "dist_server"
				},
				input: {
					//eject entry: "server.imba",
				}
			},
		},
		define: {
			'import.meta.vitest': 'undefined',
		},
		test: {
			globals: true,
			include: ["**/*.{test,spec}.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			includeSource: ['**/*.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
			environment: "jsdom",
			setupFiles: [/*pholder*/],
		}
	})
})