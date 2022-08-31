import { findAssetFile, isBuild, getText } from '~utils';

// can't have no tests for test:serve
it('dummy', () => {});

// if (isBuild) {
// 	// difference between dev and prod build?
// 	it('custom production mode should build for production', () => {
// 		const indexBundle = findAssetFile(/index\..*\.js/);
// 		expect(indexBundle).not.toContain('SvelteComponentDev');
// 	});
// }

test('should render App', async () => {
	expect(await getText('h1')).toBe(`Hello imba`);
});
