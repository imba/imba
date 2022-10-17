import { builtinModules } from 'module'

export default {
	appType: "custom",
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
			}
		},
	}
}