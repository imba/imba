import {defineConfig} from 'imba'
import { builtinModules } from 'module'
import imbaPlugin from 'imba/plugin'
import tsconfigPaths from 'vite-tsconfig-paths-silent'
import np from 'node:path'
import nfs from 'node:fs'

// uppercase letters + _
let envPrefix = [...Array(26).keys()]
	.map((n) => String.fromCharCode(65 + n))
	.concat(['_'])
console.log("env", envPrefix)

const extensions = ['.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
const setupFiles = ['node_modules/imba/bin/test-setup.mjs']

export default defineConfig(()=>{

	extensions.forEach((ext)=>{
		const name = `test-setup${ext}`
		const path = np.join(process.cwd(), name)
		if(nfs.existsSync(path)){
			setupFiles.push(path)
		}
	})

	return ({
		client: {
			type: "",
			envPrefix,
			plugins: [imbaPlugin(),  tsconfigPaths({silent: true, loose: true,extensions, projects: [np.resolve(".")]})],
			resolve: { extensions: ['.web.imba', ...extensions], dedupe: ['imba']  },
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
			envPrefix,
			plugins: [imbaPlugin({ ssr: true }), tsconfigPaths({silent: true, loose: true,extensions, projects: [np.resolve(".")]}),],
			resolve: { extensions: ['.node.imba', ...extensions], dedupe: ['imba']  },
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
					external: ['imba', 'imba/plugin', new RegExp("/[^\.]^{entry}.*/"), "imba", "imba/plugin"],
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
		plugins: [imbaPlugin({ssr: true}), tsconfigPaths({silent: true, loose: true,extensions, projects: [np.resolve(".")]}),],
		envPrefix,
		resolve: { extensions: ['.node.imba', ...extensions], dedupe: ['imba'] },
		test: {
			globals: true,
			include: ["**/*.{test,spec}.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			includeSource: ['**/*.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
			environment: "jsdom",
			setupFiles,
			define: {
				'import.meta.vitest': undefined,
			},
		}
	})
})
