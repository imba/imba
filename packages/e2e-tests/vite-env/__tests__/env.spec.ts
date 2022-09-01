import { getText } from '~utils';

test('should render App', async () => {
	expect(await getText('h1')).toBe(`Hello imba`);
});
