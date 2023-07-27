import { defineConfig } from 'imba';

export default defineConfig({
    bundler: "vite",
    client: {
		envPrefix: ["MY_"],
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
