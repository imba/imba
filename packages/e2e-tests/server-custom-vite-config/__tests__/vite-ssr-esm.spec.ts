import { getEl } from "~utils";

test("SSR and hydration works", async () => {
  expect(await getEl("body#a1")).toBeDefined(); // after hydration
});
