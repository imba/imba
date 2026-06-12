# Imba Volar tooling — parity plan & working doc

**Goal:** feature parity with `typescript-imba-plugin` + `vscode-imba`'s bridge features, on the Volar architecture, then switch defaults. The old plugin stays untouched and shipping until M4 sign-off.

This is a *living working document*. Any session (human or agent) picking up this track should read **Status & resume pointer** below, do the next unchecked item, update the matrix/log, and commit doc updates together with the code.

---

## Status & resume pointer

- **Current milestone:** M2 — **daily-drivable preview**: `./packages/vscode-imba-next/dev.sh [project]`. The M2.2 completion suite is essentially complete (tags/attrs/events/modifiers/styles/values/vars/mixins/decorators/keywords).
- **Next action:** **A9 design spike** — the last big M2 rock. This is a DESIGN decision involving compiler changes (extend-class Ω output → global types; tsc-target tag exports), so present options to Sindre rather than implement unilaterally. After A9: G4 keep-last-good, remaining C3 hover contexts, then M3 rows
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
| A7 | Virtual jsconfig for config-less projects | createVirtualProjectConfig + virtual file System patch | Volar creates per-folder inferred projects natively and setupImbaProject runs for them too; without a configFileName the imba-required target/module/moduleResolution are FORCED (the server's synthesized options are CommonJS-ish, not a user choice). Bare-project harness (createBareLanguageService) pins the full experience under hostile options | M3.6 | ✅ |
| A8 | Asset imports (`./icon.svg` etc., ImbaAsset types) | EXTRA_EXTENSIONS in resolveImportPath, `allowArbitraryExtensions` | **works out of the box**: the tsc target emits `data:text/asset;` specifiers and the typings' wildcard module types them as ImbaAsset — clean diagnostics, hover, member completions. Pinned with tests | M3.5 | ✅ |
| A9 | Global `extend class` / global tags across files (Ω dts sidecar) | dts.imba/dtsutil.imba: rewrite compiled dts → `.imba._.d.ts` virtual roots | **Scope expanded (Sindre 2026-06-12): A9 is the typings-from-source mechanism.** Stdlib declares modifiers/extensions in actual source (`extend class Event` in events/core.imba, `class IntersectionEvent` with `def @in/@out` in events/intersect.imba) — A9 turns those into global types, making the handwritten imba.events.d.ts *transitional*. Serves user `extend tag` (112 dogfood errors), stdlib modifiers, and source-located hover/def with real docs. Design: prefer compiler emitting `declare global` inline in the tsc target; fallback `getExtraServiceScripts`. Next major work item | M2.6 | 🤔 |
| A10 | Project-local imba compiler (`useImbaFromProject`) | getImbaCompilerForPath + require | `getProjectCompilerForFile` (walk-up node_modules/imba, CJS require of exports['./compiler'], error-once) wired into compileImba with the project version in the cache key; crashing compilers retire for the session and fall back to bundled with clean keys. Opt-in like the old default (setProjectCompilerEnabled / IMBA_USE_PROJECT_COMPILER=1); F3 wires the config | M3.7 | ✅ |
| A11 | Multi-root / multiple tsconfig projects | **broken** in old plugin (last-project-wins) | Volar handles per-project natively — regression test pins two projects with same-named conflicting exports (hover types stay per-project, interleaved queries, workspace symbols scoped to each root) | M3.8 | ✅ |

### B. Diagnostics

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| B1 | TS diagnostics in imba coordinates | Session.sendDiagnosticsEvent + o2iRange mapping | Volar mapping | M0 | ✅ |
| B2 | Imba compiler parse diagnostics | script.getImbaDiagnostics (save-gated) | `createImbaDiagnosticsPlugin` over the identity-mapped root doc (live, not save-gated) | M1.4 | ✅ |
| B3 | Suppression rules (~25 codes: 2322/2339/2554/6133-patterns…) | diagnostics.imba Rules table + filterDiagnostics | `tsDiagnosticRules.ts` table + `createTypeScriptServices` wrapper (filters only imba-backed docs; plain .ts untouched). NOTE: rules match RAW messages (Ξ/Ψ/α encoded) | M1.5 | ✅ |
| B6 | Unmappable/mismapped diagnostic suppression ("hide if it doesnt map perfectly") | patches.imba filterDiagnostics range+text checks | `mapsCleanly` in the wrapper: no-fallback range mapping required; unused-declaration diags additionally require mapped source text == reported name | M1.9 | ✅ |
| B4 | Greek-letter cleanup in messages (Ξ Φ Ψ Γ α Ω → imba names) | toImbaString over whole JSON protocol | `conversion.ts` applied per diagnostic message + relatedInformation in the wrapper | M1.6 | ✅ |
| B5 | debugLevel≥2 "show suppressed as warnings" | filterDiagnostics | `imba.debugLevel ≥ 2` keeps rule-suppressed diagnostics (Rules table + 2305 tag-import) as warnings with source `imba-suppressed`; mapsCleanly drops stay dropped (their ranges don't map) | M3.9 | ✅ |

### C. Hover / quick info

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| C1 | TS hover at mapped positions | intercept.getQuickInfoAtPosition | volar-service-typescript via mappings; explicit e2e via `test/harness.ts` (full LanguageService over fixtures — reuse for all feature tests) | M1.7 | ✅ |
| C2 | Identifier conversion in hover display | toImbaDisplayParts | `provideHover` wrap in typescriptServices.ts (all MarkupContent/MarkedString shapes); Ω-prefixed internal names revisited with A9 | M2.4 | ✅ |
| C3 | Imba-context hover: style props/values, units, mixins, style vars/colorvars, events, event modifiers, tag names/attrs, meta symbols, MDN links | script.getInfoAt + checker.getSymbolInfo (700+ lines) | monarch-driven plugins; type queries via injected TS LS. Events + modifiers (`imbaEvents.ts`), tag names + style vars/mixins (`imbaTags.ts` E2), **style props + style modifiers** (imbaTags styleMetaAt: @proxy-expanded titles, proxied docs incl. MDN links, @detail selectors). Units/value hover remain (D6 territory, low value) | M2.3 | ✅ |

*C1 is exercised indirectly (mapping round-trips + diagnostics); add an explicit hover e2e test in M1.7.

### D. Completions

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| D1 | Plain-code completions (vars, props, implicit self, globals, classes) | 100% hand-assembled (values/access in completions.imba) | **forward to TS** over virtual code at mapped positions; hand-roll only what TS can't see | M2.1 | ⬜ |
| D2 | Tag names (html, local components, snippets) | tagnames() + checker.getLocalTags + getExportedTags via export-info crawl | `createImbaCompletionsPlugin` + **`ImbaTagIndex`** (regex scan over workspace .imba files, mtime-cached — the "ultrafast path", replaces the export-info crawl which was the old plugin's slowest completion) + HTMLElementTagNameMap via cached checker lookup + auto-import via monarch createImportEdit. Snippets pending | M2.2 | ✅ |
| D3 | Tag attrs/props per tag | tagattrs() + isTagAttr filtering | `tagAttrItems` in imbaCompletions — element type via HTMLElementTagNameMap (the compiler's per-tag global merge covers custom tags), settable/non-readonly props, GlobalEventHandlers + on*/className/Ψ filtered, `=` commit. TagProp added to the TS-suppression mask. Gap: plain non-exported local tags aren't in the map (no global merge) — noted | M2.2 | ✅ |
| D4 | Tag events + event modifiers | ImbaEvents props + getEventModifiers | `@`-triggered event names (ImbaEvents props, type details, @summary docs) + `.`-triggered modifiers (α-props of the event type incl. custom events via index signature, @detail signatures, αoptions excluded, names converted). TS completions SUPPRESSED at imba-special contexts (tag/event/modifier) — they leaked event-object members and raw α names through the placeholder mappings | M2.2 | ✅ |
| D5 | Style properties (abbr config), values per property, modifiers, selectors | styleprops/stylevalues/stylemods via imbacss symbols | Properties + @-modifiers (slice 1) and **values per property (slice 2 ✅)**: `suggest.styleProperty` → imbacss export (abbreviations follow @proxy, dashed names via new `toJSIdentifier`) → declared-type members with docs (`d:` offers block/flex/grid…). Remaining: named colors/Ψglobals merge-in, selectors context, abbr-preference config | M2.2 | 🚧 |
| D6 | Style vars / colorvars, custom units, number units | cross-file token scans (findImbaTokensOfType) | `styleVarItems`: `style.property.var` tokens across ALL program files (monarch docs forced+cached per virtual code) — `$`-vars at StyleVar contexts, `--`-vars merged into value lists, cross-file with file attribution. Note: current monarch unifies `--`/`$` declarations under one token type. Units pending | M2.2 | 🚧 |
| D7 | Mixins | getMixinReferences | `mixinItems`: `style.selector.mixin.name` declarations across program files; token-driven branch (monarch sets NO completion flag at mixin positions — TS suppression also extended by token match) | M2.2 | ✅ |
| D8 | Decorators | local vars + imba builtins + exported αdecorators | `decoratorItems`: local @-vars (monarch varsAtOffset) + stdlib α-exports via `findModuleExportsByFileSuffix` (@lazy/@bound/@thenable with docs). Decorator added to TS-suppression mask. Workspace-exported decorators → D13 | M2.2 | ✅ |
| D9 | Types after `\` | getSymbols('Type') + snippets | **mapping fix, not a plugin**: annotation spans cover `\str` in source vs `str` generated (off-by-one container → ALL position features dead at type positions). spansToMappings shifts text-verified backslash-spans to exact — TS type-position completions/hover/defs flow natively; keywords plugin skips Type contexts | M2.5 | ✅ |
| D10 | Path completions in imports | paths() via directoryStructureHost | ❌ dropped — Sindre: not needed (2026-06-12) | — | ❌ |
| D11 | Keywords + root snippets | KeywordCompletion + snippets('root') | `createImbaKeywordsPlugin` (ADDITIONAL completion source; imba-only keywords — TS provides the JS set; monarch's contextual list, weight-800 parity). Snippets pending | M2.2 | 🚧 |
| D12 | Auto-imports: values/types (TS-backed) | importer.imba getExportInfoMap machinery | mostly free via D1 forwarding (TS auto-imports map edits back); verify import path gets `.imba`-stripped/extensionless form | M3.1 | ⬜ |
| D13 | Auto-imports: exported tags, decorators, export-star namespace groups (EXPORT_NS) | importer.imba custom grouping | custom contributions on top of D12 | M3.2 | ⬜ |
| D14 | Completion resolve: docs markdown, import edits via `doc.createImportEdit` | SymbolCompletion.resolve | resolve handler in service plugin (monarch createImportEdit reused) | M2.2 | ⬜ |
| D15 | Commit characters / weights / filterText shaping | per-category logic in completions.imba | port per-category table | M2.2 | ⬜ |

### E. Navigation & symbols

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| E1 | Go to definition (TS-backed) | intercept + convertLocationsToImba | Volar mapping | M0* | ✅ |
| E2 | Def/refs for style vars, colorvars, units, mixins | checker token-def synthesis | imbaTags plugin: usage-token → declaration-token mapping table, program-wide via monarch docs, snapshot-based ranges; covers --vars, $vars, mixins both directions. References/rename via token families (E4) | M3.3 | ✅ |
| E3 | Definition filtering (`__new` removal, prefer .imba over .d.ts, meta suppression) | intercept.getDefinitionAndBoundSpan | `preferImbaDefinitions` in the TS wrapper (imba source beats typings d.ts entries; never empties the list). `__new` rule obsolete — current compiler emits real constructors | M2.7 | ✅ |
| E11 | Def/hover on tag usage (`<cool-widget>`) + attributes | checker.getTagSymbol/getTagAttrSymbol | **two-tier (key architecture validation):** attributes flow through TS mappings for free (exact spans, once Γ globals resolve — compiler already emits `declare global` registrations per tag declaration!); the tag NAME token (unequal span vs Γ-name) bridges via `createImbaTagsPlugin` + workspace index | M2.2 | ✅ |
| E4 | Find references / rename (TS-backed) | intercepts + conversion | References free via mappings (imba↔ts cross-file). Rename round-trips the encoding: EXACT_FEATURES navigation hooks encode the new name for TS and decode edit texts landing in imba source — ts/js files keep encoded names. Root identity mapping uses hook-free IDENTITY_FEATURES (hooks there double-encoded monarch-plugin renames). Style vars/mixins: monarch token families in imbaTags (refs + prepare + rename) | M3.10 | ✅ |
| E5 | Document symbols / outline | doc.getOutline (monarch) replacing navtree | `createImbaDocumentSymbolsPlugin` (monarch outline → LSP DocumentSymbols, TS symbols suppressed for imba docs) | M2.8 | ✅ |
| E6 | Workspace symbols (imba + TS merged, scope config) | getNavigateToItems override | `createImbaWorkspaceSymbolsPlugin` (monarch getNavigateToItems program-wide, old fuzzy matching); TS results keep ts/js only with names converted (typings Φ/α symbols). Scope config (imbaOnly) pending with F3 | M3.3 | ✅ |
| E7 | Folding | old returned `null` (!) | `createImbaFoldingPlugin` — indentation folding computed server-side (blank-line tolerant, tab/space aware); TS folding suppressed for imba docs (mapped from generated code it was degenerate single-line noise). Client fallbacks can't be relied on once an LSP server advertises the capability | M2.9 | ✅ |
| E8 | Document highlights | disabled for imba | TS via mappings — quality verified (read/write kinds, dashed tokens). Same-delta exact spans merged in spansToMappings so Volar's per-mapping fan-out can't duplicate result sets; first-generated-position gate kept for distinct-offset multiplexing | M3.11 | ✅ |
| E9 | Signature help (incl. event-modifier signatures) | intercept + checker.getSignatureHelpForType hack | TS-backed through the mappings (all caret states map, incl. empty parens); event-modifier parens need NO checker hack — modifiers compile to plain method calls. Wrapper converts encoded callee names in labels (imba docs only) | M3.12 | ✅ |
| E10 | File-rename import edits | getEditsForFileRename + conversion | TS-backed via Volar (imba + ts importers both updated). Wrapper strips `(.web).imba` endings from rewritten specifiers — extensionless is idiomatic and resolves project-wide via resolveHiddenExtensions | M3.13 | ✅ |

### F. Editor surface (vscode + protocol)

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| F1 | Semantic tokens from monarch | getSemanticTokens via encodedSemanticClassifications intercept | `createImbaSemanticTokensPlugin` — standard LSP token types from monarch tokens on the root document (works in any LSP client, no tsserver) | M2.10 | ✅ |
| F2 | Status bar (compile spinner etc.) + **environment health check** | node-ipc bridge | **Health check ✅:** one warning at 0:0 ("imba types are not loaded…") when ImbaEvents is unresolvable, cached per program (imbaDiagnostics plugin; bare-project fixture test). Status-bar UX via LSP notifications still pending | M2.12 | 🚧 |
| F3 | Config (suggest.*, workspaceSymbols.scope, debugLevel, useImbaFromProject) | configurePlugin + ipc | `config.ts` (applyImbaConfig/getImbaConfig, full-section semantics, side-effects to A10 flag); server applies initializationOptions.imba + didChangeConfiguration (then project.reload()); vscode-imba-next contributes imba.useImbaFromProject / imba.debugLevel / imba.workspaceSymbolsScope and forwards changes. suggest.* knobs deferred until a real need shows up in dev-hosting | M3.9 | ✅ |
| F4 | Preview VS Code extension (`imba-next` style) | n/a | `packages/vscode-imba-next`: LSP client → imba-language-server, grammar copied from vscode-imba, tsserver plugin contribution. Dev-host only (`code --extensionDevelopmentPath=… --disable-extensions`); vsce packaging needs bundling, M3 | M2.11 | ✅ |
| F8 | Zed extension (architecture dividend: server is plain LSP) | github.com/imba/zed-imba already existed: tree-sitter grammar (imba/tree-sitter-imba) + queries + a monarch mini-LSP (imba-tags) | `packages/zed-imba` now mirrors the official repo's structure with the mini-LSP replaced by imba-language-server (workspace/monorepo resolution + settings override; cargo-check clean on zed_extension_api 0.7). Sync back to imba/zed-imba = plain copy. Highlighting: tree-sitter base + semantic tokens "combined" (their semantic_token_rules.json kept) | M2 | ✅ |
| F5 | Selection tracking / save notifications | ipc onDidChangeTextEditorSelection/didSave | not needed (LSP didSave; live parse diagnostics replace save-gating) | — | ❌ |
| F6 | Standalone tsserver wrapper (typescript-imba-service) | separate package | superseded by imba-language-server (any LSP editor) | — | ❌ |
| F7 | Protocol-wide greek-letter rewrite of every message | Session.send JSON round-trip | ❌ dropped by design — conversion happens at feature boundaries only (B4, C2, D-resolve) | — | ❌ |

### G. Performance & robustness (new-architecture obligations)

| # | Item | Notes | Milestone | Status |
|---|---|---|---|---|
| G1 | Worker-thread compilation | **redefined:** `createVirtualCode` is sync in Volar, so workers can't remove compile from the critical path — instead `warmImbaCompileCache` pre-warms the G2 cache: setupImbaProject kicks it off 1s after project load (chunked, 4 files per 10ms tick, once per host), so first interactions hit warm entries | M2.13 | ✅ |
| G2 | Content-hash compile cache | `src/cache.ts`: bounded memory layer + fire-and-forget disk layer (tmpdir, `IMBA_CACHE_DIR` override), keyed schema+compiler-version+flags+fileName+content — deterministic, so no revalidation. Parse failures cached; thrown errors not | M1.8 | ✅ |
| G3 | Incremental snapshot updates (`getChangeRange` between generated outputs) | `computeChangeRange` (dependency-free prefix/suffix span) on generated snapshots — TS reuses the AST around the edit. Round-trip property tests incl. the prefix/suffix-overlap trap | M2.13 | ✅ |
| G4 | Compile-failure handling: keep-last-good vs empty module | currently empty module + stored error; needs UX decision once dogfooding | **keep-last-good** (probing showed every unrecoverable parse state already emptied the module — not just crashes): per-file last good js+spans substituted when a compile fails, CURRENT diagnostics kept, deliberately emptied files never substituted, works through cache hits; compiler crashes surface as a 0:0 diagnostic | M2.14 | ✅ |
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

## A9 design brief (decision needed — Sindre)

**Problem:** three type surfaces still depend on mechanisms that don't exist in the new stack: (1) user `extend tag`/`extend class` across files (112 dogfood errors — `'route' does not exist on 'story-list'`), (2) custom event modifiers declared in user/stdlib source, (3) the handwritten typings mirror that keeps drifting (module hijack, dataForTagName, Touch modifiers, doc escaping — four bugs in two days). The compiler ALREADY solves the analogous problem for tag *declarations* (namespace Global + declare global + HTMLElementTagNameMap merge in the tsc target).

**Option A — compiler emits global merges for extend-class too (recommended).** The tsc target compiles `extend tag story-list` / `extend class Event` into `declare global { interface ... { ...members } }` blocks inline in the generated module, exactly like it already does for tag declarations. Tooling needs zero new machinery (mappings flow through the existing spans); types are correct in ANY consumer of the compiled output (tsc CLI checks too); and it directly enables typings-from-source — stdlib modifiers could migrate out of imba.events.d.ts at your pace. Cost: compiler work in the tsc backend (your side); interface-merge semantics need care for non-interface targets (classes merge via interface declaration with the same name — workable since Γ/instance types are interfaces in the output).

**Option B — tooling-side dts sidecars (the old dtsutil approach, modernized).** The language server compiles each file's declarations, rewrites Ω/extend output into `declare global` blocks, and injects them via Volar's `getExtraServiceScripts`. No compiler changes, but: a second compile per file (or d.ts emit), the fragile regex rewriting dtsutil did, sidecar invalidation complexity, and it only fixes editors — `tsc` checking imba output stays wrong. This is the old plugin's architecture and its maintenance burden.

**Option C — hybrid quick fix.** Tooling appends synthesized `declare global` text to the generated snapshot for extend-class constructs it can detect via monarch (we control the embedded text). Cheaper than B, no compiler change, but type info is approximate (no checker-derived member types — we'd synthesize `any`-ish members), which silences the 2551s without real typing.

**Recommendation:** A, with C as an optional stopgap if A's compiler work has a long lead time. Also fold in the two known tsc-target gaps while in there: export tag classes as module members (kills the 2305 suppression), and declare `dataForTagName` (kills that suppression).

**Decisions needed:** (1) A vs B vs C (or A+C staging); (2) if A: should I attempt the compiler change in `src/compiler/` myself or is that yours; (3) typings-from-source migration appetite (stdlib `extend class Event` docs become the canonical hover source).

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

### 2026-06-12 — C3 style hover: the typings already carry everything
- Hover on `style.property.name` tokens: abbreviation entries (`bd`) follow their @proxy to the full property (`border`), whose generated docs already EMBED the MDN link — title renders as `bd (border)`, docs come from the proxied symbol. Full names render directly. `style.property.modifier` tokens (`@hover`) render @detail (css selector equivalent) + docs.
- All through the same per-program-cached imbacss lookup the D5 completions use; `tagText` moved to checkerUtils (was a local helper in imbaCompletions). createImbaTagsPlugin now takes ts.
- C3 marked ✅ — remaining sub-context (unit/value hover) is D6 territory and low-value.
- test/m3-style-hover.test.ts (3 tests). Suite at 128.

### 2026-06-12 — A7: inferred projects get imba options forced, not defaulted
- Volar already creates a per-workspace-folder inferred project for files outside any tsconfig, and our setup hook runs for those too. The catch: the server SYNTHESIZES CommonJS-ish compiler options for inferred projects, and the wrapper's "defaults only when the project hasn't chosen" rule treated them as choices — breaking extensionless ESM imports. Now: no configFileName → target/module/moduleResolution are forced (there is no user choice to respect).
- New harness entry `createBareLanguageService(rootDir)`: no tsconfig, hostile CommonJS/Node10 options, no configFileName, setupImbaProject applied — the closest in-process replica of the server's inferred path. fixture-inferred pins: clean diagnostics, cross-file hover/defs over extensionless imports, typings injection (@click.flag resolves with no tsconfig anywhere).
- Fixture authoring reminder: `export tag dashed-name` is invalid imba (lowercased tags are global, not exportable) — the compiler diagnostic caught my fixture; good sign for the pipeline, embarrassing for me.
- test/m3-inferred-project.test.ts (5 tests). Suite at 125.

### 2026-06-12 — A8 verified free; A11 pinned with a two-project regression test
- A8: nothing to build — the tsc target already rewrites asset imports to `data:text/asset;` specifiers and the typings' wildcard module (`declare module "data:text/asset;*"`) types them as ImbaAsset. Fixture probe: clean diagnostics, hover `const icon: ImbaAsset`, member completions (body/url/absPath/path). Pinned with tests (fixture icon.svg + assets.imba).
- A11: the old plugin's multi-project story was last-project-wins (one global `self.project`). Volar scopes per-project natively; the regression test creates fixture-b with a same-named conflicting export (`greet(count\number)` vs fixture's `greet(name\string)`) and asserts interleaved hovers stay per-project and workspace symbols stay per-root (tag index keyed by workspace roots).
- A7 (config-less projects) remains — needs a server-level/inferred-project harness, next candidate.
- test/m3-assets-multiroot.test.ts (4 tests). Suite at 120.

### 2026-06-12 — D9 was a mapping bug: type annotations were invisible to every feature
- Probe: completions after `a\str` returned ONLY the 21 imba keywords. Root cause far better than expected: the compiler's annotation spans cover `\str` (4 source chars) against `str` (3 generated chars) — the systematic off-by-one made them CONTAINERS, so type positions had no completion/hover/navigation at all. Not just D9: hover and go-to-def on every type annotation were dead.
- Fix in spansToMappings: when sourceLength === generatedLength + 1 and the texts verify (`source[s0] === '\\'` and the rest matches the generated slice), shift the span past the sigil and emit it exact. Text-verified — no guessing. TS then serves type-position completions natively (string/Point with edits covering exactly the typed partial), plus hover (`type Poi = …`) and defs.
- Keywords plugin now skips CompletionTypes.Type contexts (keywords are noise in a type position).
- Suite at 116; dogfood unchanged (212/51). Old plugin needed getSymbols('Type') + snippets for this — the mapping path replaces all of it.

### 2026-06-12 — F3 + B5: configuration spine, show-suppressed debugging
- `config.ts`: three settings for now (useImbaFromProject, debugLevel, workspaceSymbolsScope), full-section semantics (a partial update resets unspecified keys — the client always sends the whole imba.* section), side effect wiring to the A10 flag. suggest.* knobs from the old schema deferred until dev-hosting shows a need.
- Server: initializationOptions.imba at startup; didChangeConfiguration → applyImbaConfig + project.reload() so open documents re-check under the new rules. Extension: contributes the three settings, sends them at init, `synchronize.configurationSection` forwards changes.
- B5: at debugLevel ≥ 2, rule-suppressed TS diagnostics (Rules table + known-tag 2305) stay visible as warnings with source `imba-suppressed` — the dev-host triage loop ("is the checker wrong or did we suppress it?") needs exactly this. mapsCleanly drops remain dropped; their generated-position ranges can't render meaningfully.
- E6 follow-up closed: workspaceSymbolsScope 'imba' returns monarch results only.
- test/m3-config.test.ts (4 tests). Suite at 112. Server + extension typecheck clean.

### 2026-06-12 — A10 project-local compiler: opt-in, version-keyed, crash-safe
- `getProjectCompilerForFile`: walk-up node_modules/imba lookup (per-dir memoized along the visited path), CJS require of the package's exports['./compiler'] (require → node → default conditions; ESM-only builds fall back to bundled since Volar's createVirtualCode is sync), per-package error-once cache.
- compileImba uses it when enabled, with `imba@<version>` in the content-hash cache key so entries from different compilers never mix. A compiler that crashes at compile time is retired for the session and the call retries — recursion lands on the bundled compiler with its own clean cache key (the fallback result must never be stored under the project key).
- Opt-in matching the old plugin's default (`useImbaFromProject: false`): `setProjectCompilerEnabled(true)` or env `IMBA_USE_PROJECT_COMPILER=1`. F3 config plumbing will expose it per-workspace.
- test/m3-project-compiler.test.ts (4 tests; the monorepo's node_modules/imba symlink doubles as the "project" package). Suite at 108.

### 2026-06-12 — E7 + G1: server-side indentation folding, compile-cache warmer
- E7 probe: TS folding mapped onto imba docs is degenerate noise (single-line ranges, dozens of duplicates) — and unlike the old tsserver-plugin world, an LSP server that advertises foldingRangeProvider can't count on client indentation fallbacks. So: TS folding suppressed for imba docs (same intercept family as symbols/semantic tokens) and `createImbaFoldingPlugin` computes indentation folding directly (stack-based, blank-line tolerant, tabs/spaces via column widths). widgets.imba folds exactly [tag → body, <self> → body, global tag → body].
- G1 (as redefined earlier): `warmImbaCompileCache(fileNames)` chunks through project files compiling into the G2 cache; setupImbaProject fires it once per host, 1s after load, unref'd timer. Warm-hit identity verified (memory cache returns the same object).
- test/m3-folding-warmer.test.ts (4 tests). Suite at 104.

### 2026-06-12 — G4 keep-last-good: parse failures empty the module far more often than crashes
- Probed six hard-broken inputs: NONE made the compiler throw — but ALL yielded the empty-module fallback (js `export {};`) with one parse diagnostic. So the empty-module cascade (every importer suddenly missing exports, in-file TS surface dead) was the EVERY-KEYSTROKE failure mode for unrecoverable states, not a rare crash path.
- compileImba now keeps a per-file last-good (js + spans, 256-entry session map) and substitutes it whenever a compile fails (throw, or EMPTY_JS sentinel + error diagnostic). Diagnostics always come from the CURRENT attempt, so the parse error shows while the stale-but-working module keeps the project coherent. `recovered: true` marks substituted results (F2 status-bar hook later).
- The content-hash cache stores RAW results only; substitution happens at return time — a stale module can never leak into another session through the disk cache. Substitution verified through cache hits.
- Deliberately emptied files are safe: empty source compiles cleanly to a real preamble module (not the EMPTY_JS sentinel), so it becomes the new last-good instead of resurrecting old exports.
- Compiler crashes (error field) were silent before — imbaDiagnostics now surfaces them as a 0:0 error diagnostic.
- Stale-spans caveat: while recovered, mappings lag the live source by the unparsable edit. Acceptable mid-brokenness; monarch-token features keep using the live source.
- test/m3-keep-last-good.test.ts (5 tests). Suite at 100.

### 2026-06-12 — E8 + E10: span-merge dedupe, extensionless file-rename edits
- E8 probe: highlights quality is good (read/write kinds, dashed full-token ranges) but every entry for an IMPORTED name appeared twice. Root cause is structural, not TS: Volar's `getGeneratedPositions` yields one generated position PER MATCHING MAPPING with no dedupe, and the compiler's hierarchical spans contain multiple same-delta exact spans covering the same offset — the feature worker then calls the plugin once per yield and flat-merges identical sets.
- Fix at the mapping layer: `spansToMappings` now merges exact spans per translation delta into disjoint intervals (overlapping/adjacent same-delta spans are identical translations — multiple copies add zero information and only cause duplicate feature calls). Benefits all position features, not just highlights. Kept a `firstGeneratedPosition` gate in the wrapper for the distinct-offset multiplexing case. Dogfood over imba.io unchanged (212/51 files) — no mapping regression.
- E10 probe: file-rename edits work cross-file out of the box, but TS rewrites specifiers with the full file name (`'./util'` → `'./helpers.imba'`). Wrapper strips `(.web).imba` endings — extensionless resolves everywhere in the project (resolveHiddenExtensions) and matches imba idiom.
- test/m3-highlights-filerename.test.ts (4 tests). Suite at 95.

### 2026-06-12 — E4 references + rename: encoding round-trip via mapping hooks
- References already flowed through the mappings (imba↔ts cross-file, probe-verified). Rename nearly did — but a TS file referencing a renamed dashed export would have received the raw imba spelling (`say-hello`), breaking it.
- Fix: Volar's per-mapping `navigation.resolveRenameNewName/resolveRenameEditText` hooks on EXACT_FEATURES — new name encoded (`say-hello` → `sayΞhello`) before TS sees it, edit texts decoded on the way back into imba source. Plain ts/js edits never travel imba mappings, so they keep the encoded name — exactly right.
- **Layering bug found by probe:** the root identity mapping shared EXACT_FEATURES, so the encode hook also fired on the ROOT layer where the monarch plugins run — a style-var rename arrived as `ΞΞgutter`. Root mapping now uses hook-free IDENTITY_FEATURES. Lesson: mapping-data hooks are layer-specific; identity (source→root) and generated (root→ts) mappings must not share data objects that carry transforms.
- Style vars + mixins (which never reach TS): references/prepareRename/rename in imbaTags via symmetric token FAMILIES (`style.property.var`+`style.value.var`, `tag.mixin.name`+`style.selector.mixin.name`), program-wide collection reusing findStyleDeclarations. Token values carry sigils for vars (`--gap`) and are bare for mixins — rename replaces the full token verbatim.
- TS default alias-rename behavior observed (renaming an import usage produces `greet as say-hello` instead of touching the export) — kept; it's how tsserver behaves everywhere.
- test/m3-references-rename.test.ts (6 tests). Suite at 91.

### 2026-06-12 — E9 signature help: the old checker hack is dead weight
- Probed five caret states (after `(`, empty parens, after comma, dashed callee, modifier parens) — ALL map through to TS signature help, because Volar gates it on the `completion` flag and the exact/placeholder mappings already carry it. The old plugin's `checker.getSignatureHelpForType` interception isn't needed at all.
- Event modifiers compile to plain method calls (`e.αthrottle(500)`), so `@click.throttle(|)` gets real TS signature help with active-parameter tracking and jsdoc param docs from the typings, for free.
- Only gap was presentation: `provideSignatureHelp` wrapper in typescriptServices.ts converts encoded callee names (`fancyΞpad` → `fancy-pad`, `αthrottle` → `@throttle`) in signature/parameter labels + docs. Conversion is applied to imba-backed docs ONLY — a ts/js file calling an imba export typed the encoded name itself and must see it. Parameter labels stay substrings of the signature label (uniform conversion); tuple-offset labels guarded against the length-changing Γ/Ω case.
- `char$` in a probed label is the compiler's reserved-word escape (`char` is reserved), not a default-param marker; the old plugin showed it too — left as-is.
- New fixtures sig.imba / sig-ev.imba; test/m3-signature-help.test.ts (6 tests). Suite at 85.

### 2026-06-12 — Plow-through: D3, G3, E3, D5 slice 1, D11, F2 health check
- Six matrix items landed in one stretch (66 tests green): tag attr completions, incremental snapshots, definition preference, style props/modifiers, imba keywords, env health warning.
- **Completion pipeline lesson #3 (the big one):** Volar allows ONE "main" completion list per request — the first plugin returning items wins, and everything else is skipped unless the plugin instance sets `isAdditionalCompletion: true`. This retroactively explains the D4 round's "my items missing" symptom (not a list cap). Consequences encoded: imba-special contexts suppress TS and our main plugin owns the slot; merge-style contributions (keywords) live in a separate ADDITIONAL plugin; and additional plugins only run on the FIRST visited mapping layer (usually the embedded TS doc) — they must be layer-agnostic, translating offsets/ranges through the mapper.
- D5 design resolution: imbacss namespace exports through the per-program-cached checker lookup ARE effectively the static table Sindre wanted — same data, no second source to maintain. Values per property remain (slice 2).
- TagProp added to the TS-suppression mask (element members leaked — 430-item lists).

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
