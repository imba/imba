# imba-language-server

LSP server for Imba built on `@volar/language-server` — part of the next-generation tooling track alongside [imba-language-core](../imba-language-core) and [imba-typescript-plugin](../imba-typescript-plugin).

Currently provides TS-backed features over the virtual TypeScript code (diagnostics, hover, definitions, references, rename, completions, semantic tokens) via `volar-service-typescript`. Imba-specific service plugins (monarch-token-driven completions for styles/tags/events, imba semantic tokens) land in M2.

Start: `imba-language-server --stdio` (initializationOptions.typescript.tsdk optional; falls back to the bundled TypeScript).
