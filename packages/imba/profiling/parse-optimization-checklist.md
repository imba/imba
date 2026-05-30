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
- [x] Profile `Lexer.prototype.basicContext`; consider a first-character dispatch table so every source position does not try the full recognizer chain. Checked on 2026-05-30 against `sample-logic-heavy.imba`; first-character dispatch reduced parse wall time from ~1.145 ms/parse to ~0.979 ms/parse and `lexer.tokenize.main` from ~0.495 ms to ~0.362 ms.
- [x] Profile `Lexer.prototype.identifierToken`; split the common identifier path from rarer decorator, argvar, env flag, symbol, CSS mixin, and special keyword handling. Checked on 2026-05-30 against `sample-logic-heavy.imba`; short-circuited property-access identifiers and non-keyword ordinary identifiers, reducing `isKeyword()` calls from 367 to 103 and `lexer.tokenize.main` from ~0.363 ms to ~0.318 ms.
- [ ] Profile `Lexer.prototype.lexStyleBody`; reduce repeated regex attempts in style-heavy files.
- [x] Review `Lexer.prototype.moveHead` / `count(str, "\n")`; avoid scanning whole chunks when the caller only needs line-break counts for known substrings. Checked on 2026-05-30 against `sample-logic-heavy.imba`; replaced `split("\n").length - 1` with a no-allocation char-code scan. Microbench on actual `moveHead` inputs was ~4x faster, while whole-compile timing was effectively unchanged/noisy.

## Rewriter

- [x] Cache token closer indices or store numeric closer positions to avoid repeated `tokens.indexOf(token._closer)` inside style/tag skip paths. Checked on 2026-05-30; lexer now stamps `_closerIndex`, and the rewriter validates it before falling back to `tokens.indexOf`. This is a small style/tag-path cleanup, not a large logic-heavy win.
- [x] Replace singleton `NO_IMPLICIT_BRACES` / `NO_IMPLICIT_PARENS` array checks with direct `STYLE_START` comparisons. Checked on 2026-05-30; these checks run in the hot rewriter scans.
- [x] Replace the `addImplicitBraces` balanced-stack `unshift` / `shift` pair with `push` / `pop` and a cached current pair. Checked on 2026-05-30; this avoids array reindexing in the braces scan.
- [ ] Profile `addImplicitBraces`; look for larger avoidable scans, `splice` churn, and repeated token-type lookups.
- [ ] Profile `addImplicitParentheses`; look for similar skip/caching opportunities, `detectEnd` scan costs, and repeated token-type lookups.
- [ ] Consider combining compatible full-token scans in `Rewriter.prototype.all` after correctness tests are in place.
- [ ] Audit `detectEnd` callers for repeated forward scans over the same token ranges.

## Parser

- [ ] Treat generated parser changes as lower priority until lexer/rewriter wins are exhausted.
- [ ] Profile parser reductions after lexer/rewriter changes; current hot reductions include style/property/tag-heavy grammar paths, but absolute time is relatively low.
- [ ] Check whether parser `performAction` object/array allocations show up after front-end improvements.

## Style Parse / AST Construction

- [ ] Cache parsed `StyleProperty` metadata by raw token string to avoid repeated regex replace/split work.
- [ ] Audit `StyleProperty` constructor regexes and string conversions for fast paths.
- [ ] Profile style-heavy samples separately from logic-heavy samples so style optimizations do not overfit `sample1.imba`.

## Verification

- [x] Add/identify a focused parser/lexer test command before changing tokenization or rewrite behavior. Added `node profiling/verify-compile-output.mjs` on 2026-05-30; it imports `src/compiler/compiler.mjs` directly and can snapshot/compare token count, diagnostics, JS output, and CSS output for the three profiling samples.
- [ ] Compare parse-only CPU profiles before/after with `profile-parse-cpu.mjs`.
- [ ] Compare full compile timings before/after with `profile-compile.mjs`.
- [ ] Verify output stability for `profiling/sample1.imba`: token count, diagnostics, JS output, and CSS output.
