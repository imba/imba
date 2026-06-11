# imba-typescript-plugin

Next-generation tsserver plugin for Imba, built on `@volar/typescript` — successor track to `typescript-imba-plugin` (which keeps shipping unchanged until this reaches parity).

Makes plain TypeScript/JavaScript projects aware of `.imba` files (module resolution, cross-file types, rename, auto-import) by registering the [imba-language-core](../imba-language-core) language plugin through Volar's maintained tsserver integration. No tsserver internals are monkey-patched.
