[![Netlify Status](https://api.netlify.com/api/v1/badges/5aad6d39-168c-482a-9f52-3d8cd9e1c8d1/deploy-status)](https://app.netlify.com/sites/vite-imba/deploys)

_Bootstrapped with [imba-vite-template](https://github.com/imba/imba-vite-template)._

Welcome to the Imba Vite template! Let's get you set up and ready to code!

[![Deploy to Netlify Button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/imba/imba-vite-template)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fimba%2Fimba-vite-template)

## Deploy examples

To see what it looks like when you use this template and deploy it, check out the following examples:

- [Netlify](https://github.com/codeluggage/imba-on-netlify)
- [GitHub Pages](https://codeluggage.github.io/imba-on-github-pages/)

## Code structure

### `main.imba`

In `src/main.imba` you see how [Imba styles](https://imba.io/docs/css) work. CSS is clearly scoped in Imba, so you can see [global CSS](https://imba.io/docs/css/syntax#selectors-global-selectors), tag level, and element level.

Both [assets](https://imba.io/docs/assets) and [components](https://imba.io/docs/components/) are imported and used. Finally, the web application is started by [mounting the tag](https://imba.io/docs/tags/mounting).

### `counter.imba`

In `src/components/counter.imba` you see more about how [tags](https://imba.io/docs/tags), [props](https://imba.io/docs/tags#setting-properties), [state management](https://imba.io/docs/state-management) (which is usually a big, complex topic - but is very lightweight in Imba), and inheriting from the web itself (in this case, the HTML button). There's also a [Vitest in-source component test](https://vitest.dev/guide/in-source.html), showing you how this tag is meant to be used.

### `app.css`

You don't need to use CSS files, because of the powerful scoping of [Imba styles](https://imba.io/docs/css), but this file shows how you can get the best of both worlds. It is imported and used in `src/main.imba`.

### `utils.imba`

To showcase logic without any front end interactions, there's a simple example `src/utils.imba` has in-source testing and 

### `tests/`

In `test/basic.test.imba` you see how terse and succinct the testing syntax is with Imba, using [Vitest](https://vitest.dev/). This test is in its own file with the `.test.imba` filename ending, but you can also use inline tests like in `src/components/counter.imba`.

## Recommended IDE

- [VS Code](https://code.visualstudio.com/).
- [Imba extension](https://marketplace.visualstudio.com/items?itemName=scrimba.vsimba) - which is automatically recommended if you open this repository in VSCode.

## Available Scripts

In the project directory, you can run:

### `npm dev`

Runs in development mode on `http://localhost:3000` with hot reloading, linting and detailed error output in the console, and source maps.

### `npm run build`

Builds the app for production to the `dist` folder. From here you can [deploy your app](https://imba.io/guides/deployment) to static hosting.

### `npm run preview`

_NOTE: Requires `npm run build` to have been run first._

Preview the production application from the `dist/` folder, just as it will be running on static hosting.

### `npm test`

Run and watch the tests.

### `npm run test:ui`

Run and watch the tests - and open the [Vitest UI](https://vitest.dev/guide/ui.html)

## Notes
- This app doesn't have a server. If you need a full stack web application with server logic you can use [imba base template](https://github.com/imba/imba-base-template) or check out [Vite's backend integration guide](https://vitejs.dev/guide/backend-integration.html)
- There is a temporary `src/main.js` file that is still necessary for Vite to work correctly. You don't have to do anything with this file. And this will probably be fixed in a future version of Vite.