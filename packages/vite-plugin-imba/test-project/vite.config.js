import { defineConfig } from 'vite'
// import { svelte } from '@sveltejs/vite-plugin-svelte'
import { imba } from 'vite-plugin-imba'

// https://vitejs.dev/config/
export default defineConfig({
	// didn't work for importing imba files without an extension
	// resolve: {
	// 	extensions: ['imba', 'js', 'ts']
	// },
	plugins: [imba()]
})
