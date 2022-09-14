import { getText, getColor } from '~utils';

test('should render App', async () => {
	expect(await getText('h1')).toBe(`Hello imba`);
	expect(await getColor('h1')).toBe(`rgb(116, 149, 242)`);
});
