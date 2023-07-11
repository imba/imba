import { getEl, getText } from '~utils';

test('should render the svg and pass props', async () => {
	const svg = await getEl("svg")
	const html = await svg.innerHTML()
	expect(html).toMatchSnapshot()
	const title = await svg.getAttribute("title")
	expect(title).toBe('imba is cool')
});

test("supports process.env and overriding envPrefix", async()=>{
	expect(await getText('h1')).toBe("version 1.2")
})
