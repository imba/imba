import type { PlaywrightTestConfig } from '@playwright/test'

const config\PlaywrightTestConfig = 
	use:
		headless: yes
		viewport: { width: 1280, height: 720 }
		ignoreHTTPSErrors: yes
		video: 'on-first-retry'
	testDir: 'e2e_tests/dist'

export default config