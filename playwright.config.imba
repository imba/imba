import type { PlaywrightTestConfig } from '@playwright/test'

const config\PlaywrightTestConfig = 
	use:
		headless: yes
		viewport: { width: 1280, height: 720 }
		ignoreHTTPSErrors: yes
		video: 'retain-on-failure'
	testDir: 'e2e_tests/dist'
	webServer:
		command: "npm run test:e2e-server"
		port: 3003
		timeout: 120s
		reuseExistingServer: !process.env.CI

export default config