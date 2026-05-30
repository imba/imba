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

- [ ] Profile `Block.visit` without unconditional `this._nodes.slice(0)`. The copy preserves traversal snapshot semantics, so first audit which `visit` paths mutate block contents during traversal; then test a direct loop or copy-on-write path.
- [ ] Reduce `Stack.up` overhead. Hoist the default predicate, avoid allocating fallback functions, and consider direct helpers for common constructor searches while preserving `VarOrAccess` skipping semantics.
- [ ] Add a fast path to `Indentation.wrap` for the common no-meta/no-comment case. Replace chained regex indentation with a direct newline scan only if sourcemap/comment output stays byte-for-byte stable.
- [ ] Optimize `Block.cpart` and `Block.js` emission. Investigate a cheaper semicolon check than `SEMICOLON_TEST.test(out)`, cache `delimiter()`, and benchmark array builders versus `+=` on the real samples.
- [ ] Look for a `Node.c` fast path for the common no-cache/no-indent/no-braces/no-parentheses case. Keep `STACK.push` / `STACK.pop` behavior intact unless a broader traversal/codegen redesign proves it unnecessary.
- [ ] Localize repeated tag metadata in `Tag.js`: cache `this.type()`, `this.isSelf()`, `this.isFragment()`, `this.isDynamicType()`, and `_value` where they are repeatedly used in a single call.
- [ ] Measure a static-tag fast path in `Tag.js` for simple non-component tags with no dynamic attributes, no handlers, no key, no slots, and no dynamic children.
- [ ] Audit class-name de-duplication in `Tag.js`. The current `names.filter((item, i) => names.indexOf(item) == i)` is quadratic; verify whether a small manual set/map helps style/tag-heavy samples without changing output order.
- [ ] Investigate `Scope.register` / `Scope.lookup` map costs. Options include `Object.create(null)` var maps, a local `hasOwn` helper, and avoiding repeated `AST.sym` conversion when callers already pass symbols.
- [ ] Measure `SystemVariable.resolve` string checks. The alias path uses regex tests for first/last digit; a char-code check may be a tiny safe cleanup if the sampled hit rate remains visible.
- [ ] Audit `Root.compile` CSS handling. `if (o.debug || true)` always appends CSS as a JS comment for inline styles; changing it may improve output size and strip time, but this is observable behavior and needs production compatibility review.
- [ ] Check whether `RootScope.c` creates avoidable temporary `Block` / `LIT` objects on every compile. This path is visible in root codegen but likely needs careful source-map verification.
- [ ] Add constructor/allocation counters for AST classes before changing constructors. CPU samples show constructor cost, but allocation volume and retained-size data are needed before slimming nodes.
- [ ] Extend profiling to `src/compiler/ast/style.mjs` traversal for style-heavy files. It is not in `nodes.mjs`, but style AST visits are part of the same AST compile budget.

## Larger Wins / Deeper Changes

- [ ] Split or specialize traversal passes. A single global `STACK`-driven `Node.traverse` is flexible but expensive; specialized passes for declarations, style AST, and tag bodies may reduce repeated ancestor scans.
- [ ] Consider pass fusion for traversal plus metadata precomputation. For tags, compute stable facts during `visit` so `Tag.js` does less repeated classification work during codegen.
- [ ] Prototype a structured codegen buffer. Recursive string concatenation plus regex post-processing in `Node.c`, `Block.cpart`, `Indentation.wrap`, and tag codegen may benefit from a small output builder that understands delimiters and indentation.
- [ ] Revisit the tag pipeline. Static/dynamic tag classification, class/style aggregation, slot handling, and runtime-call selection are interleaved inside `Tag.js`; a precomputed tag-emission plan could make hot codegen simpler.
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
