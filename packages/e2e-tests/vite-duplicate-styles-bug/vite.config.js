import { imba } from 'vite-plugin-imba';
import { defineConfig } from 'vite';

export default defineConfig({
	mode: 'staging',
	plugins: [imba()],
	build: {
		// make build faster by skipping transforms and minification
		target: 'esnext',
		minify: false,
		commonjsOptions: {
			// pnpm only symlinks packages, and vite wont process cjs deps not in
			// node_modules, so we add the cjs dep here
			include: [/node_modules/, /cjs-only/]
		}
	},
	server: {
		watch: {
			// During tests we edit the files too fast and sometimes chokidar
			// misses change events, so enforce polling for consistency
			usePolling: true,
			interval: 100
		}
	}
});
