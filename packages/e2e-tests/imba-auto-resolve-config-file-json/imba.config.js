import imbaPlugin from 'imba/plugin';
import {defineConfig} from 'imba'

export default defineConfig({
    imba: {
		"theme": {
			"colors": {
				"liloc": {
					"2": "hsl(132, 100%, 95%)",
					"4": "hsl(152, 85%, 86%)"
				}
			}
		}
    },
    client: {
		mode: 'staging',
		plugins: [imbaPlugin()],
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
    }
});
