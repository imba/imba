import { imba } from 'vite-plugin-imba';
import { defineConfig } from 'vite';
import GithubActionsReporter from 'vitest-github-actions-reporter-temp'

export default defineConfig({
	plugins: [imba()],
	define: {
		'import.meta.vitest': 'undefined',
	},
	test: {
		globals: true,
		include: ["**/*.{test,spec}.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		includeSource: ['src/**/*.{imba,js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		environment: "jsdom",
		setupFiles: ["./test/setup.imba"],
		reporters: process.env.GITHUB_ACTIONS
			? new GithubActionsReporter()
			: 'default'
	},
});
