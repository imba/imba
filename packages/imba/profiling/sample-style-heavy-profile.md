# sample-style-heavy.imba Profile

Measured on 2026-05-30 with Node v22.14.0 on darwin/arm64.

Commands:

```sh
node profiling/profile-compile.mjs --file profiling/sample-style-heavy.imba --runs 120 --warmup 30 --attribution-runs 5 --attribution-warmup 2 --top 18
node profiling/profile-parse-cpu.mjs --file profiling/sample-style-heavy.imba --runs 1500 --warmup 300 --top 25 --write-profile profiling/sample-style-heavy-parse.cpuprofile
```

Raw parse CPU profile: `profiling/sample-style-heavy-parse.cpuprofile`.

## Input / Output

| Metric | Value |
| --- | ---: |
| Source lines | 242 |
| Source bytes | 3,858 |
| Tokens after rewrite | 1,262 |
| JS output bytes | 23,373 |
| CSS output bytes | 7,478 |
| Diagnostics | 0 |

Top token types:

| Token | Count |
| --- | ---: |
| `TERMINATOR` | 208 |
| `CSSPROP` | 141 |
| `:` | 141 |
| `DIMENSION` | 73 |
| `COLOR` | 61 |
| `STRING` | 56 |
| `INDENT` | 52 |
| `OUTDENT` | 52 |

## Full Compile Timing

Baseline `compile(code, options)` timing, without instrumentation:

| Runs | Mean | Median | p95 |
| ---: | ---: | ---: | ---: |
| 120 | 4.270 ms | 4.192 ms | 5.634 ms |

Low-overhead phase timing:

| Phase | Mean | Median | p95 | Share |
| --- | ---: | ---: | ---: | ---: |
| `compile.total` | 3.479 ms | 3.416 ms | 4.192 ms | 100.0% |
| `ast.compile.total` | 2.351 ms | 2.265 ms | 3.110 ms | 67.6% |
| `ast.traverse` | 1.595 ms | 1.497 ms | 2.189 ms | 45.9% |
| `to-js.root.c` | 0.685 ms | 0.652 ms | 0.895 ms | 19.7% |
| `lexer.tokenize.main` | 0.470 ms | 0.430 ms | 0.941 ms | 13.5% |
| `parser.total` | 0.433 ms | 0.428 ms | 0.549 ms | 12.5% |
| `rewrite.total` | 0.215 ms | 0.213 ms | 0.250 ms | 6.2% |

## Rewrite Timing

| Rewrite step | Mean | Share |
| --- | ---: | ---: |
| `addImplicitParentheses` | 0.062 ms | 1.8% |
| `addImplicitBraces` | 0.045 ms | 1.3% |
| `addImplicitIndentation` | 0.031 ms | 0.9% |
| `closeOpenTags` | 0.024 ms | 0.7% |
| `removeMidExpressionNewlines` | 0.019 ms | 0.5% |

## Parse CPU Profile

Parse-only run: 1,500 parses after 300 warmups, `0.945 ms/parse`.

Self time by compiler file:

| File | Self time | Share |
| --- | ---: | ---: |
| `src/compiler/lexer.mjs` | 614.082 ms | 42.7% |
| `src/compiler/rewriter.mjs` | 259.794 ms | 18.1% |
| `src/compiler/parser.mjs` | 178.457 ms | 12.4% |
| `src/compiler/nodes.mjs` | 149.293 ms | 10.4% |
| `src/compiler/ast/style.mjs` | 120.330 ms | 8.4% |

Top self-time locations:

| Location | Function | Self share |
| --- | --- | ---: |
| `src/compiler/parser.mjs:977` | `parse` | 8.8% |
| `src/compiler/lexer.mjs:785` | `Lexer.lexStyleBody` | 8.7% |
| `src/compiler/rewriter.mjs:300` | `Rewriter.step` | 4.5% |
| `src/compiler/lexer.mjs:1664` | `Lexer.lineToken` | 4.3% |
| `src/compiler/ast/style.mjs:484` | `StyleProperty` | 4.0% |
| `src/compiler/lexer.mjs:2013` | `Lexer.literalToken` | 3.3% |
| `src/compiler/parser.mjs:10` | `performAction` | 3.3% |
| `src/compiler/lexer.mjs:445` | `Lexer.basicContext` | 3.2% |

## Findings

This sample does what it is meant to do: it heavily exercises style lexing and style AST construction. `Lexer.lexStyleBody` and `StyleProperty` are both prominent in parse-only CPU time.

Full compile is dominated by AST traversal, not JS emission. The attribution run ranks `StyleRuleSet`, `StyleBody`, `StyleExpression`, and `StyleDeclaration` very high, so style value/property expansion is the first area to investigate with this sample.

Rewriter cost is present but not dominant here. It is lower than in the tag-heavy and logic-heavy samples because the source spends more time inside style contexts.

## 2026-05-30 Rewriter Closer / Scan Cleanup

`addImplicitBraces` / `addImplicitParentheses` now use cached closer positions for style/tag skips when the lexer-provided `_closerIndex` still matches the token array. The same pass also replaced singleton no-rewrite array checks with a direct `STYLE_START` comparison and changed the braces balanced stack from `unshift` / `shift` to `push` / `pop`.

| Metric | Initial profile | After rewriter cleanup |
| --- | ---: | ---: |
| `rewrite.total` mean | 0.215 ms | 0.202 ms |
| `addImplicitBraces` mean | 0.045 ms | 0.040 ms |
| `addImplicitParentheses` mean | 0.062 ms | 0.060 ms |

Interpretation: this is a small cleanup. Style-heavy compile time is still dominated by style lexing, style AST work, and AST traversal.
