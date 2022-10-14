import { defineConfig } from "vite";
import {imba as imbaPlugin} from 'vite-plugin-imba'

export default defineConfig({
	resolve:{
		extensions: ['.imba', '.imba1', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
	},
	plugins: [imbaPlugin({ssr: true})],
	esbuild: {

		target: "node16",
		platform: "node"
	},
	ssr:{
		target: 'node',
		external: ["vite-node"]
	},
	optimizeDeps:{ disabled: true },
	mode: "development",
	appType: "custom"
})