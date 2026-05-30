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
- [ ] Profile `Lexer.prototype.basicContext`; consider a first-character dispatch table so every source position does not try the full recognizer chain.
- [ ] Profile `Lexer.prototype.identifierToken`; split the common identifier path from rarer decorator, argvar, env flag, symbol, CSS mixin, and special keyword handling.
- [ ] Profile `Lexer.prototype.lexStyleBody`; reduce repeated regex attempts in style-heavy files.
- [ ] Review `Lexer.prototype.moveHead` / `count(str, "\n")`; avoid scanning whole chunks when the caller only needs line-break counts for known substrings.

## Rewriter

- [ ] Cache token closer indices or store numeric closer positions to avoid repeated `tokens.indexOf(token._closer)` inside style/tag skip paths.
- [ ] Profile `addImplicitBraces`; look for avoidable scans, `splice` churn, and repeated balanced-stack work.
- [ ] Profile `addImplicitParentheses`; look for similar skip/caching opportunities and repeated token-type lookups.
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

- [ ] Add/identify a focused parser/lexer test command before changing tokenization or rewrite behavior.
- [ ] Compare parse-only CPU profiles before/after with `profile-parse-cpu.mjs`.
- [ ] Compare full compile timings before/after with `profile-compile.mjs`.
- [ ] Verify output stability for `profiling/sample1.imba`: token count, diagnostics, JS output, and CSS output.
