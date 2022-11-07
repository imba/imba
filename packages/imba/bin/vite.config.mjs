import { builtinModules } from 'module'
import imbaPlugin from 'imba/plugin'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import np from 'node:path'

const extensions = ['.web.imba','.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
export default defineConfig(({ command, mode }) => {
	return ({
		type: "",
		envPrefix: ['IMBA','VITE'],
		plugins: [imbaPlugin(),  tsconfigPaths({loose: true,extensions, projects: [np.resolve(".")]})],
		resolve: { extensions },
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
		test: {
			globals: true,
			include: ["**/*.{test,spec}.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			includeSource: ['**/*.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
			environment: "jsdom",
			setupFiles: [/*pholder*/],
		},
	})
})