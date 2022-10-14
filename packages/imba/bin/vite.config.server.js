export default {
	resolve: {
		extensions: ['.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
	},
	esbuild: {
		target: "node16",
		platform: "node"
	},
	ssr: {
		target: 'node',
		external: ["vite-node"]
	},
	optimizeDeps: { disabled: true },
	mode: "development",
	appType: "custom"
}