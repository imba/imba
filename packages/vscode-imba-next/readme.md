# Imba Next (Preview)

Preview VS Code extension for the next-generation Imba tooling track ([imba-language-core](../imba-language-core/PLAN.md)). `.imba` files are served by `imba-language-server` over LSP; plain ts/js files see `.imba` imports through `imba-typescript-plugin` running inside the built-in TypeScript extension. The old `vscode-imba` extension is untouched — this runs instead of it, never alongside it.

## Run it (development host)

From the repo root, after building (`npx tsc -b packages/imba-language-core packages/imba-language-server packages/imba-typescript-plugin packages/vscode-imba-next`):

```sh
code --extensionDevelopmentPath="$PWD/packages/vscode-imba-next" --disable-extensions /path/to/your/imba/project
```

`--disable-extensions` keeps the regular Imba extension (`scrimba.vsimba`) from double-serving `.imba` files; the built-in TypeScript extension is unaffected.

## What works in this preview

- Live diagnostics (TypeScript noise filtered by the imba forgiveness rules + imba parse errors as you type)
- Hover, go to definition, find references, rename — within imba, and across the ts↔imba boundary
- Semantic highlighting and outline/breadcrumbs from the monarch parser
- Extensionless and `.web.imba` imports; `imba` resolving to the real stdlib types
- TS-backed completions at mapped positions

## Known gaps (tracked in [PLAN.md](../imba-language-core/PLAN.md))

- Imba-specific completions (styles, tags, events) — M2.2
- `extend tag` / custom event modifier typing across files — M2.6 (A9)
- Status-bar UX, configuration, formatting — later milestones
- First open of a large project compiles every file once (the disk cache makes subsequent opens fast)

Not yet packaged with `vsce` — development-host only.
