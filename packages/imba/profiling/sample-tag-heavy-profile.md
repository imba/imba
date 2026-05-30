# sample-tag-heavy.imba Profile

Measured on 2026-05-30 with Node v22.14.0 on darwin/arm64.

Commands:

```sh
node profiling/profile-compile.mjs --file profiling/sample-tag-heavy.imba --runs 120 --warmup 30 --attribution-runs 5 --attribution-warmup 2 --top 18
node profiling/profile-parse-cpu.mjs --file profiling/sample-tag-heavy.imba --runs 1500 --warmup 300 --top 25 --write-profile profiling/sample-tag-heavy-parse.cpuprofile
```

Raw parse CPU profile: `profiling/sample-tag-heavy-parse.cpuprofile`.

## Input / Output

| Metric | Value |
| --- | ---: |
| Source lines | 142 |
| Source bytes | 3,460 |
| Tokens after rewrite | 1,369 |
| JS output bytes | 16,094 |
| CSS output bytes | 476 |
| Diagnostics | 0 |

Top token types:

| Token | Count |
| --- | ---: |
| `CALL_START` | 142 |
| `CALL_END` | 142 |
| `TERMINATOR` | 137 |
| `TAG_TYPE` | 123 |
| `TAG_START` | 122 |
| `TAG_END` | 122 |
| `STRING` | 102 |
| `TAG_LITERAL` | 76 |

## Full Compile Timing

Baseline `compile(code, options)` timing, without instrumentation:

| Runs | Mean | Median | p95 |
| ---: | ---: | ---: | ---: |
| 120 | 4.197 ms | 3.996 ms | 5.643 ms |

Low-overhead phase timing:

| Phase | Mean | Median | p95 | Share |
| --- | ---: | ---: | ---: | ---: |
| `compile.total` | 3.215 ms | 3.213 ms | 3.762 ms | 100.0% |
| `ast.compile.total` | 2.043 ms | 2.036 ms | 2.472 ms | 63.6% |
| `to-js.root.c` | 1.294 ms | 1.241 ms | 1.673 ms | 40.3% |
| `ast.traverse` | 0.706 ms | 0.696 ms | 0.878 ms | 21.9% |
| `rewrite.total` | 0.417 ms | 0.411 ms | 0.461 ms | 13.0% |
| `parser.total` | 0.383 ms | 0.380 ms | 0.490 ms | 11.9% |
| `lexer.tokenize.main` | 0.362 ms | 0.332 ms | 0.684 ms | 11.3% |

## Rewrite Timing

| Rewrite step | Mean | Share |
| --- | ---: | ---: |
| `addImplicitParentheses` | 0.211 ms | 6.6% |
| `addImplicitBraces` | 0.101 ms | 3.1% |
| `closeOpenTags` | 0.035 ms | 1.1% |
| `addImplicitIndentation` | 0.026 ms | 0.8% |
| `removeMidExpressionNewlines` | 0.016 ms | 0.5% |

## Parse CPU Profile

Parse-only run: 1,500 parses after 300 warmups, `1.037 ms/parse`.

Self time by compiler file:

| File | Self time | Share |
| --- | ---: | ---: |
| `src/compiler/rewriter.mjs` | 567.786 ms | 36.1% |
| `src/compiler/lexer.mjs` | 452.913 ms | 28.8% |
| `src/compiler/parser.mjs` | 240.590 ms | 15.3% |
| `src/compiler/nodes.mjs` | 189.917 ms | 12.1% |
| `src/compiler/compiler.mjs` | 63.085 ms | 4.0% |

Top self-time locations:

| Location | Function | Self share |
| --- | --- | ---: |
| `src/compiler/parser.mjs:977` | `parse` | 11.8% |
| `src/compiler/rewriter.mjs:300` | `Rewriter.step` | 11.4% |
| `src/compiler/rewriter.mjs:732` | `addImplicitParentheses` | 7.6% |
| `src/compiler/rewriter.mjs:310` | `scanTokens` | 4.9% |
| `src/compiler/rewriter.mjs:507` | implicit braces scan callback | 3.6% |
| `src/compiler/parser.mjs:10` | `performAction` | 3.5% |
| `src/compiler/lexer.mjs:1664` | `Lexer.lineToken` | 3.1% |
| `src/compiler/lexer.mjs:873` | `Lexer.tagToken` | 3.0% |

## Findings

This sample is the clearest rewriter stress case. Parse-only self time is led by `src/compiler/rewriter.mjs`, and full compile phase timing shows rewrite at 13.0%, higher than the style sample.

`addImplicitParentheses` is the biggest rewrite target here, followed by `addImplicitBraces`. This sample should be useful for checking the payoff from closer-index caching, scan consolidation, and token-type lookup changes.

Full compile is still mostly AST compilation. Unlike the style sample, JS generation is larger than traversal; the attribution run is dominated by `Tag` codegen and `TagBody` traversal, which is expected from 122 tag starts/ends.

## 2026-05-30 Rewriter Closer / Scan Cleanup

`addImplicitBraces` / `addImplicitParentheses` now use cached closer positions for style/tag skips when the lexer-provided `_closerIndex` still matches the token array. The same pass also replaced singleton no-rewrite array checks with a direct `STYLE_START` comparison and changed the braces balanced stack from `unshift` / `shift` to `push` / `pop`.

| Metric | Initial profile | After rewriter cleanup |
| --- | ---: | ---: |
| `rewrite.total` mean | 0.417 ms | 0.395 ms |
| `addImplicitBraces` mean | 0.101 ms | 0.088 ms |
| `addImplicitParentheses` mean | 0.211 ms | 0.204 ms |

Interpretation: tag-heavy remains the clearest rewriter stress sample. The cleanup is measurable but microscopic; `addImplicitParentheses` and `detectEnd` scan behavior are still the next interesting places to look.
