# zed-imba (preview)

Zed extension for the next-generation Imba tooling — the same `imba-language-server` the VS Code preview uses, over plain LSP. Part of the [Volar tooling track](../imba-language-core/PLAN.md).

## Install (dev extension)

1. Build the tooling once from the repo root:
   `npx tsc -b packages/imba-language-core packages/imba-language-server`
2. In Zed: `cmd-shift-p` → **zed: install dev extension** → select `packages/zed-imba`.
   Zed compiles the extension to WASM with your local Rust toolchain (`rustup target add wasm32-wasip2` if asked).
3. Point Zed at the monorepo server build and enable semantic highlighting — in Zed `settings.json`:

```json
{
  "semantic_tokens": "full",
  "lsp": {
    "imba-language-server": {
      "binary": {
        "path": "node",
        "arguments": [
          "/Users/sindre/repos/imba/packages/imba-language-server/dist/index.js",
          "--stdio"
        ]
      }
    }
  }
}
```

(Without the override, the extension looks for `node_modules/imba-language-server` in the workspace.)

## What works over plain LSP

Everything server-side: live diagnostics with the imba forgiveness rules, hover (events, modifiers, tags), go to definition (incl. tag declarations + the d.ts typings), references/rename, document symbols, tag/event/modifier completions with auto-import, the typings auto-injection.

## Known gaps

- **Highlighting**: there is no tree-sitter grammar for imba, so colors come exclusively from LSP semantic tokens (`"semantic_tokens": "full"`). The server currently emits identifier-level tokens only — keywords/strings/comments are uncolored until the semantic-token provider is extended to emit monarch's full token stream (tracked in PLAN as the Zed-highlighting enabler).
- **ts/js ↔ imba interop**: Zed's TypeScript support runs through vtsls, which can load tsserver plugins. Untested, but modeled on how Vue wires its plugin:

```json
{
  "lsp": {
    "vtsls": {
      "settings": {
        "vtsls": {
          "tsserver": {
            "globalPlugins": [
              {
                "name": "imba-typescript-plugin",
                "location": "/Users/sindre/repos/imba/packages",
                "enableForWorkspaceTypeScriptVersions": true
              }
            ]
          }
        }
      }
    }
  }
}
```

- The Rust glue is compile-checked only in Zed's dev-extension flow; `zed_extension_api` version may need bumping to match your Zed.
