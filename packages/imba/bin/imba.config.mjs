import {defineConfig} from 'imba'
import { builtinModules } from 'module'
import imbaPlugin from 'imba/plugin'
import tsconfigPaths from 'vite-tsconfig-paths-silent'
import np from 'node:path'

const extensions = ['.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']

export default defineConfig({
	client: {
		type: "",
		envPrefix: ['IMBA','VITE'],
		plugins: [imbaPlugin(),  tsconfigPaths({silent: true, loose: true,extensions, projects: [np.resolve(".")]})],
		resolve: { extensions: ['.web.imba', ...extensions] },
		build: {
			outDir: "dist/public",
			manifest: true,
			target: ["chrome88", "edge79", "safari15"],
			ssrManifest: true,
			rollupOptions:{
				output:{
					manualChunks: undefined,
				}
			}
		},
		define: {
			'import.meta.vitest': undefined,
			global: 'window',
		},
	},
	server: {
		appType: "custom",
		envPrefix: ['IMBA','VITE'],
		plugins: [imbaPlugin({ ssr: true }), tsconfigPaths({silent: true, loose: true,extensions, projects: [np.resolve(".")]}),],
		resolve: { extensions: ['.node.imba', ...extensions] },
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
	},
	// we duplicate the plugins and resolve config here for the tests
	plugins: [imbaPlugin(), tsconfigPaths({silent: true, loose: true,extensions, projects: [np.resolve(".")]}),],
	resolve: { extensions: ['.node.imba', ...extensions] },
	test: {
		globals: true,
		include: ["**/*.{test,spec}.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		includeSource: ['**/*.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		environment: "jsdom",
		setupFiles: ['node_modules/imba/bin/test-setup.mjs'],
		define: {
			'import.meta.vitest': undefined,
		},
	}
})
