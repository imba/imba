# Imba Volar tooling — parity plan & working doc

**Goal:** feature parity with `typescript-imba-plugin` + `vscode-imba`'s bridge features, on the Volar architecture, then switch defaults. The old plugin stays untouched and shipping until M4 sign-off.

This is a *living working document*. Any session (human or agent) picking up this track should read **Status & resume pointer** below, do the next unchecked item, update the matrix/log, and commit doc updates together with the code.

---

## Status & resume pointer

- **Current milestone:** M1
- **Next action:** G2 compile cache; then the M1.9 dogfood checkpoint over an imba.io app dir (with A5 strategy writeup)
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
| A5 | Compiler options injection (lib, customConditions `['tsimba','imba']`, RequiredCompilerOptions) | Project.setCompilerOptions patch | per-mode: server → host wrapper; tsserver plugin → document required tsconfig + validate; kit → fixture tsconfig | M1.2 | ⬜ |
| A6 | imba.d.ts global typings into every project | pushed into `compilerOptions.lib` | proven manually (fixture: `globals.d.ts` reference + tsconfig `customConditions: ['imba']` resolves `'imba'` to compiled stdlib source!); automatic injection for arbitrary projects folds into A5 | M1.3 | 🚧 |
| A7 | Virtual jsconfig for config-less projects | createVirtualProjectConfig + virtual file System patch | language server: default project for inferred workspaces | M3.6 | ⬜ |
| A8 | Asset imports (`./icon.svg` etc., ImbaAsset types) | EXTRA_EXTENSIONS in resolveImportPath, `allowArbitraryExtensions` | `allowArbitraryExtensions` + asset `.d.ts`; verify per asset kind | M3.5 | ⬜ |
| A9 | Global `extend class` / global tags across files (Ω dts sidecar) | dts.imba/dtsutil.imba: rewrite compiled dts → `.imba._.d.ts` virtual roots | 🤔 design: `getExtraServiceScripts` per file, or compiler emits `declare global` inline in tsc target (preferred — ask compiler) | M2.6 | 🤔 |
| A10 | Project-local imba compiler (`useImbaFromProject`) | getImbaCompilerForPath + require | resolve `imba/compiler` from project root in compile layer | M3.7 | ⬜ |
| A11 | Multi-root / multiple tsconfig projects | **broken** in old plugin (last-project-wins) | Volar handles per-project natively — add regression test | M3.8 | ⬜ |

### B. Diagnostics

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| B1 | TS diagnostics in imba coordinates | Session.sendDiagnosticsEvent + o2iRange mapping | Volar mapping | M0 | ✅ |
| B2 | Imba compiler parse diagnostics | script.getImbaDiagnostics (save-gated) | `createImbaDiagnosticsPlugin` over the identity-mapped root doc (live, not save-gated) | M1.4 | ✅ |
| B3 | Suppression rules (~25 codes: 2322/2339/2554/6133-patterns…) | diagnostics.imba Rules table + filterDiagnostics | `tsDiagnosticRules.ts` table + `createTypeScriptServices` wrapper (filters only imba-backed docs; plain .ts untouched) | M1.5 | ✅ |
| B4 | Greek-letter cleanup in messages (Ξ Φ Ψ Γ α Ω → imba names) | toImbaString over whole JSON protocol | `conversion.ts` applied per diagnostic message in the wrapper | M1.6 | ✅ |
| B5 | debugLevel≥2 "show suppressed as warnings" | filterDiagnostics | config flag on the wrapper | M3.9 | ⬜ |

### C. Hover / quick info

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| C1 | TS hover at mapped positions | intercept.getQuickInfoAtPosition | volar-service-typescript via mappings; explicit e2e via `test/harness.ts` (full LanguageService over fixtures — reuse for all feature tests) | M1.7 | ✅ |
| C2 | Identifier conversion in hover display | toImbaDisplayParts | post-process hover contents in wrapper | M2.4 | ⬜ |
| C3 | Imba-context hover: style props/values, units, mixins, style vars/colorvars, events, event modifiers, tag names/attrs, meta symbols, MDN links | script.getInfoAt + checker.getSymbolInfo (700+ lines) | monarch-driven hover service plugin; type queries via injected TS languageService | M2.3 | ⬜ |

*C1 is exercised indirectly (mapping round-trips + diagnostics); add an explicit hover e2e test in M1.7.

### D. Completions

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| D1 | Plain-code completions (vars, props, implicit self, globals, classes) | 100% hand-assembled (values/access in completions.imba) | **forward to TS** over virtual code at mapped positions; hand-roll only what TS can't see | M2.1 | ⬜ |
| D2 | Tag names (html, local components, snippets) | tagnames() + checker.getLocalTags | monarch context → service plugin | M2.2 | ⬜ |
| D3 | Tag attrs/props per tag | tagattrs() + isTagAttr filtering | service plugin + injected checker | M2.2 | ⬜ |
| D4 | Tag events + event modifiers | ImbaEvents props + getEventModifiers | service plugin | M2.2 | ⬜ |
| D5 | Style properties (abbr config), values per property, modifiers, selectors | styleprops/stylevalues/stylemods via imbacss symbols | service plugin — **Sindre leans toward serving these OUTSIDE the TS system** (static tables per imba version instead of imbacss symbol queries; old plugin only used TS because it had no other channel). Decide shape at M2.2 spike; static-first unless type-dependent values prove necessary | M2.2 | ⬜ |
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
| E3 | Definition filtering (`__new` removal, prefer .imba over .d.ts, meta suppression) | intercept.getDefinitionAndBoundSpan | wrapper around TS definitions | M2.7 | ⬜ |
| E4 | Find references / rename (TS-backed) | intercepts + conversion | Volar mapping; rename name conversion via `navigation.resolveRenameNewName/EditText` mapping hooks | M3.10 | ⬜ |
| E5 | Document symbols / outline | doc.getOutline (monarch) replacing navtree | service plugin `provideDocumentSymbols` from monarch | M2.8 | ⬜ |
| E6 | Workspace symbols (imba + TS merged, scope config) | getNavigateToItems override | service plugin + forwarded TS results | M3.3 | ⬜ |
| E7 | Folding | old returned `null` (!) | indentation folding from VS Code language config; optional monarch provider later | M2.9 | ⬜ |
| E8 | Document highlights | disabled for imba | leave to TS via mappings; verify quality, disable if noisy | M3.11 | ⬜ |
| E9 | Signature help (incl. event-modifier signatures) | intercept + checker.getSignatureHelpForType hack | TS-backed free via mapping; event-modifier case in service plugin | M3.12 | ⬜ |
| E10 | File-rename import edits | getEditsForFileRename + conversion | expect free via Volar; add test | M3.13 | ⬜ |

### F. Editor surface (vscode + protocol)

| # | Feature | Old implementation | New approach | Milestone | Status |
|---|---|---|---|---|---|
| F1 | Semantic tokens from monarch | getSemanticTokens via encodedSemanticClassifications intercept | service plugin `provideDocumentSemanticTokens` from monarch tokens | M2.10 | ⬜ |
| F2 | Status bar (compile spinner etc.) | node-ipc bridge | LSP custom notifications (typed) in preview extension | M2.12 | ⬜ |
| F3 | Config (suggest.*, workspaceSymbols.scope, debugLevel, useImbaFromProject) | configurePlugin + ipc | LSP configuration; port schema to preview extension | M3.9 | ⬜ |
| F4 | Preview VS Code extension (`imba-next` style) | n/a | LSP client + `typescriptServerPlugins` entry for imba-typescript-plugin; zero changes to vscode-imba | M2.11 | ⬜ |
| F5 | Selection tracking / save notifications | ipc onDidChangeTextEditorSelection/didSave | not needed (LSP didSave; live parse diagnostics replace save-gating) | — | ❌ |
| F6 | Standalone tsserver wrapper (typescript-imba-service) | separate package | superseded by imba-language-server (any LSP editor) | — | ❌ |
| F7 | Protocol-wide greek-letter rewrite of every message | Session.send JSON round-trip | ❌ dropped by design — conversion happens at feature boundaries only (B4, C2, D-resolve) | — | ❌ |

### G. Performance & robustness (new-architecture obligations)

| # | Item | Notes | Milestone | Status |
|---|---|---|---|---|
| G1 | Worker-thread compilation | compiler is CJS-self-contained; results structured-cloneable. Sync fallback for tsserver-plugin mode (must stay sync there — Volar plugin mode is synchronous) | M1.8 | ⬜ |
| G2 | Content-hash compile cache (disk, `node_modules/.cache/imba-tooling`) | deterministic compile output; fixes cold-open | M1.8 | ⬜ |
| G3 | Incremental snapshot updates (`getChangeRange` via fast-diff between generated outputs) | preserves TS incremental parsing; old plugin's diff.imba trick, done right | M2.13 | ⬜ |
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
