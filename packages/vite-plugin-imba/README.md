# vite-plugin-imba

The official [Imba](https://imba.io) plugin for [Vite](https://vitejs.dev).

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite';
import { imba } from 'vite-plugin-imba';

export default defineConfig({
  plugins: [
    imba({
		/* plugin options */
	})
  ]
});
```
## Options

### Config file

### Config file resolving

Besides inline options in Vite config, `vite-plugin-imba` will also automatically resolve options from an Imba config file if it exists (`imbaconfig.json` or `imba.config.js`). The JavaScript one is recommended since we'll add a `defineConfig` helper function to provide autocomplete for the options in the future

To set a specific config file, use the `configFile` inline option. The path can be absolute or relative to the [Vite root](https://vitejs.dev/config/#root). For example:

```js
// vite.config.js
export default defineConfig({
  plugins: [
    imba({
      configFile: 'my-imba-config.json'
    })
  ]
});
```

A basic Imba config looks like this:

```js
// imba.config.js
export default {
  // imba options
  theme: {}
};
```

### Disable automatic handling of Imba config

Use `configFile: false` to prevent `vite-plugin-imba` from reading the config file or restarting the Vite dev server when it changes.

```js
// vite.config.js
export default defineConfig({
  plugins: [
    imba({
      configFile: false
      // your imba config here
    })
  ]
});
```

> Warning:
> You are responsible to provide the complete inline config when used.

## Imba options

These options are specific to the Imba compiler.

### compilerOptions

- You can specify your own pallette of colors using

```js
// vite.config.js
export default defineConfig({
  plugins: [imba({
		compilerOptions: {
			theme: {
				colors: {
					"myblue": "blue",
					"lilac": {
						"2": "hsl(253, 100%, 95%)",
						"4": "hsl(252, 100%, 86%)"
					},
				}
			}
		}
	})],
});
```
Imba will take care of generating color variants from 1 to 9 based on the provided values.

## Full stack Usage

In order to use the plugin both in the client and the server (with SSR and hydration), see the example in [../e2e-tests/vite-ssr-esm](../e2e-tests/vite-ssr-esm/)

## Contributing

In the `packages/imba` dir, run:

```sh
npm run link
```

In this directory, run:

```sh
npm i
npm link
npm run dev
```

In your test project, run:

```sh
npm link vite-plugin-imba
npm link imba
```

To see logs in your test repository, launch Vite with:

```sh
vite --debug --filter vite:vite-plugin-imba --clearScreen false
```

## Credits

- imba vite plugin

## License

[MIT](./LICENSE)
