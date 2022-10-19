import { builtinModules } from 'module'
import imbaPlugin from '../plugin.mjs'
import np from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
	console.log("c", command, mode)
	return ({
		appType: "custom",
		plugins: [imbaPlugin({ ssr: false })],
		resolve: {
			extensions: ['.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
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
			setupFiles: [np.join(__dirname, "./test-setup.imba")],
			/** test/setup.imba content
			 *  npm i @testing-library/dom @testing-library/jest-dom
			 *  # Add this file to support testing library things 
			 * 	import '@testing-library/jest-dom'
				import {vi} from "vitest"
				class MockPointerEvent
				vi.stubGlobal "PointerEvent", MockPointerEvent
			 */
		}
	})
})