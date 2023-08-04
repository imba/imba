import {
  editFileAndWaitForHmrComplete,
  fetchPageText,
  getColor,
  isBuild,
  page,
  untilMatches,
  editFileAndWaitForServerAndReload,
} from "~utils";

test("SSR and hydration works", async () => {
  // after hydration
  const html = await fetchPageText();
  expect(html).toMatch("Hello 0 times"); // before hydration
  await untilMatches(
    () => page.textContent("button"),
    "Hello 1 times",
    "button has been hydrated"
  );
});

test("Shared and server only styles are respected", async () => {
  const shared = await page.evaluate(async () => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--shared")
      .trim();
  });
  expect(shared).toBe("1");
  const about = await page.evaluate(async () => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--about")
      .trim();
  });
  expect(about).toBe("1");
  if (isBuild) {
    // TODO expect preload links
  }
});

test("css", async () => {
  if (isBuild) {
    expect(await getColor("button")).toBe("green");
    const styleTags = await page.$$("link");
    // One css file is included
    expect(styleTags.length).toBe(1);
  } else {
    // During dev, the CSS is loaded from async chunk and we may have to wait
    // when the test runs concurrently.
    await untilMatches(
      () => page.$$("style").then((res) => `${res.length || 0}`),
      // each component gets its own style tag.
      // App, my-counter, shared + SSR styles are removed manually in mount
      "3",
      "The HTML page has 3 style tags"
    );
    await untilMatches(
      () => getColor("button"),
      "green",
      "button has color green"
    );
  }
});

if (!isBuild) {
  describe("hmr", () => {
    const updateApp = editFileAndWaitForHmrComplete.bind(null, "src/App.imba");
    test(
      "should apply style update",
      async () => {
        expect(await getColor(`button`)).toBe("green");
        await page.click("button");
        await updateApp((content) => content.replace("c:green", "c:red"));
        await untilMatches(
          () => getColor("button"),
          "red",
          "button has color red"
        );
        expect(await page.textContent("button")).toMatch("Hello 2 times");
      },
      { retry: 4 }
    );

    test("Reloading servers work", async () => {

	  await editFileAndWaitForServerAndReload("server.imba", (content) => content.replace("<App>",  "<h1> 'RELOADED'"))
      expect(await page.textContent("h1")).toBe("RELOADED");
    }, {retry: 2});

  });
}
