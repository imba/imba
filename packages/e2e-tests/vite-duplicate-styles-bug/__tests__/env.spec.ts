import { getText, page, getColor } from '~utils';

test.todo('should render App', async () => {
	expect(await getText('h1')).toBe(`Hello imba`);
	const styleTags = await page.$$("style")
	// the resets style and the tag style tag
	expect(styleTags.length).toBe(2)
	expect(await getColor("h1")).toBe("rgb(251, 191, 36)")
});
