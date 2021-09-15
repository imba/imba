import { test, expect } from '@playwright/test'

test 'basic test', do({ page })
	await page.goto "/"
	const link = page.locator('a')
	await expect(link).toHaveText 'Learn Imba'
