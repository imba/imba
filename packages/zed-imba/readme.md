# Imba for Zed

Zed language extension for Imba.

This extension wires Zed to the standalone Tree-sitter Imba grammar and ships the first set of Tree-sitter queries for syntax highlighting, CSS injections, bracket matching, indentation, and outline entries.

It wires Zed to `imba-language-server` — the Volar-based language server from the imba monorepo, shared with the VS Code preview. Over plain LSP that provides: live type-checked diagnostics (with the imba forgiveness rules), hover with docs for events/modifiers/tags, go to definition (tag declarations, typings, cross-file), references and rename, document symbols and semantic tokens from the monarch parser, and completions for tag names (with auto-import), events, and event modifiers.

The server is resolved from the workspace (`node_modules/imba-language-server`, or `packages/imba-language-server` when opening the imba monorepo itself). For development against a local build, override it in Zed settings:

```json
{
  "lsp": {
    "imba-language-server": {
      "binary": {
        "path": "node",
        "arguments": ["/path/to/imba/packages/imba-language-server/dist/index.js", "--stdio"]
      }
    }
  }
}
```

## Installation

Once published in the Zed extension registry, install it from `zed: extensions` by searching for `Imba`.

Until then, install it as a dev extension:

1. Clone this repository.
2. Install Rust through `rustup` if you have not already.
3. In Zed, open the command palette.
4. Run `zed: install dev extension`.
5. Select the cloned `zed-imba` directory.
6. Open an `.imba` file.

The extension downloads the Tree-sitter grammar from `https://github.com/imba/treesitter-imba` at the revision pinned in `extension.toml`, so users do not need a local grammar checkout.

If Zed does not pick up changes, reinstall or reload the dev extension and check `zed: open log`.

## Development

The language server lives in the imba monorepo (`packages/imba-language-server`); build it with `npx tsc -b packages/imba-language-core packages/imba-language-server` from the monorepo root. Its test suite (`npx vitest run` in `packages/imba-language-core`) exercises the same features Zed consumes over LSP.

Zed dev extensions that include language servers are Rust extensions, so local extension development needs Rust installed through `rustup`.

To update the pinned grammar revision after committing and pushing grammar changes:

```sh
node scripts/update-local-grammar-rev.js ../treesitter-imba
```

That command reads the local grammar checkout, but writes the public grammar repository URL into `extension.toml`. For private local grammar experiments only, pass `--local` to write a `file://` grammar URL.

To use the language server for the outline and breadcrumbs instead of `outline.scm`, add this to your Zed settings:

```json
{
  "languages": {
    "Imba": {
      "document_symbols": "on"
    }
  }
}
```

To test semantic tokens, enable them in Zed settings:

```json
{
  "languages": {
    "Imba": {
      "semantic_tokens": "combined"
    }
  }
}
```

## Publishing

Before publishing:

- Make sure `extension.toml` uses a public grammar repository URL, not `file://`.
- Make sure the pinned grammar `rev` has been pushed to the grammar repository.
- Make sure this repository has been pushed publicly.
- Keep an accepted license file at the extension root.
- Bump `version` in `extension.toml` for releases.

To publish to the Zed registry, open a PR to `zed-industries/extensions` that adds this repo as a submodule under `extensions/imba`, adds an `[imba]` entry to `extensions.toml`, and runs `pnpm sort-extensions`.
