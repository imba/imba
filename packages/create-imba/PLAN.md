# Plan: `create-imba` — standalone project scaffolder

Goal: make `npm create imba` (and `npx create-imba`) work again by building a small standalone scaffolder package in this monorepo, and re-add a thin `imba create` alias in the main CLI that delegates to it. The docs (quick start, home page, basic-syntax) currently tell users to run `npx imba create`, which errors with `Could not resolve "create"` — the command was removed from the main package in commit `6afea2e1` ("Remove imba create", 2026-05-30) and nothing replaced it.

## Verified facts (checked 2026-08-13 — trust these, but re-verify cheaply if something looks off)

- The old implementation is recoverable: `git show 6afea2e1^:packages/imba/bin/create.imba` (170 lines: `prompts`-based interactive flow, haikunator-generated default project name, template copier with a `_gitignore` → `.gitignore` rename, `noCopy` list). The old CLI wiring (`git show 6afea2e1^:packages/imba/bin/imba.imba`, ~line 296) registered `create [name]` with `-t, --template [template]`, `-y, --yes`, and `--fast` (random name + all-default answers + print only the resulting dir; for shell scripts).
- The four templates **still exist at HEAD**: `packages/imba/templates/{default,express,module,cli}` — and `templates` is still in the `files` array of `packages/imba/package.json` (~line 50), so they ship in every imba tarball today despite being unreachable.
- The npm name `create-imba` is **unclaimed** (404 on the registry as of 2026-08-13). Published `imba` is `2.0.0-alpha.253`, identical to the repo version.
- Monorepo: lerna (`lerna.json` currently lists only `packages/imba`) + npm `workspaces` in the root `package.json` (currently lists `imba-language-core`, `imba-language-server`, `imba-typescript-plugin`, `vscode-imba-next`).
- `imba` engines: node `>=20.19.0`. The main CLI binary is `packages/imba/bin/imba` → `bin/imba.imba.js` (prebuilt).
- Old create dependencies: `prompts`, `cross-spawn`, `haikunator` — all were deps of the imba package at `6afea2e1^`; check whether they're still in `packages/imba/package.json` before assuming they're available.

## Design decisions (settled — don't relitigate)

1. **New package `packages/create-imba`**, npm name `create-imba`, with a `create-imba` bin. This is what makes `npm create imba` / `pnpm create imba` / `bun create imba` resolve. Version `0.1.0`, license MIT, engines node `>=18`.
2. **Move the templates** from `packages/imba/templates/` into `packages/create-imba/templates/` (git mv), and remove `"templates"` from the `files` array in `packages/imba/package.json`. Templates ship inside the create-imba tarball (they're tiny); no network fetch / degit in v1.
3. **Port, don't rewrite**: start from the recovered `create.imba`. Keep the prompts flow, haikunator default name, `_gitignore` rename, `noCopy` list, and the `-t/--template`, `-y/--yes`, `--fast` flags. Update anything stale (template descriptions still say "Imba bundler"; check each template's `package.json` scripts/deps against the current CLI docs in `apps/imba.io/content/docs/cli.md`).
4. **Source in Imba, bin is compiled JS.** `npx create-imba` runs the bin directly with node, so it cannot be an `.imba` file. Write the source as `src/create.imba`, add a build script that produces a single self-contained `bin/create-imba.js` (use the workspace imba to build, or esbuild directly — whatever is simplest; bundle deps so the published package needs zero runtime dependencies, or keep `prompts`/`haikunator` as regular deps and don't bundle — pick one and be consistent). Commit the built bin so the package is publishable without CI.
5. **Template refresh**: each scaffolded `package.json` should get the chosen project name, `"imba": "^2.0.0-alpha.253"` (or current version — read it from `packages/imba/package.json` at build time rather than hardcoding if easy) instead of `"imba": "*"`, and working `dev`/`build` scripts. Verify the express template's server entry still matches how `imba` serves today.
6. **`imba create` alias in the main CLI**: re-add a `create` command to `packages/imba/bin/imba.imba` that just delegates — spawn `npx create-imba@latest` with the pass-through args (use `cross-spawn` if available, else `child_process.spawn` with `shell: true` on win32). A few lines; no scaffolding logic in the main package. Note: `bin/imba.imba.js` is prebuilt — check how it gets rebuilt (`packages/imba/scripts/build.js`?) and rebuild it, or leave the alias for a follow-up if the build is nontrivial and say so.
7. **Workspace wiring**: add `packages/create-imba` to the root `package.json` `workspaces` and to `lerna.json` packages.

## Implementation steps

1. Recover the old source: `git show 6afea2e1^:packages/imba/bin/create.imba > packages/create-imba/src/create.imba` and read it fully before changing anything.
2. `git mv packages/imba/templates packages/create-imba/templates`; remove `"templates"` from imba's `files`.
3. Write `packages/create-imba/package.json` (name, version, bin, files: [bin, templates], engines, repository).
4. Port the source: template dir resolution now relative to the create-imba package root; refresh template metadata; add the version-pinning of the `imba` dep in scaffolded projects.
5. Build setup producing `bin/create-imba.js`; make `npm run build` work from the package dir.
6. Wire workspaces + lerna.
7. Add the `imba create` delegation alias (step 6 in decisions) if the main-CLI rebuild is tractable.
8. Update docs in `apps/imba.io/content/`:
   - `docs/cli.md`: add back an `## imba create` section documenting the delegation + `npm create imba` as the primary form.
   - `docs/start.md` + `home/examples.md` + `docs/basic-syntax.md`: prefer `npm create imba@latest` as the canonical command (`npx imba create` works again once both packages are published — mention it as an alias).
   - `apps/imba.io/DOCS-IMPROVEMENTS.md`: check off the "New finding … `imba create` does not exist" item under §1 with a done-note.
   - Rebuild: `cd apps/imba.io && npm run build-content && npm run build-site` — both must pass.

## Verification (do all of these)

1. From a temp dir: `node <repo>/packages/create-imba/bin/create-imba.js my-test-app --template default --yes` (and `--fast`) — non-interactive scaffold must succeed.
2. In the scaffolded app: `npm install` (or point `imba` at the workspace via `npm link`/`file:` dep), then `npm run build` — the scaffolded project must build with the current imba. Repeat for the `express` template.
3. Interactive path: run without args, answer prompts (or at minimum verify the prompt definitions render — full TTY interaction may not be scriptable; say what was and wasn't exercised).
4. If the alias was added: `node packages/imba/bin/imba create --help` shows the delegation working.
5. `npm pack` in `packages/create-imba` — inspect the tarball file list: bin + templates present, nothing bloated.

## Out of scope

- Actually publishing to npm (`npm publish` for create-imba, and the next imba release for the alias) — the maintainer does this.
- Creating or restructuring GitHub template repos (degit-based fetching can replace embedded templates later).
- CI wiring.

## Definition of done

Scaffolding works end-to-end locally from the built bin for at least `default` and `express`, the scaffolded apps build with the workspace imba, templates no longer ship in the imba tarball, docs updated and site builds green, tracking-doc item checked off.
