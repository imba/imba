import { defineConfig } from 'vite'
import { imba } from 'vite-plugin-imba'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [imba()]
})
