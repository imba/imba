# vite-plugin-imba

The official [Imba](https://imba.io) plugin for [Vite](https://vitejs.dev).

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite';
import { imba } from 'vite-plugin-imba';

export default defineConfig({
  plugins: [
    imba()
  ]
});
```
## Full stack Usage
In order to use the plugin both in the client and the server (with SSR and hydration), see the example in [../e2e-tests/vite-ssr-esm](../e2e-tests/vite-ssr-esm/)

## Credits
- Svelte vite plugin
## License

[MIT](./LICENSE)
