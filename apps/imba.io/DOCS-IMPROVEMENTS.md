# Docs improvement checklist

Findings from a full review of `content/docs/*.md`, `content/guides/*.md`, `content/nav.md` and the docs build pipeline (2026-08-13). Check items off as they land. File paths are relative to `apps/imba.io/`.

Notes for anyone picking up items:

- The tiny "shell" pages (`lifecycle.md`, `events.md`, `event-modifiers.md`, `event-reference.md`, `style-properties.md`, `style-modifiers.md`, `colors.md`, `style-data-types.md`) render complete pages via `<api-list>`/`<api-grid>` from generated API data — judge them on prose, not file length.
- Live code previews in fenced blocks require a `# [preview=lg]` line (or a `[preview=…]` flag on the section heading). The `# ~preview` comment form is display-stripped but does **not** enable a preview.
- After editing content: `npm run build-content && npm run build-site`, and hard-reload past the service worker.

## 1. Quick fixes (bugs visible on the live site today)

### Broken/wrong text

- [x] `docs/cli.md` — rewrite against the real flag table: `-v, --verbose` repeats the `--force` description, `-k, --keep` repeats the intro sentence, `-p, --production` repeats `--web`'s text. Typos: `--no-minifiy`, "Convenieve", "false for `--development`,Defaults". Remove dead advice "`--esm` … Only supported on Node v14.13+". *(Done 2026-08-13: rewritten against `bin/imba.imba` + `imba --help`. Also removed `--target` (flag no longer exists), added the real missing flags (`--loglevel`, `--assets-dir`, `--bundle`, `--br`, `--fork`, `--inspect`, `--skipReloadingFor`, `--port`, `--host`, `--platform`), documented `imba fmt`/`imba info`, and REMOVED the `imba create` section — see new finding below.)*
- [x] ~~`docs/cli.md` — document `imba test` (missing entirely).~~ *(Resolved 2026-08-13 with correction: `imba test` does NOT exist in the public CLI (`bin/imba.imba` has no test command; no vitest integration in the package). Original finding was wrong — nothing to document.)*
- [x] **New finding (2026-08-13):** `imba create` does not exist either — not in `bin/imba.imba`, not in the published `imba@2.0.0-alpha.253` tarball, and no `create-imba` package on npm (`imba create` errors with "Could not resolve create"). But `docs/start.md` and `home/examples.md` still tell users to run `npx imba create`. Decide: restore a `create` command, or update start.md/home to point at the [imba-base-template](https://github.com/imba/imba-base-template) repo. *(Done 2026-08-13: built the standalone `packages/create-imba` package (npm name `create-imba`, templates moved into it from `packages/imba/templates/`), added an `## npm create imba` section to `docs/cli.md`, and switched start.md/basic-syntax.md/home/examples.md to the canonical `npm create imba@latest`. Deliberately did NOT restore an `imba create` command in the main CLI — `npm create imba` is the only supported form. Works locally end-to-end; awaiting npm publish of `create-imba`.)*
- [x] `docs/operators.md` (~line 438–459) — the `~=?` section reuses the `|=?` example verbatim (copy-paste bug); write a real toggle-assign example. *(Done 2026-08-13: fixed the initial-state bug too — example started with the bit already unset so the branch never fired; equivalent-code block now actually unsets bits.)*
- [x] `docs/operators.md` (~line 461) — `^=?` has a heading but no prose. *(Done 2026-08-13: documented verified semantics — toggles the bits, returns true if they ended up set (`!!((a ^= b) & b)`) — with example + expanded equivalent.)*
- [x] `docs/control-flow.md` (~line 346) — `Math.rEndom!` typo-as-example reads as a mistake; rewrite or annotate. *(Done 2026-08-13: replaced with an obviously-intentional `JSON.parse('{not valid json}')` failure. Also removed the stale "targeting IE11 users … babelify" note above it.)*

### Broken links

- [x] `docs/styles.md` (line 15) — `/docs/styles/modifiers` → should be `/docs/css/modifiers`. *(Done 2026-08-13.)*
- [x] `guides/static_deployment.md` (line 17) — `/docs/cli` → route is `/cli`. *(Done 2026-08-13.)*
- [x] `docs/style-properties.md` — dead `[display](css)`-style links; also typo "inpsired". *(Done 2026-08-13: dead links → inline code, fixed "inpsired"/"There are also"/trailing "..".)*
- [x] `content/nav.md` (line 99) — `[skip]` entry points at `doc=docs/routing`, which doesn't exist. Remove the entry. *(Done 2026-08-13.)*
- [x] `docs/style-syntax.md` (line 128) — same dead-link pattern found in sweep: `[@focin](css)` → inline code + link to `/docs/css/modifiers`. *(Done 2026-08-13.)*

### Empty/unfinished sections shipped live

- [ ] `docs/event-handling.md` — ends on a bare `## Listening to global events` heading with zero content. Write it (`imba.listen`/global event delegation) or cut the heading.
- [ ] `docs/tags.md` (line 56) — placeholder `# add example for el.flags here` inside an empty code block. Write the example.
- [ ] `docs/data-binding.md` — `## Form Input Bindings` heading has no body before `## Examples`. Write intro prose or merge headings.
- [ ] `docs/style-syntax.md` — `#### Interpolation` (~line 312) has no body, and there is a second `## Interpolation` (~line 379). Merge into one section.
- [ ] `docs/style-syntax.md` (line 100) — resolve `## Modifier Syntax [wip]`.
- [ ] `docs/classes.md` (line 103) — `## Lazy Getters [wip]`; content is repeated at ~152–158 under Meta Properties. Dedupe and drop the `[wip]`.
- [ ] `guides/transitions.md` — ends mid-thought ("See properties." with no link).

### Stale content

- [ ] `docs/assets.md` — presets still show `target: ['node12.19.0']` and `chrome58/firefox57/safari11/edge16`; "explained in more detail before final 2.0 release"; prune the unfinished "Future plans / Glob imports / Importing wasm" tail (~lines 214–243).
- [ ] `docs/teleports.md` — titled Teleports but only documents `<global>`; `<teleport>` exists in `packages/imba/typings/imba.d.ts` and is never documented. Document `<teleport>` or retitle.
- [ ] `docs/router.md` (~lines 87–89) — "for the time being" tip reads as a long-lived temporary note; confirm and rewrite.
- [ ] `guides/full_stack_deployment.md` — verify the `imba-base-template` repo still exists and `dist/src/server.loader.js` is still the emitted path.

## 2. Orphaned & dead pages

- [ ] `docs/usage.md` — empty file (`# Usage` only). Delete.
- [ ] `docs/start.md` — good quick-start content but unreachable: no nav entry, and `/start` redirects to `/docs/introduction` (`src/index.imba:104`). Add a "Getting Started" nav section (see §4) or delete.
- [ ] `docs/community.md` — not in nav. Add to nav (Reference section?) or delete.
- [ ] `docs/state-management.md` — not in nav; mostly overlaps rendering docs. Fold its unique `extend tag element` global-state pattern into the merged rendering page or `components.md`, then delete.
- [ ] `docs/grammar.md` — orphaned near-verbatim duplicate of `variables.md` + `identifiers.md`; carries two `[wip]` markers and a placeholder line. Fold any unique paragraphs in, then delete.
- [ ] `docs/literals.md` — nav-`[skip]`ped; duplicates the intro except numeric separators / dimension literals / `fps`. Move those bits (e.g. into `basic-syntax.md` or `operators.md`), then delete. Note: its `### Tagged templates [tip]` is a two-sentence placeholder.
- [ ] `docs/types.md` — 2-line stub, nav-`[skip]`ped. Either write a real Types page (the only `\type` annotation docs live in the intro's tail) or delete the file + nav entry.

## 3. Merges & dedupes

- [ ] Merge `docs/mounting.md` into `docs/declarative-rendering.md` — ~70% is verbatim-equivalent (same websocket + fetch examples, same framing). Keep one canonical "Rendering" page; have Elements/Mounting nav point at it or at a slimmed mounting stub.
- [ ] `docs/operators.md` (~lines 479–685) — cut the "Keywords" tail (`if`/`for`/`switch`/`class`/`get`/`set`/`def`/`try`…) which duplicates `control-flow.md` and `classes.md`; cross-link instead.
- [ ] `docs/basic-syntax.md` (723 lines) — slim the whirlwind tour: keep the JS-comparison intro, cut/link the halves that duplicate `literals`/`control-flow`/`functions`/`classes` and the UI/CSS walkthrough (duplicates four downstream pages).
- [ ] "Custom Breakpoints" is duplicated verbatim in `docs/style-syntax.md` (~149–158) and `docs/style-modifiers.md` (~11–17). Keep it in one place.
- [ ] `docs/events.md` custom-event list is identical to `event-reference.md`'s "Non-standard Events" — dedupe.
- [ ] `docs/variables.md` / `docs/identifiers.md` vs `grammar.md` — resolved by deleting grammar.md (§2).

## 4. Structure / navigation

- [ ] Add a **Getting Started** section at the top of `content/nav.md` (install, `npm create imba@latest`, editor setup, first app) using `docs/start.md` as the base. Currently the first nav item is the 723-line language tour.
- [ ] Decide placement for `community.md` (footer vs nav Reference section).
- [ ] Plan the drain of `docs/undocumented.md` (697 lines, publicly navigated as "Experimental → Undocumented") — see §6 for the per-topic breakdown.
- [ ] Consider an "Apps & Tooling" expansion to host the new guides in §5 (server, testing, config, editor tooling).

## 5. New content (gaps — nothing on the site covers these)

### Language

- [ ] **Memoized functions** — the amperfunc memoization tiers (pure / self / capture-slots) shipped Aug 2026 have exactly one blockquote in `docs/functions.md` (line 156). Document the tiers, the compiler's "will not be memoized" warnings, and the deopt rules (reassigned captures). Highest-value single addition.
- [ ] **`rescue` expressions** — shipped feature, documented nowhere. Add to `docs/control-flow.md` (inline try/catch returning the error; idiomatic for tests + expected failures).
- [ ] **`@lazy` / `@bound`** — name-dropped in `docs/decorators.md` line 5, never documented.
- [ ] **Named parameters** (`fn(a: 1, b: 2)` → options object) — compiler supports `NamedParam`; not documented.
- [ ] **`export` statement forms** + dynamic `import()` — `docs/modules.md` is thin.
- [ ] **`declare def`** — not documented.
- [ ] `\type` annotations need a real home (see types.md item in §2).

### UI / components

- [ ] **Component anatomy page** — `<self>` (used in every example, never explained), `$name` element refs, dynamic `<{expr}>` tags, `imba.mount` return value and unmounting.
- [ ] **SSR & hydration** — `hydrate`/`dehydrate`/`awaken` hooks exist in the API reference with no narrative page.
- [ ] **Lifecycle narrative** — the generated `lifecycle.md` lists hooks but nothing explains ordering or `mount` vs `awaken`.
- [ ] **`bind` on custom components** — `data-binding.md` is nine examples with almost no prose; the custom-component example shows `data` appearing magically. Also `bind` modifiers and getter/setter targets.
- [x] **Custom event modifiers** — `event-modifiers.md` literally says "reach out on Discord" until docs exist, while `undocumented.md` (~line 555) has a working example. Promote it. *(Done 2026-08-13: documented in `event-modifiers.md` — mechanism, return-value semantics, async guards, negation, per-event-type scoping, with live preview; rough example removed from `undocumented.md`.)*

### Tooling (new guides)

- [ ] Server-side Imba / express integration guide (currently only the `examples/express` demo).
- [ ] Testing guide (`imba test`, vitest wrapper, `assert`/`eq`).
- [ ] Config guide — `imbaconfig.json` / config options (name-dropped once in `assets.md`, never documented) + env vars (`IMBA_*` prefixes).
- [ ] TypeScript interop / `.d.ts` guide.
- [ ] Editor tooling page (VS Code extension etc.) — currently one paragraph in the orphaned `start.md`.

## 6. Drain `docs/undocumented.md` (697 lines) into real pages

- [ ] Events cluster → `event-modifiers.md` / `event-handling.md`: ~~custom event modifiers~~ *(done)*, `on$click` hooks, cooldown flag, `@resize.css` units, `@error.trap`, cooldown+confirm.
- [ ] Components/state cluster → `components.md` / `observable.md`: `imba.emit`/`imba.listen`, `Element.emit`, `dataset` props, `imba.awaits`, autorun reactions & ordering, style flags, `Class.inherited`.
- [ ] Language cluster → `basic-syntax.md` / `classes.md`: `let`-branch results, accessors (`as`), `def` in objects, `super`, `$0` arguments, spread shorthand, `$node$`/`$browser$` platform flags, class-constructor object init.
- [ ] CSS cluster → style docs: parent selectors `^` / `..`, custom css modifiers, color precision, `&.` / `@.`.
- [ ] Tooling cluster → `cli.md` / `assets.md` / deployment guides: `.env`, platform imports, PWA, no-hashing.
- [ ] When drained, remove the "Undocumented" nav entry (or keep as a short true-experimental list).

## 7. Interactive-example coverage

- [ ] Audit the 18 code blocks using the non-functional `# ~preview` marker (`docs/data-binding.md` ×4, `docs/style-syntax.md` ×7, `docs/tags.md` ×2, `docs/slots.md` ×1, `guides/transitions.md` ×4). Some are rescued by section-heading `[preview=…]` flags; convert the rest to `# [preview=…]` or accept them as static.
- [ ] Add `# [preview=console]` previews to the most-read reference pages, which are currently 100% static: `docs/operators.md`, `docs/functions.md`, `docs/classes.md` (the intro page has 21 previews; these 1400+ lines have zero).
