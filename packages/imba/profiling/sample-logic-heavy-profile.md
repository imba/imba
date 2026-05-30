# sample-logic-heavy.imba Profile

Measured on 2026-05-30 with Node v22.14.0 on darwin/arm64.

Commands:

```sh
node profiling/profile-compile.mjs --file profiling/sample-logic-heavy.imba --runs 120 --warmup 30 --attribution-runs 5 --attribution-warmup 2 --top 18
node profiling/profile-parse-cpu.mjs --file profiling/sample-logic-heavy.imba --runs 1500 --warmup 300 --top 25 --write-profile profiling/sample-logic-heavy-parse.cpuprofile
```

Raw parse CPU profile: `profiling/sample-logic-heavy-parse.cpuprofile`.

## Input / Output

| Metric | Value |
| --- | ---: |
| Source lines | 186 |
| Source bytes | 3,918 |
| Tokens after rewrite | 1,269 |
| JS output bytes | 5,835 |
| CSS output bytes | 0 |
| Diagnostics | 0 |

Top token types:

| Token | Count |
| --- | ---: |
| `IDENTIFIER` | 372 |
| `TERMINATOR` | 143 |
| `.` | 76 |
| `INDENT` | 54 |
| `OUTDENT` | 54 |
| `CALL_START` | 49 |
| `CALL_END` | 49 |
| `NUMBER` | 49 |

## Full Compile Timing

Baseline `compile(code, options)` timing, without instrumentation:

| Runs | Mean | Median | p95 |
| ---: | ---: | ---: | ---: |
| 120 | 3.390 ms | 3.263 ms | 4.638 ms |

Low-overhead phase timing:

| Phase | Mean | Median | p95 | Share |
| --- | ---: | ---: | ---: | ---: |
| `compile.total` | 2.758 ms | 2.661 ms | 3.570 ms | 100.0% |
| `ast.compile.total` | 1.338 ms | 1.281 ms | 1.842 ms | 48.5% |
| `to-js.root.c` | 0.781 ms | 0.751 ms | 1.032 ms | 28.3% |
| `parser.total` | 0.562 ms | 0.524 ms | 0.924 ms | 20.4% |
| `lexer.tokenize.main` | 0.526 ms | 0.502 ms | 0.630 ms | 19.1% |
| `ast.traverse` | 0.464 ms | 0.434 ms | 0.671 ms | 16.8% |
| `rewrite.total` | 0.322 ms | 0.308 ms | 0.408 ms | 11.7% |

## Rewrite Timing

| Rewrite step | Mean | Share |
| --- | ---: | ---: |
| `addImplicitBraces` | 0.128 ms | 4.6% |
| `addImplicitParentheses` | 0.105 ms | 3.8% |
| `addImplicitIndentation` | 0.029 ms | 1.0% |
| `removeMidExpressionNewlines` | 0.020 ms | 0.7% |
| `tagPostfixConditionals` | 0.019 ms | 0.7% |

## Parse CPU Profile

Parse-only run: 1,500 parses after 300 warmups, `1.190 ms/parse`.

Self time by compiler file:

| File | Self time | Share |
| --- | ---: | ---: |
| `src/compiler/lexer.mjs` | 722.537 ms | 40.0% |
| `src/compiler/rewriter.mjs` | 407.127 ms | 22.5% |
| `src/compiler/parser.mjs` | 326.834 ms | 18.1% |
| `src/compiler/nodes.mjs` | 237.043 ms | 13.1% |
| `src/compiler/compiler.mjs` | 62.586 ms | 3.5% |

Top self-time locations:

| Location | Function | Self share |
| --- | --- | ---: |
| `src/compiler/parser.mjs:977` | `parse` | 12.6% |
| `src/compiler/lexer.mjs:1077` | `Lexer.identifierToken` | 9.5% |
| `src/compiler/lexer.mjs:445` | `Lexer.basicContext` | 5.8% |
| `src/compiler/parser.mjs:10` | `performAction` | 5.3% |
| `src/compiler/rewriter.mjs:310` | `scanTokens` | 4.9% |
| `src/compiler/rewriter.mjs:300` | `Rewriter.step` | 4.2% |
| `src/compiler/lexer.mjs:2013` | `Lexer.literalToken` | 4.0% |
| `src/compiler/rewriter.mjs:507` | implicit braces scan callback | 4.0% |

## Findings

This is the best sample for identifier-heavy, expression-heavy parsing. It has no CSS output, and `IDENTIFIER` dominates token count.

The parse-only profile points directly at `Lexer.identifierToken` and `Lexer.basicContext`, so this is the sample to use when testing `ALL_KEYWORDS` lookup changes, lexer membership-map changes, and first-character dispatch ideas.

Full compile is less AST-dominated than the style/tag samples. Parser and lexer are both near 20% in the low-overhead phase timing, so front-end improvements should be easier to see here.

## 2026-05-30 Membership Lookup Cleanup

Compared against the post-`ALL_KEYWORDS` baseline, replacing the remaining simple `idx$(...) >= 0` / array-membership checks in `lexer.mjs` with direct comparisons or precomputed lookup maps produced a small lexer-local improvement, but not a clearly significant full-compile win.

| Metric | Post-keyword baseline | After lookup cleanup |
| --- | ---: | ---: |
| Parse wall time | 1.166 ms/parse over 3,000 runs | 1.145 ms/parse over 5,000 runs |
| `Lexer.identifierToken` sampled self share | 9.0% | 8.1% |
| `Lexer.identifierToken` sampled self time | 0.106 ms/parse | 0.093 ms/parse |
| `lexer.tokenize.main` mean | 0.493 ms | 0.495 ms |
| Full compile phase mean | 2.551 ms | 2.459 ms |

Interpretation: this is worth keeping as cleanup and it does reduce sampled `identifierToken` cost, but the total compile impact is within normal benchmark noise. The next larger logic-heavy target is still `basicContext` dispatch and the common `identifierToken` path.

## 2026-05-30 Basic Context Dispatch

Replacing the fixed recognizer chain in `Lexer.prototype.basicContext` with first-character dispatch produced a clear logic-heavy win. The implementation preserves the old chain for selector subcontext and keeps the important ambiguous fallbacks, including newline-comment handling where `lineToken()` intentionally returns `0` before `commentToken()` consumes the comment.

| Metric | After lookup cleanup | After `basicContext` dispatch |
| --- | ---: | ---: |
| Parse wall time | 1.145 ms/parse over 5,000 runs | 0.979 ms/parse over 5,000 runs |
| Lexer file sampled self share | 40.4% | 32.3% |
| Lexer file sampled self time | 0.464 ms/parse | 0.318 ms/parse |
| `Lexer.basicContext` sampled self time | 0.070 ms/parse | 0.066 ms/parse |
| `Lexer.identifierToken` sampled self time | 0.093 ms/parse | 0.068 ms/parse |
| `lexer.tokenize.main` mean | 0.495 ms | 0.362 ms |
| Full compile phase mean | 2.459 ms | 2.216 ms |

Validation: `node --check src/compiler/lexer.mjs`, the three profiling samples, and a direct compile sweep over 96 files in `test/apps/syntax`, `test/apps/style`, and `test/apps/issues` all passed with zero diagnostics.

## 2026-05-30 Newline Count Cleanup

`Lexer.prototype.moveHead` previously counted line breaks with `str.split("\n").length - 1`, which allocates an array and substrings just to count newlines. It now uses a direct `charCodeAt(i) == 10` scan.

On the actual `moveHead` inputs from this sample, the direct scan was about 4x faster in isolation:

| Counter | Time |
| --- | ---: |
| `split("\n").length - 1` | 1,923.787 ms |
| direct char-code scan | 496.391 ms |

Whole-compiler timing did not move clearly because the sample only had 183 `moveHead` inputs totaling 856 characters. Treat this as an allocation/GC cleanup rather than a measurable logic-heavy wall-time win.
