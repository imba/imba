# imba-language-core

Volar [LanguagePlugin](https://volarjs.dev) for Imba — the foundation of the next-generation Imba tooling track (the existing `typescript-imba-plugin` keeps shipping unchanged while this matures).

Each `.imba` file becomes a virtual TypeScript document: the imba compiler's `tsc` target produces `{js, locs, diagnostics}`, and `locs.spans` ([generatedStart, generatedEnd, sourceStart, sourceEnd] quadruples) convert to Volar `CodeMapping`s ([src/mappings.ts](src/mappings.ts)). Volar then handles all coordinate translation for diagnostics, hover, navigation, rename, and completions — both in the language server and in tsserver plugin mode.

Exact-length spans (identifiers, literals) are emitted before container spans so precise matches win; container spans act as fallbacks for diagnostic ranges. `CONTAINER_FEATURES.verification.shouldReport` is the designated future home of the diagnostic suppression rules from `typescript-imba-plugin/src/diagnostics.imba`.

## Status (M0 spike — proven)

- ✅ Bidirectional offset mapping round-trips precisely (`test/m0.test.ts`)
- ✅ TS diagnostics on `.imba` files reported in imba coordinates
- ✅ `.ts` files importing `./file.imba` resolve and type-check across the boundary
- ⏳ Extensionless imports (`./file` → `file.imba`) — needs the `moduleSuffixes` strategy, M1
- ⏳ Real imba typings (`imba.d.ts`) wired into projects — M1
- ⏳ Worker-thread compilation + content-hash cache — M1
- ⏳ Monarch-driven imba completions/semantic tokens (styles, tags, events) — M2

Run tests: `npx vitest run` in this directory.
