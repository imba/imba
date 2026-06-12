# Imba Next (Preview)

Preview VS Code extension for the next-generation Imba tooling track ([imba-language-core](../imba-language-core/PLAN.md)). `.imba` files are served by `imba-language-server` over LSP; plain ts/js files see `.imba` imports through `imba-typescript-plugin` running inside the built-in TypeScript extension. The old `vscode-imba` extension is untouched — this runs instead of it, never alongside it.

## Run it (development host)

Easiest — rebuilds everything and launches, preferring VS Code **Insiders** when installed (so stable VS Code with the regular Imba extension keeps running side by side):

```sh
./packages/vscode-imba-next/dev.sh [/path/to/your/imba/project]   # default: apps/imba.io
```

Manual equivalent (Insiders):

```sh
"/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin/code" \
  --extensionDevelopmentPath="$PWD/packages/vscode-imba-next" \
  --disable-extension scrimba.vsimba \
  /path/to/your/imba/project
```

Notes:
- `--disable-extension scrimba.vsimba` (singular) disables only the regular Imba extension — it is installed in Insiders too and would double-serve `.imba` files. Other extensions and the built-in TypeScript extension stay active.
- To get a `code-insiders` command on PATH: in Insiders, Cmd+Shift+P → "Shell Command: Install 'code-insiders' command in PATH".
- After changing tooling source: re-run `dev.sh` (it rebuilds), or rebuild manually and "Developer: Reload Window" in the dev host.

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
