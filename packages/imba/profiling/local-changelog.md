# Local Profiling Changelog

Local measurements for compiler optimization probes. Entries should name the exact benchmark shape and whether output hashes were checked. Times are noisy; treat small changes as directional unless repeated runs agree.

## 2026-05-31 Upstream Cut Recommendation

Recommended production-code cut:

- Keep code through `5f8767ff` (`Improve Lets compile throughput`), which measured as the last substantial whole-corpus win: ~15.9% mean / ~15.7% median on the 210-file Lets corpus.
- Keep later profiling notes and harness improvements as local history/documentation.
- Drop later production-code probes unless revalidated, especially the hidden-class initializer changes in `6227d5ae` and `9c59f81c`; their theoretical IC benefit was not tied to a clear full-corpus win.

Rejected follow-up probes after the full-corpus speedup:

- Tag.js direct `_options` specialization: output-stable, but slower on the full Lets smoke run (~-3.5% mean/median).
- Rewriter indentation `tokenTypeAt` replacement: output-stable, but longer full-corpus run was negative (-3.1% mean, -0.5% median).
- Split rewriter scan wrappers: output-stable, but longer full-corpus run was negative (-3.6% mean, -4.3% median).
- Stack active-scope cache: repaired after a stale sibling-scope verifier failure, but longer full-corpus run was still negative (-1.8% mean, -2.1% median).
- Root global registration fast path: output-stable, but full-corpus run was flat/slower (-0.38% mean, -0.16% median).
- Parser reduce-loop truncation: output-stable, but full-corpus smoke run was clearly slower (-7.5% mean, -11.2% median).
- Lexer newline-direct path: output-stable, but smoke run was noisy/negative (median -4.1%, mean dominated by a large negative outlier).
- Token shape and cache-slot broadening probes repeatedly showed that extra constructor writes can cost more than the IC stabilization they promise.

Future work:

- Larger wins are more likely from reducing whole passes or tag/codegen decisions than from one-slot hidden-class tweaks.
- If revisiting V8 traces, tie every candidate to both a CPU hotspot and a repeated deopt/IC site before editing.
- Keep using paired full-corpus runs with alternating order; tiny single-file or single-round wins were not predictive.

## 2026-05-30 Tag.js Local Emission Cleanup

Scope:

- Cached per-call tag facts inside `Tag.js`: `type`, type value, self/fragment/slot/component state, dynamic-tag state.
- Reused cached values through tag emission branches instead of repeatedly calling `this.type()`, `this.isSelf()`, `this.isSlot()`, `this.isDynamicType()`, and `this.isComponent()`.
- Replaced class-name de-duplication from `filter(indexOf)` with order-preserving `Set` de-duplication.

Important context:

- Baselines were taken from the current worktree, which already had a separate uncommitted `Root.compile` debug-CSS change (`if (o.debug || true)` to `if (o.debug)`). That hunk is not part of the Tag.js cleanup.

Synthetic tag-heavy baseline:

| Metric | Before | After |
| --- | ---: | ---: |
| `profile-compile.mjs` baseline mean | 3.334 ms | 3.295 ms |
| `compile.total` phase mean | 2.980 ms | 2.969 ms |
| `ast.compile.total` phase mean | 1.968 ms | 1.926 ms |
| `to-js.root.c` phase mean | 1.248 ms | 1.198 ms |
| `node.c.Tag` attribution mean | 12.479 ms | 11.251 ms |
| `node.js.Tag` attribution mean | 12.443 ms | 11.221 ms |
| `profile-compile-cpu.mjs` wall mean | 3.168 ms | 3.237 ms |
| `nodes.mjs` sampled self share | 59.4% | 57.4% |

Real Lets app corpus:

| Metric | Before | After |
| --- | ---: | ---: |
| Selected corpus size | 20 files | 20 files |
| Compile passes | 300 | 300 |
| Total time | 2973.963 ms | 2964.718 ms |
| Mean per compile | 9.913 ms | 9.882 ms |
| Diagnostics | 0 | 0 |

Verification:

- `node --check src/compiler/nodes.mjs`
- `node profiling/verify-compile-output.mjs --compare /private/tmp/imba-tag-baseline-samples.json`
- `node profiling/verify-compile-output.mjs --file ...20 Lets files... --compare /private/tmp/imba-tag-baseline-letsdev.json`
- One-pass Lets app compile sweep: 210 files, 0 failed, 0 diagnostics.

Read:

- The low-overhead phase profiler and method attribution moved in the intended direction, especially `node.c.Tag` / `node.js.Tag`.
- The sampled CPU wall run was noisy and did not confirm a wall-time win by itself.
- Real-corpus timing moved slightly in the right direction, but the observed whole-compile effect is small.

## 2026-05-30 Lets Full-Corpus Compile Speedup

Scope:

- Added `profiling/benchmark-lets-compile.mjs` to repeatedly compile either the selected 20-file Lets stress corpus or every `.imba` file under the Lets app root.
- Skipped sourcemap marker emission and final JS/CSS marker stripping for normal non-raw, non-sourcemap, non-tsc compiles.
- Replaced `Indentation.wrap`'s chained regex indentation with a split/join helper after benchmarking direct-scan and single-regex variants.
- Replaced `Block.cpart`'s trailing-semicolon regex with a scanner and removed redundant `iter$()` wrappers in hot block/tag loops.
- Specialized `Stack.up()` / `Stack.indexOf()` for common no-arg and constructor lookups.
- Added small tag codegen fast paths: direct array loops in hot tag paths and `join(";\n")` statement assembly for tags without control sentinels.
- Added no-marker fast paths in `SourceMapper.strip/run`.
- Inlined the rewriter's internal pass dispatch and token-scan callback call.
- Added `Node.c()` fast paths for default parenthesization and the common no-options/no-cache/no-indent/no-sourcemap codegen path.
- Guarded lexer source normalization so clean files skip full-string CR/trailing-space regex replacements.
- Cached empty stylesheet parsing results.

Full Lets app corpus:

| Metric | Committed `HEAD` | Current |
| --- | ---: | ---: |
| Files | 210 | 210 |
| Compiles per batch | 1680 | 1680 |
| Mean per compile | 3.828 ms | 3.218 ms |
| Median per compile | 3.790 ms | 3.195 ms |
| Diagnostics | 0 | 0 |

Result:

- Mean improvement: 15.9%.
- Median improvement: 15.7%.
- Output hashes for the synthetic samples stayed byte-stable.
- The 20-file Lets stress corpus changed JS hashes only because skipping marker comments no longer forces redundant parentheses in a few unary expressions, e.g. `!(call())` becomes `!call()`. CSS hashes and diagnostics were stable.

Verification:

- `node --check src/compiler/nodes.mjs`
- `node --check src/compiler/lexer.mjs`
- `node --check src/compiler/sourcemapper.mjs`
- `node --check src/compiler/rewriter.mjs`
- `node --check src/compiler/styler.mjs`
- `node profiling/verify-compile-output.mjs --compare /private/tmp/imba-fast-baseline-samples.json`
- `node profiling/verify-compile-output.mjs --file ...20 Lets files... --compare /private/tmp/imba-fast-baseline-lets-selected.json` (expected JS hash/byte changes from source-marker parenthesization only)
- Baseline: `node profiling/benchmark-lets-compile.mjs --all --runs 8 --warmup 3 --batches 3` in archived committed `HEAD`
- Current: `node profiling/benchmark-lets-compile.mjs --all --runs 8 --warmup 3 --batches 3`
- V8 trace: `node --trace-opt --trace-deopt --trace-file-names profiling/benchmark-lets-compile.mjs --all --runs 2 --warmup 4 --batches 1` optimized `Node.c()`; the remaining deopt signal is mostly `wrong map` / lazy deopts across `c`, `js`, and `visit`, which points to hidden-class polymorphism as the next larger investigation.
- `npm run test` passed 644 tests.
