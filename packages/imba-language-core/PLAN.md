# Imba Volar tooling — parity plan & working doc

**Goal:** feature parity with `typescript-imba-plugin` + `vscode-imba`'s bridge features, on the Volar architecture, then switch defaults. The old plugin stays untouched and shipping until M4 sign-off.

This is a *living working document*. Any session (human or agent) picking up this track should read **Status & resume pointer** below, do the next unchecked item, update the matrix/log, and commit doc updates together with the code.

---

## Status & resume pointer

- **Current milestone:** M2 — **daily-drivable preview**: `./packages/vscode-imba-next/dev.sh [project]`
- **Next action:** **A9 design spike** (typings-from-source — see expanded A9 row; inputs: old dtsutil.imba mechanics, compiler `declare global` emit option, stdlib extend-class declarations in events/core.imba). Then M2.2 completions, remaining C3 contexts
- **Verify everything still works:** `cd packages/imba-language-core && npx tsc -b && npx vitest run`
- **Build all three packages:** `npx tsc -b packages/imba-language-core packages/imba-typescript-plugin packages/imba-language-server` (repo root)

---

## Architecture recap (decisions already made)

| Decision | Rationale |
|---|---|
| Root `VirtualCode` is the imba source (identity mapping, `languageId: 'imba'`); generated TS is `embeddedCodes[0]` ('ts') | Volar feature workers only visit *embedded* documents — imba-side plugins need an always-visitable identity-mapped root (works even when compilation fails). Same shape Vue uses. Decided during M1.4; was originally root-as-TS |
| One `CodeMapping` per span, exact-length spans first in the array | Volar's SourceMap memo iterates candidates in array order → precise leaf mappings beat container fallbacks |
| Container (unequal-length) spans: `verification` + `structure` ONLY — no navigation/semantic/completion | Position-level features through containers clamp interior offsets onto unrelated tokens (phantom definitions found in M1.7); containers are for boundary-aligned range mapping only, same rule as old o2iRange |
| Imba-specific service plugins live in `imba-language-core/src/plugins/` for now | Both kit tests and the server consume them; split out an `imba-language-service` package only if it grows past ~1500 lines |
| New code is TypeScript strict, CJS output (`module: node16`), built with `tsc -b` | tsserver requires `require()`; Volar libs are CJS; types pay rent against TS/Volar APIs |
| Compile with the *bundled* imba compiler for now (`imba/compiler` via `file:../imba`) | Project-local compiler selection (old `useImbaFromProject`) is M3.7 |
| Old plugin's `typings/*.d.ts` are referenced read-only until M4 | Old package must stay untouched; typings move to a neutral home at switch time |
| Reach TS internals only through `volar-service-typescript`'s `context.inject('typescript/languageService')` | One documented seam instead of the old plugin's scattered internal API use |

Key upstream facts (verified against installed `@volar/*` 2.4.28):
- `locs.spans` = `[genStart, genEnd, srcStart, srcEnd]`, hierarchical/overlapping, exact 1:1 at identifier leaves.
- `CodeInformation.verification.shouldReport(source, code)` exists → home for the diagnostic suppression rules.
- `LanguagePlugin.typescript.extraFileExtensions` + `getServiceScript` drive TS integration in all modes.
- Kit (`@volar/kit`) `createTypeScriptChecker` passes `extraFileExtensions` into tsconfig parsing → fixture tests see `.imba` files.
- `@volar/typescript` has no `exports` map → deep imports (`lib/quickstart/...`) are fine.

---

## Parity matrix

Status: ✅ done · 🚧 in progress · ⬜ pending · 🤔 needs design · ❌ intentionally dropped

### A. Core virtualization & resolution

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| A1 | `.imba` files visible to TS as virtual TS | patches.imba: ScriptInfo/TextStorage/ScriptVersionCache patching | `ImbaVirtualCode` + mappings | M0 | ✅ |
| A2 | Imports with explicit `./foo.imba` | TSBase.resolveModuleName rewrite (`.imba.ts` → `.imba`) | handled by `@volar/typescript` resolution | M0 | ✅ |
| A3 | Extensionless imports `./foo` → `foo.imba` | `moduleSuffixes: ['.web.imba','.imba','']` + fileExists trick (System patch) | `typescript.resolveHiddenExtensions: true` — Volar formalized the old trick | M1.1 | ✅ |
| A4 | `.web.imba` platform variants | same moduleSuffixes | second extraFileExtensions entry `'web.imba'` listed before `'imba'` (priority test in m1-resolution.test.ts) | M1.1 | ✅ |
| A5 | Compiler options injection (lib, customConditions `['tsimba','imba']`, RequiredCompilerOptions) | Project.setCompilerOptions patch | `setupImbaProject` (projectSetup.ts) wraps the LS host in the server's project `setup` hook — required options forced, defaults only when project hasn't chosen. tsserver-plugin mode still needs an equivalent (M3) | M2.3 | ✅ |
| A6 | imba.d.ts global typings into every project | pushed into `compilerOptions.lib` | `resolveImbaTypings` (prefers the **project's own** imba install, falls back to tooling copy) appended to `getScriptFileNames` in setupImbaProject | M2.3 | ✅ |
| A7 | Virtual jsconfig for config-less projects | createVirtualProjectConfig + virtual file System patch | language server: default project for inferred workspaces | M3.6 | ⬜ |
| A8 | Asset imports (`./icon.svg` etc., ImbaAsset types) | EXTRA_EXTENSIONS in resolveImportPath, `allowArbitraryExtensions` | `allowArbitraryExtensions` + asset `.d.ts`; verify per asset kind | M3.5 | ⬜ |
| A9 | Global `extend class` / global tags across files (Ω dts sidecar) | dts.imba/dtsutil.imba: rewrite compiled dts → `.imba._.d.ts` virtual roots | **Scope expanded (Sindre 2026-06-12): A9 is the typings-from-source mechanism.** Stdlib declares modifiers/extensions in actual source (`extend class Event` in events/core.imba, `class IntersectionEvent` with `def @in/@out` in events/intersect.imba) — A9 turns those into global types, making the handwritten imba.events.d.ts *transitional*. Serves user `extend tag` (112 dogfood errors), stdlib modifiers, and source-located hover/def with real docs. Design: prefer compiler emitting `declare global` inline in the tsc target; fallback `getExtraServiceScripts`. Next major work item | M2.6 | 🤔 |
| A10 | Project-local imba compiler (`useImbaFromProject`) | getImbaCompilerForPath + require | resolve `imba/compiler` from project root in compile layer | M3.7 | ⬜ |
| A11 | Multi-root / multiple tsconfig projects | **broken** in old plugin (last-project-wins) | Volar handles per-project natively — add regression test | M3.8 | ⬜ |

### B. Diagnostics

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| B1 | TS diagnostics in imba coordinates | Session.sendDiagnosticsEvent + o2iRange mapping | Volar mapping | M0 | ✅ |
| B2 | Imba compiler parse diagnostics | script.getImbaDiagnostics (save-gated) | `createImbaDiagnosticsPlugin` over the identity-mapped root doc (live, not save-gated) | M1.4 | ✅ |
| B3 | Suppression rules (~25 codes: 2322/2339/2554/6133-patterns…) | diagnostics.imba Rules table + filterDiagnostics | `tsDiagnosticRules.ts` table + `createTypeScriptServices` wrapper (filters only imba-backed docs; plain .ts untouched). NOTE: rules match RAW messages (Ξ/Ψ/α encoded) | M1.5 | ✅ |
| B6 | Unmappable/mismapped diagnostic suppression ("hide if it doesnt map perfectly") | patches.imba filterDiagnostics range+text checks | `mapsCleanly` in the wrapper: no-fallback range mapping required; unused-declaration diags additionally require mapped source text == reported name | M1.9 | ✅ |
| B4 | Greek-letter cleanup in messages (Ξ Φ Ψ Γ α Ω → imba names) | toImbaString over whole JSON protocol | `conversion.ts` applied per diagnostic message + relatedInformation in the wrapper | M1.6 | ✅ |
| B5 | debugLevel≥2 "show suppressed as warnings" | filterDiagnostics | config flag on the wrapper | M3.9 | ⬜ |

### C. Hover / quick info

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| C1 | TS hover at mapped positions | intercept.getQuickInfoAtPosition | volar-service-typescript via mappings; explicit e2e via `test/harness.ts` (full LanguageService over fixtures — reuse for all feature tests) | M1.7 | ✅ |
| C2 | Identifier conversion in hover display | toImbaDisplayParts | `provideHover` wrap in typescriptServices.ts (all MarkupContent/MarkedString shapes); Ω-prefixed internal names revisited with A9 | M2.4 | ✅ |
| C3 | Imba-context hover: style props/values, units, mixins, style vars/colorvars, events, event modifiers, tag names/attrs, meta symbols, MDN links | script.getInfoAt + checker.getSymbolInfo (700+ lines) | monarch-driven plugins; type queries via injected TS LS. **Events + modifiers done** (`imbaEvents.ts`: hover w/ docs+tags, go-to-def into typings — the @intersect.silent case). Styles/tags/units/mixins remain | M2.3 | 🚧 |

*C1 is exercised indirectly (mapping round-trips + diagnostics); add an explicit hover e2e test in M1.7.

### D. Completions

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| D1 | Plain-code completions (vars, props, implicit self, globals, classes) | 100% hand-assembled (values/access in completions.imba) | **forward to TS** over virtual code at mapped positions; hand-roll only what TS can't see | M2.1 | ⬜ |
| D2 | Tag names (html, local components, snippets) | tagnames() + checker.getLocalTags + getExportedTags via export-info crawl | `createImbaCompletionsPlugin` + **`ImbaTagIndex`** (regex scan over workspace .imba files, mtime-cached — the "ultrafast path", replaces the export-info crawl which was the old plugin's slowest completion) + HTMLElementTagNameMap via cached checker lookup + auto-import via monarch createImportEdit. Snippets pending | M2.2 | ✅ |
| D3 | Tag attrs/props per tag | tagattrs() + isTagAttr filtering | `tagAttrItems` in imbaCompletions — element type via HTMLElementTagNameMap (the compiler's per-tag global merge covers custom tags), settable/non-readonly props, GlobalEventHandlers + on*/className/Ψ filtered, `=` commit. TagProp added to the TS-suppression mask. Gap: plain non-exported local tags aren't in the map (no global merge) — noted | M2.2 | ✅ |
| D4 | Tag events + event modifiers | ImbaEvents props + getEventModifiers | `@`-triggered event names (ImbaEvents props, type details, @summary docs) + `.`-triggered modifiers (α-props of the event type incl. custom events via index signature, @detail signatures, αoptions excluded, names converted). TS completions SUPPRESSED at imba-special contexts (tag/event/modifier) — they leaked event-object members and raw α names through the placeholder mappings | M2.2 | ✅ |
| D5 | Style properties (abbr config), values per property, modifiers, selectors | styleprops/stylevalues/stylemods via imbacss symbols | **Slice 1 ✅:** properties (full + abbreviations w/ @alias/@proxy cross-refs) and @-modifiers (@detail selectors) from imbacss namespace exports via per-program-cached checker lookup — effectively a static table since the typings are static per imba version, satisfying the "outside TS" lean without a second data source. TS suppressed at all style contexts. **Remaining:** values per property (set-signature param types), selectors, abbr-preference config | M2.2 | 🚧 |
| D6 | Style vars / colorvars, custom units, number units | cross-file token scans (findImbaTokensOfType) | workspace token index over open imba docs | M2.2 / M3.3 | ⬜ |
| D7 | Mixins | getMixinReferences | same as D6 | M2.2 | ⬜ |
| D8 | Decorators | local vars + imba builtins + exported αdecorators | service plugin | M2.2 | ⬜ |
| D9 | Types after `\` | getSymbols('Type') + snippets | service plugin | M2.5 | ⬜ |
| D10 | Path completions in imports | paths() via directoryStructureHost | ❌ dropped — Sindre: not needed (2026-06-12) | — | ❌ |
| D11 | Keywords + root snippets | KeywordCompletion + snippets('root') | service plugin | M2.2 | ⬜ |
| D12 | Auto-imports: values/types (TS-backed) | importer.imba getExportInfoMap machinery | mostly free via D1 forwarding (TS auto-imports map edits back); verify import path gets `.imba`-stripped/extensionless form | M3.1 | ⬜ |
| D13 | Auto-imports: exported tags, decorators, export-star namespace groups (EXPORT_NS) | importer.imba custom grouping | custom contributions on top of D12 | M3.2 | ⬜ |
| D14 | Completion resolve: docs markdown, import edits via `doc.createImportEdit` | SymbolCompletion.resolve | resolve handler in service plugin (monarch createImportEdit reused) | M2.2 | ⬜ |
| D15 | Commit characters / weights / filterText shaping | per-category logic in completions.imba | port per-category table | M2.2 | ⬜ |

### E. Navigation & symbols

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| E1 | Go to definition (TS-backed) | intercept + convertLocationsToImba | Volar mapping | M0* | ✅ |
| E2 | Def/refs for style vars, colorvars, units, mixins | checker token-def synthesis | service plugin over workspace token index | M3.3 | ⬜ |
| E3 | Definition filtering (`__new` removal, prefer .imba over .d.ts, meta suppression) | intercept.getDefinitionAndBoundSpan | `preferImbaDefinitions` in the TS wrapper (imba source beats typings d.ts entries; never empties the list). `__new` rule obsolete — current compiler emits real constructors | M2.7 | ✅ |
| E11 | Def/hover on tag usage (`<cool-widget>`) + attributes | checker.getTagSymbol/getTagAttrSymbol | **two-tier (key architecture validation):** attributes flow through TS mappings for free (exact spans, once Γ globals resolve — compiler already emits `declare global` registrations per tag declaration!); the tag NAME token (unequal span vs Γ-name) bridges via `createImbaTagsPlugin` + workspace index | M2.2 | ✅ |
| E4 | Find references / rename (TS-backed) | intercepts + conversion | Volar mapping; rename name conversion via `navigation.resolveRenameNewName/EditText` mapping hooks | M3.10 | ⬜ |
| E5 | Document symbols / outline | doc.getOutline (monarch) replacing navtree | `createImbaDocumentSymbolsPlugin` (monarch outline → LSP DocumentSymbols, TS symbols suppressed for imba docs) | M2.8 | ✅ |
| E6 | Workspace symbols (imba + TS merged, scope config) | getNavigateToItems override | service plugin + forwarded TS results | M3.3 | ⬜ |
| E7 | Folding | old returned `null` (!) | indentation folding from VS Code language config; optional monarch provider later | M2.9 | ⬜ |
| E8 | Document highlights | disabled for imba | leave to TS via mappings; verify quality, disable if noisy | M3.11 | ⬜ |
| E9 | Signature help (incl. event-modifier signatures) | intercept + checker.getSignatureHelpForType hack | TS-backed free via mapping; event-modifier case in service plugin | M3.12 | ⬜ |
| E10 | File-rename import edits | getEditsForFileRename + conversion | expect free via Volar; add test | M3.13 | ⬜ |

### F. Editor surface (vscode + protocol)

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| F1 | Semantic tokens from monarch | getSemanticTokens via encodedSemanticClassifications intercept | `createImbaSemanticTokensPlugin` — standard LSP token types from monarch tokens on the root document (works in any LSP client, no tsserver) | M2.10 | ✅ |
| F2 | Status bar (compile spinner etc.) + **environment health check** | node-ipc bridge | LSP custom notifications (typed) in preview extension. Health check: at project init verify `imba.Component` resolves; if not, ONE clear "imba types not loaded" signal instead of a 2339 cascade on every tag (dev-host finding: broken env reads as thousands of cryptic `typeof import("imba")` errors) | M2.12 | ⬜ |
| F3 | Config (suggest.*, workspaceSymbols.scope, debugLevel, useImbaFromProject) | configurePlugin + ipc | LSP configuration; port schema to preview extension | M3.9 | ⬜ |
| F4 | Preview VS Code extension (`imba-next` style) | n/a | `packages/vscode-imba-next`: LSP client → imba-language-server, grammar copied from vscode-imba, tsserver plugin contribution. Dev-host only (`code --extensionDevelopmentPath=… --disable-extensions`); vsce packaging needs bundling, M3 | M2.11 | ✅ |
| F8 | Zed extension (architecture dividend: server is plain LSP) | github.com/imba/zed-imba already existed: tree-sitter grammar (imba/tree-sitter-imba) + queries + a monarch mini-LSP (imba-tags) | `packages/zed-imba` now mirrors the official repo's structure with the mini-LSP replaced by imba-language-server (workspace/monorepo resolution + settings override; cargo-check clean on zed_extension_api 0.7). Sync back to imba/zed-imba = plain copy. Highlighting: tree-sitter base + semantic tokens "combined" (their semantic_token_rules.json kept) | M2 | ✅ |
| F5 | Selection tracking / save notifications | ipc onDidChangeTextEditorSelection/didSave | not needed (LSP didSave; live parse diagnostics replace save-gating) | — | ❌ |
| F6 | Standalone tsserver wrapper (typescript-imba-service) | separate package | superseded by imba-language-server (any LSP editor) | — | ❌ |
| F7 | Protocol-wide greek-letter rewrite of every message | Session.send JSON round-trip | ❌ dropped by design — conversion happens at feature boundaries only (B4, C2, D-resolve) | — | ❌ |

### G. Performance & robustness (new-architecture obligations)

| # | Item | Notes | Milestone | Status |
|---|---|---|---|---|
| G1 | Worker-thread compilation | **redefined:** `createVirtualCode` is sync in Volar, so workers can't remove compile from the critical path — instead an async pool that *pre-warms the G2 cache* at project load (sync path then hits warm cache). Build when server dogfooding shows cold-open pain that G2 alone doesn't fix | M2.13 | ⬜ |
| G2 | Content-hash compile cache | `src/cache.ts`: bounded memory layer + fire-and-forget disk layer (tmpdir, `IMBA_CACHE_DIR` override), keyed schema+compiler-version+flags+fileName+content — deterministic, so no revalidation. Parse failures cached; thrown errors not | M1.8 | ✅ |
| G3 | Incremental snapshot updates (`getChangeRange` between generated outputs) | `computeChangeRange` (dependency-free prefix/suffix span) on generated snapshots — TS reuses the AST around the edit. Round-trip property tests incl. the prefix/suffix-overlap trap | M2.13 | ✅ |
| G4 | Compile-failure handling: keep-last-good vs empty module | currently empty module + stored error; needs UX decision once dogfooding | M2.14 | 🤔 |
| G5 | Mapping perf on big files | spans → thousands of singleton mappings; measure, consider batching sorted runs into one Mapping | M3.14 | ⬜ |
| G6 | Benchmarks vs old plugin (cold open, keystroke→diagnostics latency, completion latency) | imba.io app + scrimba repo as corpora | M4.1 | ⬜ |

---

## Milestones

### M1 — Solid core (resolution, typings, diagnostics) ← **current**
The virtual-TS layer becomes trustworthy on real imba projects.
1. **A3/A4** extensionless + `.web.imba` resolution. Acceptance: kit test `import './main'` and `import './comp'` (with only `comp.web.imba` on disk) both type-check.
2. **A5** compiler-options strategy per mode, documented in this file.
3. **A6** real `imba.d.ts` typings replace the fixture shim. Acceptance: fixture using `setTimeout`, `imba.commit`, and a tag compiles clean.
4. **B2** imba parse diagnostics service plugin. Acceptance: fixture with syntax error shows compiler message at correct range, live.
5. **B3** suppression rules ported with table-driven tests (one fixture snippet per rule family, not all 25 initially).
6. **B4** identifier conversion for diagnostic messages.
7. **C1** explicit hover + go-to-def e2e tests (LanguageService-level, not just checker).
8. **G1/G2** worker compile + content-hash cache (server mode), sync path kept for tsserver plugin mode.
9. Dogfood checkpoint: run kit checker over an imba.io app directory; triage every false diagnostic into B3 rules or bugs.

### M2 — Imba intelligence (the monarch layer) 
Hover/completions/symbols for everything TS can't see. Items D1–D8, D11, D14–D15, C2–C3, E3, E5, E7, F1, F4, A9, G3, G4. Exit: daily-drivable in the preview extension for app development.

### M3 — Cross-file & polish
Auto-import completeness, workspace features, rename conversion, signature help, paths, config, multi-root. Items A7–A11, B5, D6 (cross-file), D9–D10, D12–D13, E2, E4, E6, E8–E10, F3, G5.

### M4 — Parity sign-off & switch
1. **G6** benchmarks; parity walkthrough of this matrix on imba.io + scrimba code.
2. Typings moved to a neutral home (imba package or language-core).
3. vscode-imba integration behind `imba.tooling: "next" | "legacy"`; old plugin gets a check-flag-before-patch guard (its only change, ~5 lines).
4. One release cycle dual-shipping → flip default → deprecate old plugin.

---

## Testing strategy

- **Unit:** mapping construction (`spansToMappings`) properties; identifier conversion tables.
- **Integration (primary):** `@volar/kit` checker over `test/fixture*/` projects — diagnostics, and (M1.7+) a thin LanguageService harness for hover/defs/completions e2e.
- **Corpus:** `apps/` imba.io code as a read-only diagnostic corpus (no false errors allowed).
- **Old-plugin behavioral reference:** when porting a rule/feature, quote the old source location in the test comment (e.g. `// parity: diagnostics.imba rule 2554`).

## Conventions for working sessions

1. Pick the next unchecked item from the current milestone (or the **Next action** pointer).
2. Spike → implement → test → update matrix row + Working log → commit code + doc together.
3. Never modify `packages/typescript-imba-plugin`, `packages/vscode-imba`, `packages/imba` (except additive, justified, logged here).
4. Anything discovered-but-deferred gets a matrix row or a Working log note — no silent scope drops.

---

## Working log (newest first)

### 2026-06-12 — Post-edit latency baseline over imba.io (G6 seed data)
- Harness over apps/imba.io (203 files), editing src/api.imba (757 lines) by appending a real def, then immediately requesting features — the exact "old plugin went dead for 3–10s after edits" scenario:
  - cold first hover (program build, warm disk cache): **64ms**; warm hover: 1ms
  - first-ever diagnostics on the big file: **2242ms** (one-time deep check of the file + lazily-compiled dependency graph)
  - **after each edit: hover 20–35ms, diagnostics 14–15ms, hover in a different file 1–19ms**
- Reading: the old plugin's stalls came from (a) geterr fanout re-checking every open file ahead of interactive requests on tsserver's single queue, (b) sync compile on that same queue, (c) per-completion export-map crawls. None of those paths exist now. Remaining honest costs: first-touch deep check of a big file (~2s, once) — candidate for background warming alongside G1; sync compile of the edited file on the hot path (~20–35ms for 757 lines — fine); G3 getChangeRange still undefined (whole-file reparse of the edited file's virtual TS).

### 2026-06-12 — F8 v2: rebased onto the official imba/zed-imba extension
- **Correction to the entry below:** imba/zed-imba AND imba/tree-sitter-imba already exist (Sindre). The official extension ships the tree-sitter grammar (pinned rev), highlight/outline/indent/locals queries, semantic_token_rules.json, and an embedded monarch mini-LSP (`imba-tags`: workspace symbols, doc symbols, basic tag goto-def, semantic tokens).
- `packages/zed-imba` rebuilt as a 1:1 mirror of the official repo with ONE change: the mini-LSP replaced by `imba-language-server` (workspace node_modules → monorepo path → settings override). All mini-LSP features are superseded by the full server; running both would double-serve (the VS Code lesson). cargo check clean (zed_extension_api 0.7).
- Highlighting in Zed: tree-sitter base + `"semantic_tokens": "combined"` augmentation — the F1 full-token-stream extension is now optional polish rather than the enabler.
- Sync path: copy `packages/zed-imba` over the standalone repo (their grammar-rev update script kept). PR to imba/zed-imba is Sindre's call.

### 2026-06-12 — F8: Zed extension scaffold (the LSP dividend) [superseded by v2 above]
- `packages/zed-imba`: extension.toml + languages/imba/config.toml (incl. `<>` autoclose for the tag-completion state, dashed word chars, hard tabs) + Rust glue resolving the server from workspace node_modules with a settings-override path for monorepo dev. `cargo check` clean against zed_extension_api 0.6.
- Verified externally: **Zed supports LSP semantic tokens** (`"semantic_tokens": "full"` replaces tree-sitter highlighting).
- ts↔imba interop in Zed: vtsls can load tsserver plugins (documented in readme, modeled on Vue's setup, untested).

### 2026-06-12 — D4: event + modifier completions; TS suppressed at imba contexts
- `@` → event names from ImbaEvents (label `@click`, filterText bare name, type detail, @summary doc, commit chars `.=(`); `.` after an event → modifiers from the event type's apparent α-properties (works for custom events via the index-signature type; @detail as signature detail; `(`-commit only when args; names via toImbaIdentifier so `αmovedΞx` shows as `moved-x`).
- **TS completions are now suppressed at TagName/TagEvent/TagEventModifier contexts** (wrapper checks monarch flags at the source offset, mapping back from the embedded TS doc): the placeholder-mapping fix had given modifier positions a completion path, leaking event-object members and RAW α/Φ names. The imba plugins are authoritative at these contexts, like the old plugin.
- Refactor: `checkerUtils.ts` — shared `findGlobalInterface` (per-program cache), `getTypeScriptService`, `summaryOf`/`detailOf`; imbaEvents + html-tag-map now use it.
- Per-state fixtures (ev-at/ev-partial/mod-dot/mod-partial/mod-touch): parse-recovered caret states differ from final states — pin each in isolation ($CARET$ lesson applied to test design).

### 2026-06-12 — Event-def positions: report not reproducible; tests now assert target lines
- Dev-host report: clicking `@intersect` landed on `abort: Event;` (first ImbaEvents property, line 902). Probed current build: declared events → exact property line (intersect→988), custom events → index signature (1088), modifiers → exact α-line. NO code path yields 902. Suspect: stale pre-`languages:[]` build where tsserver double-served and could contribute its own definition for the mapped addEventListener string literal. Awaiting retest after relaunch.
- **Testing convention hardened:** definition tests must assert the TARGET LINE CONTENT, never just the file (the old file-only assertion let position bugs hide). m2-events now checks all three def categories by reading the target line.

### 2026-06-12 — Touch modifier typings drift (@touch.meta false 2339)
- Dev-host report: `@touch.meta` flagged 2339 on type Touch. Ground truth from runtime source (events/touch.imba): Touch implements `@shift/@alt/@ctrl/@meta` (proxying originalEvent key state) plus `@mouse/@pen/@touch/@pressure/@left/@middle/@right/@end/@css/@log` — the handwritten imba.Touch interface in imba.events.d.ts was missing the entire family. Added them with docs (packages/imba typings commit).
- **A9 evidence item #3**: every typings bug so far (module hijack, missing dataForTagName, doc escaping, this drift) is the manual-mirror problem Sindre called out — the real definitions sit in stdlib imba source. When triaging a "false" diagnostic, ALWAYS check runtime source first; the diagnostic may be correctly reporting a stale mirror.

### 2026-06-12 — Custom events: ImbaEvents index-signature fallback
- Dev-host report: hover dead on `@intercept` while `.silent` misspellings still errored. Cause: `@intercept` is not a declared ImbaEvents member — it's a **custom event**, typed by the interface's `[event: string]: CustomEvent` index signature, and `type.getProperty(name)` doesn't return index members. The modifier diagnostics kept working through the generated-code path (silent lives on base Event), which is why typing "knew" while hover didn't.
- Fix (parity: old checker.member() → getStringIndexType fallback): event-name hover/def fall back to the string index info — display `(property) ImbaEvents.name: CustomEvent` + *custom event* note, def lands on the index signature declaration; modifier resolution under unknown event names uses the index value type, so `.silent` etc. hover/def work on custom events too.
- Pattern to remember for ALL checker-based lookups ported from the old plugin: `member()` had THREE fallbacks (exact prop → jsIdentifier prop → index signature). Port the full chain whenever touching symbol resolution.

### 2026-06-12 — Tag usage def/hover (E11): the two-tier answer + a tsc-target gap
- Sindre's question ("do we want TS-based lookup once a tag is used? otherwise goto-def on attributes is hard") — answered empirically: **attributes already work through TS mappings** (`message=` → `prop message` in the declaring file, typed hover) because the compiler's tsc target ALREADY emits per-tag global registrations (`namespace Global` + `declare global { globalThis.Γname; HTMLElementTagNameMap entry }`) — a chunk of A9 exists compiler-side! The tag NAME token can't ride mappings (source `cool-widget` vs generated `ΓcoolΞwidget`, unequal) → `createImbaTagsPlugin` resolves def/hover via the shared workspace tag index (now records declaration offsets; `getTagIndex(roots)` shared across plugins).
- **tsc-target gap found:** tag classes are registered globally but NOT exported as module members, while the runtime target exports them — so user-written `import { my-tag } from './x'` is runtime-correct but a false 2305. Suppressed when the named member is a known workspace tag (wrapper + shared index). **Compiler follow-up: export tag classes from the module in the tsc target too**, then drop the suppression.
- Cosmetic note: attr hover shows `(property) Global.cool-widget.message` — the `Global.` namespace prefix leaks from the tsc-target wrapper; revisit with C2/A9 polish.

### 2026-06-12 — D2 tag-name completions: the ultrafast-index design
- Design decision (Sindre's question answered): tag listings do NOT go through TS. `ImbaTagIndex` regex-scans workspace .imba files for `(export|global)? tag name` (mtime-cached, throttled walk) — TS can't see tags in never-imported files anyway, and the old getExportedTags/getExportInfoMap crawl was the slowest completion path. HTML tags come from `HTMLElementTagNameMap` via the cached-per-program checker lookup (so global custom-element augmentations appear too). Auto-import edits via monarch `createImportEdit` (dedupes existing imports; offsets→positions conversion).
- Context detection: monarch `suggest.flags & CompletionTypes.TagName` on the root doc. Gotcha: a bare `<` with no closing `>` tokenizes as `operator.logic` (less-than) — completions fire in the `<|>` state, which is what editors produce via auto-closing pairs. The old plugin's `cleanAngleBrackets` hack relates; revisit if dev-host shows missed triggers.
- Ranking: imba tags sortText '1…', html '2…'. Commit characters from old plugin ('> .[#' + space).
- Tests cover: all four sources, ranking, partial `<co>` replacement range, auto-import edit content/position, and that local/global tags don't import.

### 2026-06-12 — Completion dot bug, round 2: dot-accessor normalization (the actual user-facing fix)
- The $CARET$ placeholder mapping (below) made the textEdit survive but the served shape — `newText: ".RELUNIT"` over a range starting AT the dot — is mishandled by LSP clients once the user keeps typing (VS Code's native TS extension special-cases dotted member edits; LSP clients don't). Sindre saw both failure modes: `FLAGS..RELUNIT` (edit dropped → word-insert) and `FLAGSRELUNIT` (dot-covering range + later-normalized text).
- **Fix: `stripDotAccessor` in typescriptServices.ts** — member-completion edits are normalized to what plain clients expect: dotless newText/insertText/filterText, range starting AFTER the dot. Every client path (range extension, word fallback, insert/replace mode) now converges on a single dot.
- **Gotcha for all completion post-processing: vol-service-ts SHARES range objects across all items in a list.** Mutating one item's range corrupts the rest (first item normalized fine, every later item saw pre-moved ranges and failed the dot check). Always rebuild edit objects, never mutate. Same applies to the `?.`→`..` translation.
- Verified: serve + resolve-after-document-change both return the normalized shape; regression test asserts dotless newText and applies the edit.

### 2026-06-12 — Completion double-dot SOLVED: $CARET$ placeholder mapping
- Root cause (found via Sindre's exact interactive repro — type `FLAGS`, press `.`, then type and accept): the completion request fires at the **parse-recovered state** `FLAGS.`, which the compiler emits as `FLAGS.$CARET$`. TS's dot-accessor replacement span covers `.$CARET$`; the placeholder span (generated-only, zero source width) carried no completion flag, so the span's END couldn't map back → Volar dropped the textEdit → VS Code word-inserted the dotted `insertText` → `FLAGS..RELUNIT`.
- **Fix:** `PLACEHOLDER_FEATURES` in mappings.ts — zero-source-width containers (generated-only placeholders) get the completion flag. They are SAFE for position mapping (every interior offset clamps to the single source point — cannot produce the phantom-position bug that justified stripping container flags in M1.7).
- **Lesson recorded:** static-state probes miss parse-recovered states. Interactive flows hit `$CARET$`/recovery compilations constantly — feature tests should include a broken-state variant (the new dot-state test in m2-completions.test.ts is the template).
- Earlier same-day entry below ("not reproducible") was wrong about the cause (suspected stale dev host); the `?.`→`..` translation from that round stays as a valid defense.

### 2026-06-12 — Second dev-host round: double-serving, typings bugs, doc rendering
- **Double-serving fixed:** `typescriptServerPlugins.languages` was `['imba']` (copied from Vue's hybrid mode, where tsserver owns TS features). Our LSP owns them — so tsserver was ALSO serving .imba docs unfiltered/unconverted (`ts-plugin(2339)` with raw `ΓdocΞanchor`, duplicate hovers, false 2882s). Now `languages: []`: the plugin still loads for ts/js→imba interop, but tsserver never sees imba documents.
- **`declare module "imba"` hijack fixed at source** (packages/imba/typings/imba.d.ts — justified modification, zero in-repo consumers): the ambient block (only there to type ImbaConfig theming) shadowed the stdlib-source-resolved module, deleting mount/commit/Component for any consumer of the real package typings. Interfaces unwrapped to global scope (ImbaTheme/ImbaThemeColors renames). Old plugin never hit it — its frozen typings copy predates the block.
- **Hover doc mangling fixed in renderer:** TS's jsdoc parser chops `@word` inside doc examples (even fenced) into bogus tags; unknown tags are now stitched back into the doc text in order (imbaEvents.ts). Known meta tags (summary/custom/…) still render styled. Fixture now references the REAL package typings (unescaped) so this path stays tested.
- `dataForTagName` 2339 suppressed: the compiler emits it in every tag class but the runtime API is missing from typings — declaration should land in imba/typings eventually (flagged).
- Fixture/test note: the old-plugin typings copy and the package copy genuinely differ (escapes, module block, router ref) — the package copy is canonical for us now.

### 2026-06-12 — First dev-host feedback (@intersect.silent) → A5/A6 + events intelligence
- Sindre's screenshots split into two causes, both fixed:
  1. `Property '@silent' does not exist on type 'Event'` → the server wasn't injecting compiler options/typings (A5/A6). Now: `setupImbaProject` in the server's project `setup` hook wraps `getCompilationSettings` (RequiredCompilerOptions parity, memoized on base identity) and appends `resolveImbaTypings(projectDir)` to root files — **preferring the project's own `node_modules/imba/typings`** so types match the runtime.
  2. Hover/click on `@intersect`/`.silent` dead → those tokens never exist in generated TS (compiled to addEventListener strings). `imbaEvents.ts` ports the old getInfoAt recipe: monarch context token → `interface ImbaEvents` member → modifier as `α`-method on the event type, via PUBLIC checker APIs only (getDeclaredTypeOfSymbol/getProperty/getTypeOfSymbolAtLocation; ImbaEvents found by walking d.ts statements, cached per program). Hover shows display + docs + jsdoc tags (converted); go-to-def lands in imba.events.d.ts.
- Gotcha ported from old plugin: at the boundary after `@`/`.` the context token is the start sigil — hop `tok.next` to the name token.
- This validates the architecture question: token-syntax → global-declarations lookups work cleanly as service plugins on the identity-mapped root doc. Tags/attrs/styles hover (rest of C3) and completions (M2.2) follow the same recipe.

### 2026-06-12 — F4: vscode-imba-next preview extension (dev-host)
- `packages/vscode-imba-next` (added to workspaces glob): language + grammar (copied from vscode-imba, which stays untouched), LanguageClient over node-IPC to imba-language-server, `typescriptServerPlugins` entry for imba-typescript-plugin (`languages: ['imba']`, Vue-style) so ts/js files resolve imba imports inside the built-in TS extension.
- Runtime resolution chain verified from the extension dir (server module, plugin, vscode-languageclient, tsdk fallback). `--disable-extensions` in the run command keeps old `scrimba.vsimba` from double-serving .imba; built-in TS extension unaffected.
- Dev-host only: module resolution rides the repo's workspace symlinks; packaging (`vsce`) requires bundling — deferred to M3/M4.
- tsdk: honors `typescript.tsdk` (absolute or workspace-relative), else the workspace-hoisted TypeScript.

### 2026-06-12 — E5 document symbols + a hard-earned testing convention
- **Correction to the F1 entry below:** the first semantic-tokens "pass" was a false positive — the harness hand-assembled its plugin list and was missing the imba plugins, so TS-provided tokens (mapped through spans) were being decoded against the wrong legend. Caught while E5 returned zero symbols.
- **Convention (enforced by code):** `createImbaServicePlugins(ts)` in src/servicePlugins.ts is the ONLY way to assemble the plugin list — server and test harness both consume it. Never hand-assemble plugin lists.
- E5: monarch `getOutline` (tsserver NavigationTree shape) → LSP DocumentSymbols, with the LSP range⊇selectionRange invariant enforced. TS document symbols and TS semantic tokens are now suppressed for imba-backed docs in the wrapper (parity: getNavigationTree / getEncodedSemanticClassifications intercepts replaced rather than merged).
- Interop gotcha: imba-monarch's CJS default export resolves differently under node-CJS vs vite-node ESM transforms — constructor resolved defensively in virtualCode.ts. Zero-length monarch tokens filtered from semantic tokens.

### 2026-06-12 — M2 begun: monarch integration + F1 semantic tokens
- imba-monarch wired in: `ImbaVirtualCode.monarchDoc` (lazy) — `ImbaScriptInfo` happily takes `({fileName}, sourceString)`, no tsserver SVC needed. Typed via a minimal ambient shim ([src/imba-monarch.d.ts](src/imba-monarch.d.ts)) since the package ships no declarations and is actively evolving (consolidation with imba/program).
- Runtime contract worth remembering: imba `?`-getters compile to `Φ`-suffixed properties (`sym.globalΦ` etc.).
- F1 semantic tokens: monarch tokens → standard LSP token types on the identity-mapped root doc; e2e test decodes the LSP data and asserts every token covers identifier text. This is the monarch beachhead — E5 outline and M2.2 completion contexts reuse `monarchDoc`.

### 2026-06-12 — C2 pulled forward: hover + relatedInformation conversion
- Audit prompted by Sindre's question "does greek-encoded stuff reach the user?": diagnostics messages were covered; `relatedInformation` messages and hover contents were NOT. Both now converted in the typescriptServices wrapper. Hover proven via `fancy-name` fixture (compiles to `fancyΞname`, hover must show the imba form).
- Remaining conversion surfaces, deliberately deferred: completion labels/details (arrive with D1 forwarding, M2.1), signature help (M3.12), Ω-prefixed internal names in hover (meaningless until A9 introduces them; revisit at M2.6).

### 2026-06-12 — M1.9 dogfood over imba.io (203 files): M1 complete
- `test/dogfood.cjs [projectDir] [--errors-only] [--samples=N]` — kit inferred checker over a real project, read-only; the compilerOptions in that script ARE the de-facto A5 injection list (target/module esnext, moduleResolution bundler, allowJs, skipLibCheck, strict off, allowArbitraryExtensions, customConditions ['imba'], lib esnext+dom+dom.iterable, typings d.ts as extra root).
- Cold run 6.0s for 203 files incl. full type-check — already faster than the old plugin's startup, before G1 warming.
- Fixes from triage: `mapsCleanly` (B6) kills compiler-generated-symbol diagnostics that Volar fallback-mapped to degenerate positions; rules added for 7045/7046, CSS-var property 2339 (**raw form `ΞΞ` — rules see pre-conversion messages!**), generated `τ` 2304s. 1298 → 1111 total diagnostics.
- **Error-severity result: 212 errors in 51/203 files**, fully triaged:
  - 112 × 2551 ('@sel', 'route' on tags) → **A9** (`extend tag`/custom modifiers across files) — confirmed as the single biggest real gap; drives M2.6 priority.
  - 28 × 2300+2307 → corpus artifacts (docs examples share one inferred program / import fake modules) — not plugin bugs; per-example projects would eliminate.
  - 19 × 1005/2304/2695 in `src/repl/languages/javascript.imba` + 4 × 1184 in `src/decorators.imba` → **compiler tsc-target output bugs** (malformed TS for specific constructs — monaco-grammar-style nested object literals w/ regexes; decorator shapes). File compiler issues; affects old plugin equally. Investigate at M2.
  - 12 × 2554 (got<expected) + 7 × 2305 (imba/compiler typings surface incomplete) → unclassified/typings gaps, revisit with A9.
- Remaining warning/hint-level noise matches old plugin behavior (2339 `$prop` downgrades, real unused params as faded hints).

### 2026-06-12 — M1.7: e2e harness + container-mapping fix; scope updates from Sindre
- `test/harness.ts`: full Volar LanguageService over fixture tsconfigs (kit only exposes diagnostics) — this is the reusable surface for all feature e2e tests (hover/defs/completions). `locate(file, needle)` helper for position targeting.
- **Mapping bug found & fixed:** Volar queries position-features at every candidate generated position; container mappings clamp interior offsets (`min(relativePos, toLength)`) onto unrelated tokens — produced a phantom same-file definition (landed on `count` from a tag-body position). Containers now carry `verification` + `structure` only. Rule of thumb: position-level features travel exclusively through exact spans.
- Hover + go-to-def proven e2e in both directions (imba→imba incl. into-stdlib-typed code, ts→imba with exact selection ranges).
- Scope (Sindre): D10 path completions dropped; D5 style/unit completions should likely be served from static tables outside the TS pipeline — decide at M2.2 spike.

### 2026-06-12 — M1.3/M1.5/M1.6: real typings, suppression rules, identifier presentation
- **The full real-world chain works:** fixture tsconfig with `customConditions: ['imba']` + `allowArbitraryExtensions` resolves `import 'imba'` through the exports map to `src/imba/imba.imba` — the actual stdlib source — which our language plugin compiles like any user file (with `nocheck`, parity with old compiler.imba). A tag component using `@click`, `imba.commit!`, `imba.mount` and the global typings checks **clean**; a deliberate misuse through the same chain still errors (proves checking is live, not silently absent).
- Global typings wired via a one-line `globals.d.ts` referencing the old plugin's `typings/imba.d.ts` (read-only). Automatic injection for arbitrary projects remains under A5.
- B3 ported as a data table (`tsDiagnosticRules.ts`) preserving the old control flow (suppress stops, downgrade continues); applied in a `createTypeScriptServices` wrapper that **only filters imba-backed documents** — plain .ts diagnostics pass through (old plugin's `continue unless mapper`).
- B4: Greek-letter conversion applied per diagnostic message — the whole-protocol JSON rewrite is gone for good (matrix F7 ❌ by design).
- Stdlib program cost: checker construction over the fixture incl. full stdlib ≈ 1s in tests — acceptable; G2 cache will absorb it for real projects.

### 2026-06-12 — M1.4 done: parse diagnostics (B2) + root/child restructure
- **Architecture change (important):** root virtual code is now the imba source with an identity mapping; generated TS moved to `embeddedCodes[0]`. Forced by Volar's `documentFeatureWorker`: plugins only ever see *embedded* documents, and only those with feature-enabled mappings — a failed compile (empty mappings) made files invisible to every feature. The identity-mapped root fixes that and is the document imba-side plugins (M2 hover/completions/semantic tokens) will run against. `getServiceScript` now returns `root.tsCode`.
- `createImbaDiagnosticsPlugin` surfaces compiler parse diagnostics live (old plugin was save-gated). Ranges computed from offsets via `document.positionAt` — compiler line/character ignored as potentially stale.
- Gotcha for future plugins: a plugin receiving a document must `decodeEmbeddedDocumentUri` and look up the embedded code by id; checking `languageId === 'imba'` alone also matches nothing (source docs are never visited).

### 2026-06-12 — M1.1 done: extensionless + .web.imba resolution (A3/A4)
- `@volar/typescript`'s `createResolveModuleName` already implements the old plugin's fileExists trick behind `typescript.resolveHiddenExtensions` — TS probes `foo.d.ts` for extensionless `./foo`, Volar answers yes when `foo.imba` exists and rewrites the resolution. One flag + one extra extension entry replaced three patched classes.
- `.web.imba` handled by an `extraFileExtensions` entry `'web.imba'` ordered before `'imba'` → platform variant wins when both exist (test: `m1-resolution.test.ts` with conflicting return types).
- **Accepted deviation:** when `foo.ts` AND `foo.imba` both exist, `./foo` now resolves to `foo.ts` (TS probes .ts before .d.ts); the old moduleSuffixes order preferred `foo.imba`. Revisit at dogfooding if real projects hit it.
- Perf note: `resolveHiddenExtensions` adds up to 2 extra fileExists probes per failed `.d.ts` lookup during resolution — fold into G5 measurement.
- Works for ts→imba, imba→imba, and imba→ts directions (fixture imports cover all three).

### 2026-06-12 — Plan created; M1 begun
- Parity matrix built from a full read of the old plugin (~6k lines, all files).
- M0 recap: 3 packages landed (`d8fbcb6e`), 5/5 kit tests green — mappings round-trip, imba-coordinate diagnostics, ts↔imba imports.
- Known from M0: extensionless `./main` fails with 2307 (A3); fixture uses `declare module 'imba'` shim (A6).
- A9 (global Ω dts sidecar) flagged as the biggest open design question — prefer solving in the compiler's tsc target (emit `declare global` inline) over virtual sidecar files; needs a compiler-side spike.
