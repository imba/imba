import { test, expect } from '@playwright/test'

test 'basic test', do({ page })
	await page.goto "/"
	const link = page.locator('a#imba.io')
	await expect(link).toHaveText 'Learn Imba'
