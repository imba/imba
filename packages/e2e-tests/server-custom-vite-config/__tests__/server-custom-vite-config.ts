import { getEl } from "~utils";

test("custom config is respected", async () => {
  expect(await getEl("body#a1")).toBeDefined(); // after hydration
});
