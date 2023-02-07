import { defineConfig } from 'imba'

export default defineConfig({
	server: { define: { __APP_VERSION__: "1.1" } },
	client: { envPrefix: "MY" }
})
