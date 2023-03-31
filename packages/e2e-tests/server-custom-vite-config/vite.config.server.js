import { builtinModules } from 'module'
import imbaPlugin from 'imba/plugin'

export default function ({ mode }) {
	return {
		appType: "custom",
		define: {
			__APP_VERSION__: '"a1"',
			"import.meta.vitest": undefined
		},
		plugins: [imbaPlugin({ ssr: true })],
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
			external: ["imba"]
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
					entry: "server.imba",
				}
			},
		},
		test: {
			globals: true,
			include: ["**/*.{test,spec}.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			includeSource: ['src/*.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'server.imba'],
			environment: "jsdom",
			setupFiles: ["./setup.imba"],
			/** test/setup.imba content
			 *  npm i @testing-library/dom @testing-library/jest-dom
			 *  # Add this file to support testing library things 
			 * 	import '@testing-library/jest-dom'
				import {vi} from "vitest"
				class MockPointerEvent
				vi.stubGlobal "PointerEvent", MockPointerEvent
			 */
		}
	}
}