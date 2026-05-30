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
