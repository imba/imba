import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { imba } from 'vite-plugin-imba'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(),imba()]
})
