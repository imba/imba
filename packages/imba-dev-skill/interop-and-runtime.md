# Interop & Runtime

How Imba interacts with JavaScript, the scheduler, reactivity, storage, routing, and conditional compilation.

## JavaScript Interop

Imba compiles to standard JavaScript. You can freely import JS/npm modules and export Imba code for JS consumption:

```imba
import express from 'express'
import {debounce} from 'lodash'

export def helper
	42
```

`.imba` files are compiled by the Imba compiler. Mixed Imba/JS projects work without issues.

## Scheduler

Imba batches DOM updates through a scheduler. After event handlers run, `imba.commit!` is called automatically (unless `.passive` or `.silent`), triggering a render pass for all mounted components.

```imba
# Trigger a manual render pass
imba.commit!

# Auto-committing timers (commit after callback runs)
imba.setTimeout(handler, 1000)
imba.setInterval(handler, 5000)
```

If you modify state outside an event handler (e.g., in a raw `setTimeout` or `fetch.then`), call `imba.commit!` to update the DOM:

```imba
def load-data
	let res = await global.fetch("/api/data")
	@data = await res.json!
	imba.commit!    # needed if not inside an event handler
```

## Reactivity

Imba provides decorators for fine-grained reactivity. These must be imported:

```imba
import {observable, computed, autorun} from 'imba'

class Store
	@observable count = 0
	@observable items = []

	@computed get total
		items.reduce((sum, i) => sum + i.price, 0)

# Standalone reaction (imported function, not on imba global)
autorun do
	L "Count changed: {store.count}"
```

| Decorator / Function | Effect |
|-----------|--------|
| `@observable` | Makes a property reactive — changes are tracked |
| `@computed` | Memoized getter, recomputes when dependencies change |
| `@autorun` | Auto-running reaction on a method, re-runs when dependencies change |
| `autorun(fn)` | Standalone reactive function (import from 'imba') |
| `observable(obj)` | Make an entire object reactive (import from 'imba') |

Array, Set, and Map are automatically reactive when observed in a reactive context.

## Storage

Browser storage with reactive proxies. Must be imported:

```imba
import {locals, session} from 'imba'

# localStorage
locals.theme = "dark"
let theme = locals.theme

# sessionStorage
session.token = "abc"

# Namespaced
let prefs = locals('user-prefs')
prefs.fontSize = 14
```

## Router

Imba has a built-in router:

```imba
import {router} from 'imba'

# Current state
router.path          # full path (pathname + query + hash)
router.pathname      # path without query
router.query         # query params (Proxy over searchParams)
router.hash          # hash fragment

# Navigate
router.go("/page")
router.replace("/page")    # no history entry
```

Route-based conditional rendering — the `route` attribute shows/hides elements based on the current route:

```imba
<div>
	<home-page route="/home">       # visible only when route matches
	<about-page route="/about">
	<user-page route="/users/:id">  # dynamic segments with :param
```

Navigation links with `route-to` — adds click handler and toggles `.active` flag:

```imba
<nav>
	<a route-to="/home"> "Home"     # navigates on click, gets .active when matching
	<a route-to="/about"> "About"

css .active fw:bold c:blue6
```

Note: `route` controls visibility (show/hide). `route-to` adds click-to-navigate behavior and `.active` flag. On `<a>` elements, `route-to` also sets the `href` attribute.

### Gotcha: `<a href>` clicks are intercepted regardless of `@click.prevent`

Imba's router installs a **capture-phase** `click` listener on `window` that, for any `<a>` with a same-origin `href`, attaches a one-shot bubble-phase listener that reads the `href` and calls `router.go(href)` — after your own `@click` handlers run.

This means `<a href='/' @click.prevent=my-handler>` **does not** stay on the current page: `my-handler` runs, but the router's subsequent listener sees `href='/'` and navigates there anyway. `.prevent` only suppresses the browser's default navigation, not other JS listeners.

```imba
# Wrong — my-handler navigates to /foo, then the router's listener sees href='/' and navigates back to /
<a href='/' @click.prevent=(imba.router.go '/foo')>

# Right — put the target in href and let the router do the navigation
<a href='/foo'>

# Also fine — no href means no interception
<a @click=(imba.router.go '/foo')>
```

Rule of thumb: if you render an `<a>` for navigation, its `href` IS the navigation target. Don't try to override it from a click handler. See `src/imba/router/index.imba` (`setup` → `onclick` → `onclicklink`) for the source.

## Conditional Compilation

Imba supports compile-time branching with env flags. Dead code is eliminated:

```imba
$web$    # true in browser builds
$node$   # true in server builds

# Conditional imports
$node$ import fs from 'fs'

# Conditional code blocks
if $web$
	document.title = "My App"

if $node$
	let server = createServer!
```

Built-in flags: `$web$` / `$browser$`, `$node$`, `$worker$`, `$webworker$`, `$vite$`, `$hmr$`, `$tsc$`.

**IMPORTANT**: `$node$` guards work on imports, class methods (`$node$ static def ...`), and `if $node$` blocks — but NOT on top-level `def` (module-level functions) or top-level `class` definitions. To make server-only utility functions, define a regular `class` and use `$node$ static def` on each method inside it.

### `static let` — per-instance persistent variables

`static let` inside a method body creates a variable that persists across multiple calls to that method **on the same instance**. It is NOT shared across different instances. Compiles to `statics$(this)` — a per-instance store keyed by the object.

```imba
class Foo
	def bar
		static let counter = 0
		counter++
		# counter persists across calls to bar() on the SAME Foo instance
		# different Foo instances have their own counter
```

Useful for per-instance caches and memoization. NOT suitable for cross-instance coordination — use a shared object (e.g., stored on a common parent) for that.

Note: `$dev$` is NOT a built-in flag — it requires explicit configuration via compiler options or environment variables.

## Logging

`L` is a compiler-special identifier. It compiles to `console.debug(...)` gated by `globalThis.DEBUG_IMBA`:

```imba
L "debug info"
L variable, other
```

When `DEBUG_IMBA` is truthy, `L` calls produce formatted debug output. When falsy, they produce no output.

## The `imba` Global

Properties actually set on `global.imba` (verified from scheduler.imba and mount.imba):

| Method | Purpose |
|--------|---------|
| `imba.mount(tag, target?)` | Mount a tag to the DOM (default: `document.body`) |
| `imba.commit!` | Trigger a render pass |
| `imba.setTimeout(fn, ms)` | Auto-committing timeout |
| `imba.setInterval(fn, ms)` | Auto-committing interval |

These are NOT on the imba global — use imports instead:

```imba
import {router} from 'imba'           # router instance
import {locals, session} from 'imba'  # storage proxies
import {autorun, observable} from 'imba'  # reactivity
```
