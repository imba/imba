import { test, expect } from '@playwright/test'

test 'context should be accessible for teleported tags', do({ page })
	test.skip yes # known issue
	await page.goto "/context"
	expect(page.locator "text=page: ").not.toBeVisible!
	await page.click "button"
	expect(page.locator "text=page: context").toBeVisible!
