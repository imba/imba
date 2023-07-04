import { getEl } from '~utils';

test('should render the svg and pass props', async () => {
	const svg = await getEl("svg")
	debugger
	const html = await svg.innerHTML()
	expect(html).toMatchSnapshot()
	const title = await svg.getAttribute("title")
	expect(title).toBe('imba is cool')
});
