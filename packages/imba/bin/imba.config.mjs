import np from 'node:path'
import nfs from 'node:fs'
// do not remove
import url from 'node:url'

async function getModulePath(moduleName) {
    let modulePath;

    if (typeof require !== 'undefined' && require.resolve) {
        // CommonJS context
        modulePath = require.resolve(moduleName);
    } else if (typeof import.meta.url !== 'undefined') {
        // ESM context
        const createRequire = (await import('module')).createRequire;
        const require = createRequire(import.meta.url);
        modulePath = require.resolve(moduleName);
    } else {
        throw new Error('Unable to determine module system');
    }

    return np.dirname(modulePath)
}
const envPrefix = ["VITE_", "IMBA_", "OP_"]

const extensions = ['.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']

let userTestConfig = {}

export default async function({mode, command}){
	const imbaPath = await getModulePath('imba')

	function fromBin(path){
		return np.join(imbaPath, 'bin', path)
	}

	const setupFiles = [fromBin('test-setup.all.mjs')]
	const lazy = await import('imba/plugin')
	const imbaPlugin = lazy.default
	const vitePluginEnvironment = lazy.vitePluginEnvironment;
	// import imbaPlugin, {vitePluginEnvironment} from 'imba/plugin'
	extensions.forEach((ext)=>{
		const name = `test-setup${ext}`
		const path = np.join(process.cwd(), name)
		if(nfs.existsSync(path)){
			setupFiles.push(path)
		}
	})
	let rootPlugins = [imbaPlugin({ssr: true})]
	let rootResolve = { extensions: ['.node.imba', ...extensions], dedupe: ['imba'], conditions: ['imba'] }

let server = {
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
		}
	let finalTest = {
		test:{
			globals: true,
			benchmark: {
				include: ["**/*.bench.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			},
			include: ["**/*.{test,spec}.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}", "features/**/*.feature"],
			includeSource: ['**/*.imba'],
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

		if(userTestConfig.resolve){
			const d = Vite.mergeConfig({resolve: rootResolve}, {resolve: userTestConfig.resolve})
			rootResolve = d.resolve
			delete userTestConfig.resolve;
		}

		if(env =='jsdom' || env == 'happy-dom'){
			rootPlugins = [imbaPlugin({ssr: false})]
			rootResolve.extensions = ['.vitest.web.imba', '.vitest.imba', '.web.imba', ...extensions]
			if(process.env.CI){
				rootResolve.extensions.unshift(...['.ci.vitest.web.imba', '.ci.vitest.imba'])
			}
			setupFiles.unshift(fromBin('test-setup.browser.mjs'))
		}else{
			rootResolve.extensions = ['.vitest.node.imba', '.vitest.imba', '.node.imba', ...extensions]
			if(process.env.CI){
				rootResolve.extensions.unshift(...['.ci.vitest.node.imba', '.ci.vitest.imba'])
			}
			// specific stuff to testing in node?
		}
		
		if(userTestConfig.plugins){
			const d = Vite.mergeConfig({plugins: rootPlugins}, {plugins: userTestConfig.plugins})
			rootPlugins = d.plugins
			delete userTestConfig.plugins;
		}
		
		if(userTestConfig.server){
			const d = Vite.mergeConfig({server}, {server: userTestConfig.server})
			server = d.server
			delete userTestConfig.server;
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
		server,
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