import { getText, page } from '~utils';

test.todo('should render App', async () => {
	expect(await getText('h1')).toBe(`Hello imba`);
	const styleTags = await page.$$("style")
	expect(styleTags.length).toBe(3)
});
