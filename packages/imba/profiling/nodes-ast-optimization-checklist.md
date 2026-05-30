# nodes.mjs / AST Optimization Checklist

Use this as the working checklist for whole-compile AST and codegen profiling. Check an item only after it has been investigated against the current profiles, either optimized or deliberately rejected, and verified with output-stability checks.

Baseline commands:

```sh
node profiling/profile-compile.mjs --file profiling/sample-logic-heavy.imba --runs 120 --warmup 30 --attribution-runs 3 --attribution-warmup 1 --top 8
node profiling/profile-compile.mjs --file profiling/sample-style-heavy.imba --runs 120 --warmup 30 --attribution-runs 3 --attribution-warmup 1 --top 8
node profiling/profile-compile.mjs --file profiling/sample-tag-heavy.imba --runs 120 --warmup 30 --attribution-runs 3 --attribution-warmup 1 --top 8

node profiling/profile-compile-cpu.mjs --file profiling/sample-logic-heavy.imba --runs 350 --warmup 80 --top 20
node profiling/profile-compile-cpu.mjs --file profiling/sample-style-heavy.imba --runs 350 --warmup 80 --top 20
node profiling/profile-compile-cpu.mjs --file profiling/sample-tag-heavy.imba --runs 350 --warmup 80 --top 20
```

Measured on 2026-05-30 with Node v22.14.0 on darwin/arm64.

## Current Whole-Compile Baseline

| Sample | Phase mean | `ast.compile.total` | `ast.traverse` | `to-js.root.c` | CPU profile wall | `nodes.mjs` self |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `sample-logic-heavy.imba` | 2.429 ms | 1.267 ms / 52.1% | 0.416 ms / 17.1% | 0.749 ms / 30.9% | 2.627 ms | 53.2% |
| `sample-style-heavy.imba` | 3.101 ms | 2.169 ms / 69.9% | 1.433 ms / 46.2% | 0.675 ms / 21.8% | 3.691 ms | 44.7% |
| `sample-tag-heavy.imba` | 3.095 ms | 2.077 ms / 67.1% | 0.743 ms / 24.0% | 1.291 ms / 41.7% | 3.350 ms | 58.8% |

Interpretation:

- Logic-heavy compile still has visible parse cost, but `nodes.mjs` is the largest single CPU file and `Block`/method/class codegen dominate AST time.
- Style-heavy compile is traversal dominated. `nodes.mjs` owns the traversal scaffold while `src/compiler/ast/style.mjs` and `src/compiler/styler.mjs` remain important second-order targets.
- Tag-heavy compile is codegen dominated. `Tag.js`, `Block.cpart`, `Node.c`, and root-scope emission are the main AST/codegen path.

## Hotspot Map

| Area | Evidence | Main files / lines |
| --- | --- | --- |
| Root AST compile wrapper | Inclusive `Root.compile` is 48.9-65.7% in CPU profiles. | `src/compiler/nodes.mjs:5300` |
| Generic traversal scaffold | Style-heavy spends 46.2% of phase time in `ast.traverse`; CPU inclusive paths repeatedly pass through `Node.traverse` and `Block.visit`. | `src/compiler/nodes.mjs:1869`, `src/compiler/nodes.mjs:2934` |
| Block codegen | Logic/tag CPU profiles route about 29-38% inclusive time through `Block.cpart`; codegen attribution ranks `node.c.Block` first or second. | `src/compiler/nodes.mjs:3027`, `src/compiler/nodes.mjs:3057` |
| Tag codegen | Tag-heavy self samples are led by `Tag.js`; codegen attribution is dominated by `node.c.Tag` / `node.js.Tag`. | `src/compiler/nodes.mjs:16104` |
| Stack ancestor lookup | Style-heavy self samples repeatedly hit `Stack.up`. | `src/compiler/nodes.mjs:1465` |
| Indentation/comment wrapping | Logic/tag self samples hit `Indentation.wrap`; it chains regex replacements on emitted strings. | `src/compiler/nodes.mjs:943` |
| Scope registration and lookup | Logic-heavy self samples hit `Scope.register`; generated/system vars also show up through `SystemVariable.resolve`. | `src/compiler/nodes.mjs:19323`, `src/compiler/nodes.mjs:19444`, `src/compiler/nodes.mjs:20480` |
| Constructor churn | CPU self samples include `Identifier`, `Terminator`, `ListNode`, `ValueNode`, and `VarOrAccess` constructors. | `src/compiler/nodes.mjs:10406`, `src/compiler/nodes.mjs:2410`, `src/compiler/nodes.mjs:2497`, `src/compiler/nodes.mjs:2183`, `src/compiler/nodes.mjs:9397` |

## Safe / Surgical Investigations

- [x] Profile `Block.visit` without unconditional `this._nodes.slice(0)`. Tested a lazy snapshot / copy-on-write traversal variant on 2026-05-30 against the full Lets corpus; output stayed stable, but the longer paired run was negative, so the current traversal shape was kept.
- [x] Reduce `Stack.up` overhead. Hoisted the no-argument `VarOrAccess` skip path and added a constructor-specialized `Stack.indexOf` path on 2026-05-30. This was the clearest selected-corpus win in this pass.
- [x] Add a fast path to `Indentation.wrap` for the common no-meta/no-comment case. Replaced chained regex indentation with a split/join helper on 2026-05-30 after comparing direct-scan and single-regex variants; synthetic sample output stayed byte-stable.
- [x] Optimize `Block.cpart` and `Block.js` emission. Replaced `SEMICOLON_TEST.test(out)` with a trailing scanner and removed redundant `iter$()` wrappers from hot block/tag array loops on 2026-05-30.
- [x] Look for a `Node.c` fast path for the common no-cache/no-indent/no-braces/no-parentheses case. Added default-method parenthesization and common no-options/no-cache/no-indent/no-sourcemap fast paths on 2026-05-30 while keeping `STACK.push` / `STACK.pop` behavior intact.
- [x] Localize repeated tag metadata in `Tag.js`: cache `this.type()`, `this.isSelf()`, `this.isFragment()`, `this.isDynamicType()`, and `_value` where they are repeatedly used in a single call. Checked on 2026-05-30 with byte-stable output on the three profiling samples and a 20-file Lets app corpus; broader Lets compile sweep covered 210 files with zero diagnostics.
- [x] Measure a static-tag fast path in `Tag.js` for simple non-component tags with no dynamic attributes, no handlers, no key, no slots, and no dynamic children. A broader static-plan rewrite was left alone, but local tag emission fast paths were kept: direct array loops and `join(";\n")` statement assembly for no-control tag output.
- [x] Audit class-name de-duplication in `Tag.js`. The previous `names.filter((item, i) => names.indexOf(item) == i)` path was replaced with order-preserving `Set` de-duplication on 2026-05-30. Output hashes matched the synthetic samples and selected Lets app corpus.
- [x] Investigate `Scope.register` / `Scope.lookup` map costs. Tested `Object.create(null)` var maps with direct property checks on 2026-05-30; sample output stayed stable, but the full Lets paired benchmark was negative/noisy, so the normal object plus `hasOwnProperty` path was kept. Also tested removing the unused lazy `_lookups` allocation, eagerly initializing `_lookups`, and eagerly initializing `_nonlocals`; only `_nonlocals` had a promising short run, and the longer 5-round run flattened to effectively zero, so no scope-shape change was kept.
- [x] Measure `SystemVariable.resolve` string checks. The IC log showed the alias-path `name[0]` digit check going megamorphic, but replacing the first/last digit regex checks with `charCodeAt` was negative on the full Lets paired benchmark, so no change was kept.
- [x] Audit `Root.compile` CSS handling. The worktree now keeps the CSS comment append behind `o.debug` and skips source-marker stripping for normal non-sourcemap compiles. Full 210-file Lets corpus improved by ~15.9% mean against committed `HEAD`; note that the CSS debug-comment behavior is observable.
- [x] Run a V8 optimization/deoptimization trace on the full Lets corpus. `Node.c()` optimizes quickly after the no-options fast path; trace-deopt and `--log-ic` both show megamorphic loads in generic `Node.c` (`_cache`, `shouldParenthesize`, `js`, `_indentation`, `_options`) and traversal/codegen sites. A base-constructor `_cache = null` retest stayed negative on a current-copy paired run: short run was noise (+0.3% mean, +2.1% median), while the longer 5-round run was slower (-1.6% mean, -3.7% median). A `Stack.scope()` active-scope cache targeted the top large-file `_scope` LoadIC and was repaired after a stale sibling-scope verifier failure, but the longer Lets paired run was still slower (-1.8% mean, -2.1% median). A local `tokenTypeAt` replacement in `addImplicitIndentation` targeted deopt noise around `Rewriter.tokenType`, but the longer corpus run rejected it (-3.1% mean, -0.5% median). This remains a larger specialization/design problem rather than a one-slot hidden-class fix.
- [x] Check whether `RootScope.c` creates avoidable temporary `Block` / `LIT` objects on every compile. A direct prelude/temporary-object skip was tested on 2026-05-30 and was negative on the paired Lets benchmark, so the existing object creation was kept.
- [x] Add constructor/allocation counters for AST classes before changing constructors. Collected V8 heap samples over the 210-file Lets corpus on 2026-05-30 with `--heap-prof`; parser reduction scaffolding and generic codegen/traversal allocations outweighed individual AST constructor samples, so constructor slimming was not treated as the next likely 15% lever.
- [x] Extend profiling to `src/compiler/ast/style.mjs` traversal for style-heavy files. `sample-style-heavy.imba` shows style traversal as a real local hotspot (`ast.traverse` around 43% of compile time, with `StyleRuleSet` / `StyleBody` / `StyleDeclaration` dominating visit attribution). A narrow `StyleDeclaration.visit` probe that skipped redundant `traverse()` calls when `_traversed` was already set kept output stable but did not hold on the full Lets corpus (+0.1% mean, -0.8% median over 5 rounds), so style needs a larger traversal-specialization pass rather than another tiny guard.

## Larger Wins / Deeper Changes

- [ ] Split or specialize traversal passes. A single global `STACK`-driven `Node.traverse` is flexible but expensive; specialized passes for declarations, style AST, and tag bodies may reduce repeated ancestor scans. A smaller `TagBody.consume()` in-place-loop probe was rejected on 2026-05-30 even though it removed a `.map()` allocation; the longer corpus run was slower (-6.0% mean), so manual polymorphic child loops need extra care.
- [ ] Consider pass fusion for traversal plus metadata precomputation. For tags, compute stable facts during `visit` so `Tag.js` does less repeated classification work during codegen.
- [ ] Prototype a structured codegen buffer. Recursive string concatenation plus regex post-processing in `Node.c`, `Block.cpart`, `Indentation.wrap`, and tag codegen may benefit from a small output builder that understands delimiters and indentation.
- [ ] Revisit the tag pipeline. Static/dynamic tag classification, class/style aggregation, slot handling, and runtime-call selection are interleaved inside `Tag.js`; a precomputed tag-emission plan could make hot codegen simpler. A smaller temp-var accessor cache (`tvar`/`dvar`/`vvar`/`hvar`/`kvar`/`owncvar`) was rejected on 2026-05-30 because the added lazy fields slowed the corpus (-3.8% mean, -5.5% median). A direct `Tag.js` `_options` specialization also slowed the full Lets corpus consistently (-3.5% mean/median in the 3-round smoke run), so the likely win is fewer tag codegen decisions rather than bypassing individual helper calls.
- [ ] Redesign scope symbol tables. Recursive parent lookup, repeated global registration, variable resolution, and temporary allocation could become flatter and more cacheable with immutable root globals plus per-scope overlays.
- [ ] Slim AST construction from parser reductions. If allocation profiles confirm wrapper-node churn, consider having hot grammar paths emit leaner nodes or delayed wrappers rather than optimizing constructors one by one.
- [ ] Separate CSS/style extraction from root JS generation. `Root.compile` currently mixes CSS stringification, runtime style registration, source-map stripping, and JS generation; splitting phases may expose larger style-heavy wins.
- [ ] Build a production compile corpus. The three synthetic samples are useful probes, but any deeper AST/codegen redesign needs repeated profiles over real apps before claiming production wins.

## Verification Gates

- [ ] For every attempted optimization, collect before/after profiles with both `profile-compile.mjs` and `profile-compile-cpu.mjs` on logic/style/tag samples.
- [ ] Require output stability with `profiling/verify-compile-output.mjs`: create a baseline before the change, then compare token counts, diagnostics, JS hashes, and CSS hashes after the change.
- [ ] Run `node --check` on every edited `.mjs` file.
- [ ] Run a syntax/style/issues compile sweep before committing AST behavior changes.
- [ ] For changes touching tag codegen, run focused tag/style tests or app compiles that exercise handlers, slots, dynamic tags, SVG, styles, HMR, and TypeScript output.
- [ ] Treat sub-5% whole-compile wins as noise unless repeated runs show the same direction and the focused hotspot also moves.
