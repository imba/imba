# Local Profiling Changelog

Local measurements for compiler optimization probes. Entries should name the exact benchmark shape and whether output hashes were checked. Times are noisy; treat small changes as directional unless repeated runs agree.

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
