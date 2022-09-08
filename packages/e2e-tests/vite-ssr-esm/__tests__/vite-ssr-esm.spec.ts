import {
	editFileAndWaitForHmrComplete,
	getColor,
	getEl,
	getText,
	isBuild,
	untilMatches,
	page,
	e2eServer,
	browserLogs,
	fetchPageText
} from '~utils';

test.todo('/', async () => {
	let pageConsoleListener;
	const connectedPromise = new Promise<void>((resolve) => {
		pageConsoleListener = (data) => {
			const text = data.text();
			if (text.indexOf('main App') > -1) {
				console.log("main App loaded")
				resolve();
			}
		};
		page.on('console', pageConsoleListener);
	});
	await connectedPromise
	await page.waitForLoadState()
	expect(await page.textContent('button')).toMatch('Hello 1 times'); // after hydration
	const html = await fetchPageText();
	expect(html).toMatch('Hello 0 times'); // before hydration
	if (isBuild) {
		// TODO expect preload links
	}
});

test.todo('css', async () => {
	if (isBuild) {
		expect(await getColor('button')).toBe('green');
	} else {
		// During dev, the CSS is loaded from async chunk and we may have to wait
		// when the test runs concurrently.
		await untilMatches(() => getColor('button'), 'green', 'button has color green');
	}
});

// test('loaded esm only package', async () => {
// 	expect(await page.textContent('#esm')).toMatch('esm');
// 	expect(browserLogs).toContain('esm');
// 	expect(e2eServer.logs.server.out).toContain('esm');
// });

// test('loaded external node esm only package', () => {
// 	expect(e2eServer.logs.server.out).toContain('hello_world');
// });

// test('asset', async () => {
// 	// should have no 404s
// 	browserLogs.forEach((msg) => {
// 		expect(msg).not.toMatch('404');
// 	});
// 	const img = await page.$('img');
// 	expect(await img.getAttribute('src')).toMatch(
// 		isBuild ? /\/assets\/logo\.\w{8}\.png/ : '/src/assets/logo.png'
// 	);
// });

if (!isBuild) {
	describe.todo('hmr', () => {
		const updateApp = editFileAndWaitForHmrComplete.bind(null, 'src/main.imba');
		// test('should render additional html', async () => {
		// 	expect(await getEl('#hmr-test')).toBe(null);
		// 	await updateApp((content) =>
		// 		content.replace(
		// 			'<!-- HMR-TEMPLATE-INJECT -->',
		// 			'<div id="hmr-test">foo</div>\n<!-- HMR-TEMPLATE-INJECT -->'
		// 		)
		// 	);
		// 	await untilMatches(() => getText(`#hmr-test`), 'foo', '#hmr-test contains text foo');
		// });
		// TODO: support HMR for styles
		test.skip('should apply style update', async () => {
			expect(await getColor(`button`)).toBe('green');
			await updateApp((content) => content.replace('c:green', 'c:red'));
			await untilMatches(() => getColor('button'), 'red', 'button has color red');
		});
		// test('should not preserve state of updated props', async () => {
		// 	expect(await getText(`#foo`)).toBe('foo');
		// 	await updateApp((content) => content.replace("foo = 'foo'", "foo = 'bar'"));
		// 	await untilMatches(() => getText(`#foo`), 'bar', '#foo contains text bar');
		// });
	});
}
