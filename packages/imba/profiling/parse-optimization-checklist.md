# Parse Optimization Checklist

Use this as a working checklist for parse/front-end performance work. Mark items as checked once they have been investigated, optimized where useful, and verified with the profiling scripts.

Baseline references:

```sh
node profiling/profile-parse-cpu.mjs --runs 1500 --warmup 300 --top 35
node profiling/profile-compile.mjs --runs 120 --warmup 30 --attribution-runs 5 --attribution-warmup 2 --top 25
```

## Lexer

- [x] Replace linear keyword checks such as `ALL_KEYWORDS.indexOf(id)` in `src/compiler/lexer.mjs` with a precomputed lookup map/set. Checked on 2026-05-30 against `sample-logic-heavy.imba`; `identifierToken` sampled self time improved, but full parse/compile timing did not change significantly.
- [x] Audit other lexer membership checks using `idx$(...) >= 0`, especially repeated checks in `isKeyword` and `identifierToken`. Checked on 2026-05-30 against `sample-logic-heavy.imba`; removed `idx$` from `lexer.mjs` and replaced simple membership checks with direct comparisons or precomputed lookup maps. This lowered sampled `identifierToken` self time again, with only a small/noisy full compile change.
- [x] Profile `Lexer.prototype.basicContext`; consider a first-character dispatch table so every source position does not try the full recognizer chain. Checked on 2026-05-30 against `sample-logic-heavy.imba`; first-character dispatch reduced parse wall time from ~1.145 ms/parse to ~0.979 ms/parse and `lexer.tokenize.main` from ~0.495 ms to ~0.362 ms. A later newline-direct probe that moved `prev.newLine` marking from `whitespaceToken()` into `lineToken()` kept sample output stable but was rejected on the full Lets smoke run (median -4.1%, mean dominated by a large negative outlier), so the existing newline path was kept.
- [x] Profile `Lexer.prototype.identifierToken`; split the common identifier path from rarer decorator, argvar, env flag, symbol, CSS mixin, and special keyword handling. Checked on 2026-05-30 against `sample-logic-heavy.imba`; short-circuited property-access identifiers and non-keyword ordinary identifiers, reducing `isKeyword()` calls from 367 to 103 and `lexer.tokenize.main` from ~0.363 ms to ~0.318 ms. A later direct regex-match indexing cleanup was rejected after the longer Lets paired run went negative (-1.7% mean, -3.4% median).
- [x] Profile `Lexer.prototype.lexStyleBody`; reduce repeated regex attempts in style-heavy files. Checked on 2026-05-30 against `sample-style-heavy.imba`; replaced the hot `STYLE_PROPERTY.exec(...)` and selector-start regex tests with small scanners/predicates. `lexStyleBody` sampled self time dropped from ~130 ms to ~74 ms over 1500 parse runs, and `lexer.tokenize.main` improved from ~0.372 ms to ~0.313 ms in full compile timing.
- [x] Review `Lexer.prototype.moveHead` / `count(str, "\n")`; avoid scanning whole chunks when the caller only needs line-break counts for known substrings. Checked on 2026-05-30 against `sample-logic-heavy.imba`; replaced `split("\n").length - 1` with a no-allocation char-code scan. Microbench on actual `moveHead` inputs was ~4x faster, while whole-compile timing was effectively unchanged/noisy.
- [x] Guard full-source lexer normalization regexes. Checked on 2026-05-30 against the 210-file Lets corpus; clean files now skip full-string CR and trailing-space replacements unless the last character or source content makes them necessary.
- [x] Test token hidden-class stabilization for rewriter fields. Checked on 2026-05-30 by initializing `scope`, `_closer`, `_closerIndex`, and `fromThen` in `Token`; sample output stayed stable, but the longer Lets paired run was slower (-3.3% mean, -4.7% median), so the extra constructor writes were not kept.

## Rewriter

- [x] Cache token closer indices or store numeric closer positions to avoid repeated `tokens.indexOf(token._closer)` inside style/tag skip paths. Checked on 2026-05-30; lexer now stamps `_closerIndex`, and the rewriter validates it before falling back to `tokens.indexOf`. This is a small style/tag-path cleanup, not a large logic-heavy win.
- [x] Replace singleton `NO_IMPLICIT_BRACES` / `NO_IMPLICIT_PARENS` array checks with direct `STYLE_START` comparisons. Checked on 2026-05-30; these checks run in the hot rewriter scans.
- [x] Replace the `addImplicitBraces` balanced-stack `unshift` / `shift` pair with `push` / `pop` and a cached current pair. Checked on 2026-05-30; this avoids array reindexing in the braces scan. A follow-up attempt to flip the separate indentation-scope stack to `push` / `pop` was rejected after the longer Lets paired run went negative (-2.9% mean, -2.1% median).
- [x] Profile `addImplicitBraces`; look for larger avoidable scans, `splice` churn, and repeated token-type lookups. Checked on 2026-05-30 against `sample-tag-heavy.imba`; replaced repeated local array membership checks and `tokenType`/`T.typ` calls in the hot scan with maps/direct token access. Timings were effectively unchanged/noisy (`addImplicitBraces` stayed around ~0.09 ms), so no larger splice/scan rewrite was kept.
- [x] Profile `addImplicitParentheses`; look for similar skip/caching opportunities, `detectEnd` scan costs, and repeated token-type lookups. Checked on 2026-05-30 against `sample-tag-heavy.imba`; switched small membership checks to maps/direct token access and inlined generated call tokens. `addImplicitParentheses` remained around ~0.20 ms, with most cost still inherent to implicit-call insertion and `detectEnd` scans.
- [x] Consider combining compatible full-token scans in `Rewriter.prototype.all` after correctness tests are in place. Checked on 2026-05-30; the cheap scans are small, and the larger passes mutate token order and depend on previous pass output, so no combined scan was worth the risk in this pass.
- [x] Audit `detectEnd` callers for repeated forward scans over the same token ranges. Checked on 2026-05-30; tag-heavy parse sampling shows `detectEnd` visible but not dominant. Calls are tied to `closeOpenTags`, single-line indentation, postfix conditionals, and implicit-call insertion after token splices, so there was no safe reusable range cache to add without a larger rewriter redesign.

## Parser

- [x] Treat generated parser changes as lower priority until lexer/rewriter wins are exhausted. Checked on 2026-05-30; after lexer/style/rewriter passes, parser totals are still modest in the profiling samples. A later parser reduce-loop probe that cached the production row and replaced repeated `pop()` calls with direct stack/vstack length truncation was rejected on the full Lets corpus (-7.5% mean, -11.2% median in the smoke run), so the generated parser stack loop was kept as-is.
- [x] Profile parser reductions after lexer/rewriter changes; current hot reductions include style/property/tag-heavy grammar paths, but absolute time is relatively low. Checked on 2026-05-30 with `profile-compile.mjs` attribution on logic/style/tag samples; the hottest reductions remain sample-specific (`IfBlock`/`Identifier`, `StyleTerm`/`StyleProperty`, `TagOptions`/`TagTypeName`) and are small compared with traversal/codegen and lexer/rewriter costs.
- [x] Check whether parser `performAction` object/array allocations show up after front-end improvements. Checked on 2026-05-30; parse CPU and compile attribution did not show parser allocation/GC as a new dominant bottleneck, so generated `performAction` allocation work remains lower priority.

## Style Parse / AST Construction

- [x] Cache parsed `StyleProperty` metadata by raw token string to avoid repeated regex replace/split work. Checked on 2026-05-30 against `sample-style-heavy.imba`; cached parsed parts/name/kind/unit metadata while copying `_parts` per instance to avoid shared mutation. `StyleProperty` sampled self time dropped from ~47 ms to ~32 ms over 1500 parse runs after the lexer style scanner change.
- [x] Audit `StyleProperty` constructor regexes and string conversions for fast paths. Checked on 2026-05-30; replaced the constructor's unit/name-start checks and dotted-modifier rewrite with direct scanners, while keeping the split/variable normalization behind the metadata cache.
- [x] Profile style-heavy samples separately from logic-heavy samples so style optimizations do not overfit `sample1.imba`. Checked on 2026-05-30 with `profiling/sample-style-heavy.imba`; style-specific changes were measured separately from the logic-heavy lexer work.

## Verification

- [x] Add/identify a focused parser/lexer test command before changing tokenization or rewrite behavior. Added `node profiling/verify-compile-output.mjs` on 2026-05-30; it imports `src/compiler/compiler.mjs` directly and can snapshot/compare token count, diagnostics, JS output, and CSS output for the three profiling samples.
- [x] Compare parse-only CPU profiles before/after with `profile-parse-cpu.mjs`. Checked on 2026-05-30 for the logic/style/tag profiling samples. Final parse wall times were ~0.980 ms/parse for logic-heavy, ~0.727 ms/parse for style-heavy, and ~0.871 ms/parse for tag-heavy; style-heavy shows the clearest additional win from this pass.
- [x] Compare full compile timings before/after with `profile-compile.mjs`. Checked on 2026-05-30 for the logic/style/tag profiling samples after each notable change. Final phase-probed compile means were ~2.414 ms for logic-heavy, ~2.991 ms for style-heavy, and ~3.101 ms for tag-heavy; full compile remains noisier than the targeted lexer/style timings.
- [x] Verify output stability for `profiling/sample1.imba`: token count, diagnostics, JS output, and CSS output. `profiling/sample1.imba` is not present in this workspace, so the available profiling samples were verified instead with `node profiling/verify-compile-output.mjs --compare /private/tmp/imba-parse-output-baseline.json`; token counts, diagnostics, JS hashes, and CSS hashes matched for logic/style/tag samples.
