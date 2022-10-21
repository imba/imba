import { imba } from 'vite-plugin-imba';
import { resolve } from 'path'
import { defineConfig } from 'vite';
import { name } from './package.json'

export default defineConfig({
	plugins: [imba()],
	build: {
		lib: {
			name: name,
			fileName: "index",
			entry: resolve(__dirname, 'src/main.imba'),
		},
	},
});
