import imbaPlugin, {vitePluginEnvironment} from 'imba/plugin'
import np from 'node:path'
import nfs from 'node:fs'
// do not remove
import url from 'node:url'

const envPrefix = ["VITE_", "IMBA_", "OP_"]

const extensions = ['.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
const setupFiles = ['node_modules/imba/bin/test-setup.all.mjs']

let userTestConfig = {}

export default async function({mode, command}){
	extensions.forEach((ext)=>{
		const name = `test-setup${ext}`
		const path = np.join(process.cwd(), name)
		if(nfs.existsSync(path)){
			setupFiles.push(path)
		}
	})
	let rootPlugins = [imbaPlugin({ssr: true})]
	let rootResolve = { extensions: ['.node.imba', ...extensions], dedupe: ['imba'], conditions: ['imba'] }

	let finalTest = {
		test:{
			globals: true,
			include: ["**/*.{test,spec}.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			includeSource: ['**/*.{imba}'],
			environment: "node",
			setupFiles,
			exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*']
	}}
    if(mode == "test"){
		envPrefix.push("TEST_", "VITEST_")
        /** REPLACE_ME */

		const Vite = await import('vite')
		if (typeof userTestConfig == "function"){
			userTestConfig = userTestConfig({mode, command})
		}
		const env = userTestConfig?.test?.environment || userTestConfig?.environment
		if(env =='jsdom' || env == 'happy-dom'){
			rootPlugins = [imbaPlugin({ssr: false})]
			rootResolve.extensions = ['.vitest.node.imba','.web.imba', '.vitest.imba', ...extensions]
			setupFiles.unshift('node_modules/imba/bin/test-setup.browser.mjs')
		}else{
			rootResolve.extensions = ['.vitest.node.imba','.node.imba', '.vitest.imba', ...extensions]
			// specific stuff to testing in node?
		}

		if(userTestConfig.plugins){
			const d = Vite.mergeConfig({plugins: rootPlugins}, {plugins: userTestConfig.plugins})
			rootPlugins = d.plugins
			delete userTestConfig.plugins;
		}
		finalTest.plugins = rootPlugins
        finalTest = Vite.mergeConfig(finalTest, userTestConfig)
	}
	return ({
		client: {
			worker: {
				plugins: [imbaPlugin(), vitePluginEnvironment("all")],
			},
			envPrefix,
			plugins: [imbaPlugin(), vitePluginEnvironment("all")],
			resolve: {
				conditions: ['imba'],
				extensions: ['.web.imba', ...extensions],
				dedupe: ['imba'],
				// alias: stdLibBrowser
			},
			build: {
				manifest: true,
				target: ["chrome88", "edge79", "safari15"],
				ssrManifest: true,
				rollupOptions:{}
			},
			define: {
				'import.meta.vitest': undefined,
			},
		},
		server: {
			appType: "custom",
			envPrefix,
			plugins: [imbaPlugin({ ssr: true })],
			resolve: { extensions: ['.node.imba', ...extensions], dedupe: ['imba'], conditions: ['imba']  },
			esbuild: {
				target: "node16",
				platform: "node"
			},
			// optimizeDeps:{
			// 	disabled: true
			// },
			ssr: {
				target: "node",
				external: ["imba", "imba/plugin"],
			},
			build: {
				assetsInlineLimit: 0,
				ssr: true,
				target: 'node16',
				minify: false,
				rollupOptions: {
					external: ['imba', 'imba/plugin', new RegExp("/[^\.]^{entry}.*/")],
					output: {
						format: 'esm',
						entryFileNames: "[name].mjs",
					},
					input: {
						//eject entry: "server.imba",
					}
				},
			},
			define: {
				'import.meta.vitest': undefined,
			},
			worker: {
				plugins: [imbaPlugin({ssr:true})]
			},
		},
		// we duplicate the plugins and resolve config here for the tests
		envPrefix,
		plugins: rootPlugins,
		worker: {
			plugins: [imbaPlugin({ssr:true})]
		},
		resolve: rootResolve,
		test: finalTest.test
	})
}