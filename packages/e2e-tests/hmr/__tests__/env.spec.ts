import {
  addFile,
  browserLogs,
  editFile,
  editFileAndWaitForHmrComplete,
  editViteConfig,
  getColor,
  getEl,
  getText,
  isBuild,
  isWin,
  page,
  removeFile,
  sleep,
  untilMatches,
  viteTestUrl,
} from "~utils";

test("should render App", async () => {
  expect(await getText("h1")).toBe("Hello imba");
});

if (!isBuild) {
  describe("hmr", () => {
    const updateApp = editFileAndWaitForHmrComplete.bind(null, "src/app.imba");

    test("should have expected initial state", async () => {
      // initial state, both counters 0, both labels red
      expect(await getColor("h1")).toBe("rgb(251, 191, 36)");
    });

    test("should apply css changes in app.imba", async () => {
      // update style, change label color from amber4 to green
      await updateApp((content) => content.replace("c:amber4", "c:green"));

      // color should have changed
      expect(await getColor(`h1`)).toBe("green");
    });

    // test('should apply js change in HmrTest.svelte ', async () => {
    // 	// update script, change label value
    // 	await updateHmrTest((content) =>
    // 		content.replace("const label = 'hmr-test'", "const label = 'hmr-test-updated'")
    // 	);
    // 	expect(await getText(`#hmr-test-1 .label`)).toBe('hmr-test-updated');
    // 	expect(await getText(`#hmr-test-2 .label`)).toBe('hmr-test-updated');
    // });

    // test('should keep state of external store intact on change of HmrTest.svelte', async () => {
    // 	// counter state should remain
    // 	await updateHmrTest((content) =>
    // 		content.replace('<!-- HMR-TEMPLATE-INJECT -->', '<span/>\n<!-- HMR-TEMPLATE-INJECT -->')
    // 	);
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('1');
    // 	expect(await getText(`#hmr-test-2 .counter`)).toBe('0');
    // });

    // test('should preserve state of external store used by HmrTest.svelte when editing App.svelte', async () => {
    // 	// update App, add a new instance of HmrTest
    // 	await updateApp((content) =>
    // 		content.replace(
    // 			'<!-- HMR-TEMPLATE-INJECT -->',
    // 			'<HmrTest id="hmr-test-3"/>\n<!-- HMR-TEMPLATE-INJECT -->'
    // 		)
    // 	);
    // 	// counter state is preserved
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('1');
    // 	expect(await getText(`#hmr-test-2 .counter`)).toBe('0');
    // 	// a third instance has been added
    // 	expect(await getText(`#hmr-test-3 .counter`)).toBe('0');
    // });

    // test('should preserve state of store when editing hmr-stores.js', async () => {
    // 	// change state
    // 	await (await getEl(`#hmr-test-2 .increment`)).click();
    // 	await sleep(50);
    // 	// update store
    // 	await updateStore((content) => `${content}\n/*trigger change*/\n`);
    // 	// counter state is preserved
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('1');
    // 	expect(await getText(`#hmr-test-2 .counter`)).toBe('1');
    // 	// a third instance has been added
    // 	expect(await getText(`#hmr-test-3 .counter`)).toBe('0');
    // });

    // test('should work with emitCss: false in vite config', async () => {
    // 	await editViteConfig((c) => c.replace('svelte()', 'svelte({emitCss:false})'));
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('0');
    // 	expect(await getColor(`#hmr-test-1 .label`)).toBe('green');
    // 	await (await getEl(`#hmr-test-1 .increment`)).click();
    // 	await sleep(50);
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('1');
    // 	await updateHmrTest((content) => content.replace('color: green', 'color: red'));
    // 	expect(await getColor(`#hmr-test-1 .label`)).toBe('red');
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('1');
    // });

    // test('should work with emitCss: false in svelte config', async () => {
    // 	addFile('svelte.config.cjs', `module.exports={vitePlugin:{emitCss:false}}`);
    // 	await sleep(isWin ? 1000 : 500); // adding config restarts server, give it some time
    // 	await page.goto(viteTestUrl, { waitUntil: 'networkidle' });
    // 	await sleep(50);
    // 	expect(await getColor(`#hmr-test-1 .label`)).toBe('red');
    // 	removeFile('svelte.config.cjs');
    // });

    // test('should detect changes in svelte config and restart', async () => {
    // 	const injectPreprocessor = ({ content, filename }) => {
    // 		if (filename && filename.includes('App.svelte')) {
    // 			return {
    // 				code: content.replace(
    // 					'<!-- HMR-TEMPLATE-INJECT -->',
    // 					'<div id="preprocess-inject">Injected</div>\n<!-- HMR-TEMPLATE-INJECT -->'
    // 				)
    // 			};
    // 		}
    // 	};
    // 	await addFile(
    // 		'svelte.config.cjs',
    // 		`module.exports = {
    // 	  preprocess:[{markup:${injectPreprocessor.toString()}}]};`
    // 	);
    // 	await sleep(isWin ? 1000 : 500); // adding config restarts server, give it some time
    // 	await page.goto(viteTestUrl, { waitUntil: 'networkidle' });
    // 	await sleep(50);
    // 	expect(await getText('#preprocess-inject')).toBe('Injected');
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('0');
    // 	expect(await getColor(`#hmr-test-1 .label`)).toBe('red');
    // 	await (await getEl(`#hmr-test-1 .increment`)).click();
    // 	await sleep(50);
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('1');
    // 	await updateHmrTest((content) => content.replace('color: red', 'color: green'));
    // 	expect(await getColor(`#hmr-test-1 .label`)).toBe('green');
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('1');
    // 	await editFile('svelte.config.cjs', (content) =>
    // 		content
    // 			.replace('preprocess-inject', 'preprocess-inject-2')
    // 			.replace('Injected', 'Injected 2')
    // 	);
    // 	await sleep(isWin ? 1000 : 500); // editing config restarts server, give it some time
    // 	await page.goto(viteTestUrl, { waitUntil: 'networkidle' });
    // 	await sleep(50);
    // 	expect(await getText('#preprocess-inject-2')).toBe('Injected 2');
    // 	expect(await getEl('#preprocess-inject')).toBe(null);
    // 	expect(await getColor(`#hmr-test-1 .label`)).toBe('green');
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('0');
    // 	await (await getEl(`#hmr-test-1 .increment`)).click();
    // 	await sleep(50);
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('1');
    // 	await updateHmrTest((content) => content.replace('color: green', 'color: red'));
    // 	expect(await getColor(`#hmr-test-1 .label`)).toBe('red');
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('1');
    // 	await removeFile('svelte.config.cjs');
    // 	await sleep(isWin ? 1000 : 500); // editing config restarts server, give it some time
    // 	await page.goto(viteTestUrl, { waitUntil: 'networkidle' });
    // 	await sleep(50);
    // 	expect(await getEl('#preprocess-inject-2')).toBe(null);
    // 	expect(await getEl('#preprocess-inject')).toBe(null);
    // 	expect(await getColor(`#hmr-test-1 .label`)).toBe('red');
    // 	expect(await getText(`#hmr-test-1 .counter`)).toBe('0');
    // });
  });
}
