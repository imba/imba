import { builtinModules } from 'module'
import imbaPlugin from 'imba/plugin'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import np from 'node:path'

const extensions = ['.node.imba','.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
export default defineConfig(({ command, mode }) => {
	return ({
		appType: "custom",
		envPrefix: ['IMBA','VITE'],
		plugins: [imbaPlugin({ ssr: true }), tsconfigPaths({loose: true,extensions, projects: [np.resolve(".")]}),],
		resolve: { extensions },
		esbuild: {
			target: "node16",
			platform: "node"
		},
		optimizeDeps:{
			disabled: true
		},
		ssr: {
			target: "node",
			transformMode: { ssr: [new RegExp(builtinModules.join("|"), 'gi')] },
			external: ["imba", "imba/plugin"]
		},
		build: {
			assetsInlineLimit: 0,
			ssr: true,
			target: 'node16',
			minify: false,
			rollupOptions: {
				external: [new RegExp("/[^\.]^{entry}.*/"), "imba", "imba/plugin"],
				output: {
					format: 'esm',
					dir: "dist",
					entryFileNames: "[name].mjs"
				},
				input: {
					//eject entry: "server.imba",
				}
			},
		},
		define: {
			'import.meta.vitest': undefined,
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