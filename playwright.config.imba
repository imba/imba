import type { PlaywrightTestConfig } from '@playwright/test'

const port = process.env.PORT or 3003

const config\PlaywrightTestConfig = 
	use:
		headless: yes
		viewport: { width: 1280, height: 720 }
		ignoreHTTPSErrors: yes
		video: 'on-first-retry'
	testDir: 'e2e_tests/dist'
	webServer:
		command: "PORT={port} npm run test:e2e-server"
		port: port
		timeout: 120s
		reuseExistingServer: !process.env.CI

export default config