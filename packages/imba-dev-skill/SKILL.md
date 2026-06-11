---
name: imba-dev
description: How to write Imba code. Use this skill for ANY task involving writing, reading, debugging, or understanding Imba language code — tags, CSS, events, control flow, classes, decorators, or any Imba syntax and patterns. This covers the Imba language itself, NOT the OP framework (use op-dev for that). If the user is writing .imba files, working with tag components, Imba CSS, event handlers, or any Imba language feature, use this skill.
---

# Imba Language Guide

> **Source code.** You can always look at the imba source code (in `node_modules/imba` or the linked imba package) for deeper investigation. The compiler lives in `src/compiler/`, the runtime in `src/imba/`.

Imba is a programming language that compiles to JavaScript. It has a dedicated syntax for building web UIs with tags (components), inline CSS, events, and a memoized DOM renderer. Official docs: https://imba.io/

For OP framework questions, use the `op-dev` skill instead.

## Common Gotchas

These are the mistakes AI assistants make most often with Imba:

| Wrong | Right | Note |
|-------|-------|------|
| `true` / `false` | `yes` / `no` | Idiomatic Imba booleans |
| `?.` | `..` | Optional chaining |
| `${expr}` | `{expr}` | String interpolation in `"double quotes"` |
| `"\tawait SPEC.run({node: yes})"` when generating code text | `'\tawait SPEC.run({node: yes})'` | Double-quoted strings interpolate `{...}`. Use single-quoted strings for generated code containing literal object braces. |
| `func()` | `func!` | No-arg function calls (both work, `!` is idiomatic) |
| `name: string` | `name\string` | Type annotations use `\` |
| spaces | tabs | Always tabs for indentation |
| `console.log` / `L` | `Log('ns')` then `log.info 'msg'` | Use the OP logging system (`op/src/log.imba`), not `L` or raw console calls |
| `instanceof` | `isa` | Also supports string type checks and `Symbol.hasInstance` |
| `typeof val == 'string'` | `val isa 'string'` | `isa` accepts plain string type names and compiles to a JS `typeof` comparison |
| `func(a: 1, ...obj)` | `func({a: 1, ...obj})` | Spread needs explicit `{}` |
| `queueMicrotask(fn)` | `global.queueMicrotask(fn)` | Most globals need `global.` prefix (see below) |
| `queueMicrotask(method)` | `queueMicrotask(do method!)` or `@bound def method` | Passing a method as callback loses `this` |
| Treating `#field` inside a class as a comment | `#field` is a private field; comments need a separating space/text comment context | Lines like `#api ||= value` inside class methods are executable private-field access, not commented-out code |
| `document = o.document` inside a class | `doc = o.document` or `self.doc = o.document` | `document` is a registered browser global; bare assignment tries to write `window.document`, which is read-only |
| Calling a later-declared lowercase module helper from a class | Declare a lexical binding before the class or use an imported/uppercase helper | Otherwise implicit-self can compile it as `this.helper()` |
| `css @hover bg:blue6` | `css bg:blue5 @hover:blue6` | Modifiers go inline after the value |
| `css bg:{cond ? 'blue' : 'red'}` | `<el .active=cond>` + `css .active bg:blue` | Use flag toggling for conditional CSS |
| `<el[w:(progress + '%')]>` | `<el[w:{progress}%]>` | Use `{}` interpolation inside bracket CSS shorthand for dynamic CSS values |
| `<.tile-bg$bg>` | `<$bg.tile-bg>` | Element refs/names like `$bg` must come before classes, flags, and inline styles. `<$bg.tile-bg>` defaults to a `div`; use `<some-name$bg.tile-bg>` only when you need a specific tag type. |
| `pos:relative inset:auto` | `pos:relative t:auto r:auto b:auto l:auto` | `inset:*` is an absolute-positioning shorthand in Imba CSS and adds `position:absolute` in addition to `top:.., left:..`. So for fixed or relative, add the `pos:fixed/relative` _after_ `inset` |
| `.h1 .stroke` when `.stroke` is inside a nested component | `.h1 * .stroke` | `*` pierces nested component CSS scope while keeping the parent selector scoped |
| importing a tag | just use it | Tags are globally scoped |
| `@change=do(e)\n\tobj.val = e.target.value` | `bind=obj.val` | Use `bind` for two-way input binding |
| `val ?? do ...block...` | `return existing if existing` then `...block...` | `?? do` creates an anonymous function, does NOT execute the block inline |
| Ending a maybe-find helper with `for`/`while` | Add `return null` after the loop | Loops are expressions; a no-hit path can return the loop result array (`[]` or collected values) instead of `null` |
| `do\n\tawait load!` as a standalone block | Put `await` directly in the containing `def`, or explicitly call a helper | Bare `do` creates a function; it is not an immediately executed async block |
| `get value\n\tawait load!` | Use an async method, or keep the getter synchronous | Imba getters cannot compile to `async get`; lazy imports inside getters need a sync path such as `require` in Node-only code |
| `fn a: 1, {b: 2}` | `fn(a: 1, b: 2)` | Named params do NOT swallow the next line — never wrap named params in `{}` for log/step calls |
| `new Foo(stream, level: 'info')` when `Foo` expects one options object | `new Foo(stream: stream, level: 'info')` | Named params after a positional arg become a second argument; they do NOT merge with the positional value |
| Repeating `if let m = ...` several times in one method | Declare `let m = ...` once, then reassign `m = ...` before each `if m` | Imba treats each `if let` binding as a declaration in the surrounding method scope, so repeated names cause `Cannot redeclare variable` |
| `$node$ const x = ...` | Use runtime `if is_node` check | `$node$` only works at top level with `import`, or as prefix on class `def`/`static def` — not with `const`/`let`/bare assignment |
| `process.env.MY_VAR` in `.env` | Use `OP_`/`VITE_`/`IMBA_` prefix | Vite only loads `.env` vars with these prefixes into `process.env` (see `imba.config.mjs` `envPrefix`) |
| `await import('literal-module')` when you need a runtime dynamic import | Build the specifier in a variable, e.g. `let url = pathToFileURL(path).href; await import(url)` | Imba/esbuild can rewrite literal dynamic imports during compilation/bundling, which is wrong when you need Node to import a generated file at runtime |
| Relying on a narrow `test.include` to limit `imba test` discovery | Add explicit `test.exclude` globs for generated copies, e.g. `**/.claude/worktrees/**` | Imba's Vitest wrapper merges its broad default `**/*.test.*` include with user config, so nested worktrees can be picked up unless excluded |
| Using `ok` in repo tests | Use `assert` for boolean conditions and `eq actual, expected` for equality checks | This repo's Imba test style prefers `assert`/`eq`; do not write new tests with `ok` |
| Shadowing global `assert`/`eq` when testing compiler assertion payloads | Import/install the global test harness, then call unshadowed `assert`/`eq` | The compiler only sets `globalThis.IMBA_ASSERT` / `globalThis.IMBA_EQ` for unshadowed global calls; local/imported definitions are intentionally left alone |
| Returning `self` from `@thenable def init/start` | Return `yes`, `null`, or another non-thenable value after initialization | Resolving a thenable method with the same thenable object can recurse/hang and triggers the "took more than 20000ms" warning |
| Letting legitimate slow `@thenable` setup hit the default watchdog | Use `@thenable(timeout: 2minutes)` or another explicit duration | The decorator's default warning fires after 20s; browser/server startup paths may need a longer timeout |
| `def admin-email?` / `def ready?` | `def is-admin-email` / `def is-ready` (or use `get admin-email?`) | Trailing `?` is reserved for getters/setters; on a `def` it triggers `Only getters/setters should end with ?` warning |
| `def is query` | `def ['is'] query` | Methods named after reserved keywords need bracket syntax |
| `def begin` for lifecycle-style methods | Prefer `def start` | A method named `begin` can confuse Imba tooling/tsc compilation; use `start` for Q/run lifecycle methods |
| `def exec *params` | `def exec ...params` | Imba rest parameters use `...`, not Imba1-style `*` |
| `next unless condition` in loops | `continue unless condition` | Use JavaScript-style `continue`; `next` can compile as an unresolved identifier in Imba2 |
| `static def call` when you need `Class.call(...)` | Define an own property with `Object.defineProperty(Class,'call',{value: fn, configurable: yes, writable: yes})` | Class constructors inherit `Function.prototype.call`; an Imba static `call` method may not become the public constructor `call` API |
| Assuming `static let` inside an instance method is shared across all instances | Treat method/getter-local `static let` as per-instance storage | In Imba, static variables declared inside instance methods and instance getters are unique to that specific instance |
| `return if visited =? yes` when you need a once-only side effect | `if visited =? yes` then run the side effect inside the block | `=?` is set-if-changed and returns truthy when it changed; it is not an equality check |
| `/=\s*/` in a regex literal | `/\=\s*/` | Escape literal `=` in Imba regex literals; otherwise the parser can report a confusing unmatched outdent later in the file |
| Returning different `<self>` roots from branches in `render` | Render one `<self>` root and branch inside it | A tag render should not have multiple top-level `<self>` surfaces; use conditional flags/content inside the single root |
| Repetitive guard ladders for simple optional values | `if let body = value..trim!` | Prefer concise Imba optional chaining/binding inside trusted typed code; reserve extra `isa`/`continue` checks for real untrusted boundaries |
| `` Q.node(response: r)`...` `` (tagged template directly on a call result) | `let fn = Q.node(response: r)` then `` fn`...` `` | Tagged templates can only follow identifiers/member access, not call expressions — fails with a confusing `Unexpected 'STRING_START'` at end of file |
| `key in obj` expecting JS `in` semantics | `Reflect.has(obj, key)` | Imba `in` compiles to `has$(...)` collection membership (array includes etc.) — it does NOT walk prototype chains or check object properties like JS `in` |

| `style="bg:red"` or `style="background:..."` | `[bg:red]` or `css bg:red` | Never use raw `style` attributes — use Imba's `[...]` inline syntax or `css` blocks |
| `css .on:l:16px` | `css x:0px .on:16px` | Can't set a different PROPERTY in a class modifier — modifiers change the VALUE of the same property. |
| `css > div x:0px .on:16px` (parent has `.on`) | `css > div x:0px ..on:16px` | `.on:` checks the element ITSELF for the class. `..on:` checks ANCESTORS. Use `..` when the flag is on a parent. Similarly `&.on:` explicitly matches the element itself |


### Predicate Names and Trailing `?`

Trailing `?` is not a general boolean-method convention in Imba. Only accessor declarations should end with `?`:

```imba
get media-emphasis?
	# property-style predicate, no args

set media-emphasis? value
	# setter for that property
```

Regular methods, including predicates that take arguments or a `block`, must not end with `?`:

```imba
def has-media-emphasis block
	# ok

def media-emphasis? block
	# warns: Only getters/setters should end with ?
```

For predicate helpers, prefer names like `is-ready`, `has-media-emphasis`, or `should-render-media`; use `get something?` only when the API is property-like and needs no parameters.

## Implicit Self & Global Identifiers

Imba uses **implicit self** for lowercase identifiers inside classes/tags. A bare `someFunc(x)` compiles to `this.someFunc(x)`, not a global call. Only a specific set of identifiers are pre-registered as globals:

`window`, `document`, `exports`, `console`, `process`, `parseInt`, `parseFloat`, `setTimeout`, `setInterval`, `setImmediate`, `clearTimeout`, `clearInterval`, `clearImmediate`, `globalThis`, `isNaN`, `isFinite`, `__dirname`, `__filename`, `__realname`, `__pure__`

**For anything else** (e.g., `queueMicrotask`, `fetch`, `structuredClone`, `crypto`, `URL`, `Blob`, `AbortController`, `performance`), use `global.` prefix:
```imba
global.queueMicrotask(do reflow!)
let resp = await global.fetch(url)
let id = global.crypto.randomUUID!
```

**Passing methods as callbacks**: Like in JS, passing a method reference to a callback (`setTimeout(method)`) loses `this`. Either wrap in `do`: `setTimeout(do method!)`, or use the `@bound` decorator on the method definition.

## Language Basics

### Booleans
`yes` and `no` instead of `true` and `false`. Both compile to JS true/false. `true`/`false` work but are non-idiomatic.

### Strings
- Single-quoted: `'no interpolation'`
- Double-quoted: `"with {expr} interpolation"`
- Triple single: `'''raw multiline, no interpolation'''`
- Triple double: `"""multiline with interpolation, use \{ and \} to escape braces"""`
- Tagged templates use backticks and `{expr}` interpolation; the tag receives `first, ...rest`, where `first` is the string-parts array and `rest` holds the rich interpolated values.

### Optional Chaining
`..` instead of `?.`: `obj..prop..method!`

### Operators
- `==` compiles to JS `==` (loose equality) — passes through directly
- `!=` compiles to JS `!=` (loose inequality) — passes through directly
- `===` and `!==` exist and compile directly to JS strict equality
- `is` compiles to `is$(a, b)` helper: `a === b || b?.[matcher]?.(a)` — strict equality plus custom matcher protocol. NOT the same as `==`
- `isnt` compiles to `!is$(a, b)` — NOT the same as `!=`
- `isa` for `instanceof` (plus string type checks and `Symbol.hasInstance`): `item isa Array`
- `!isa` for negated: `item !isa Array`

### Functions
```imba
def greet name
	"Hello {name}"

# Anonymous (inline or block)
let fn = do(x) x * 2

# Ampersand placeholder places a following block in a non-final argument slot
setTimeout(&, 500) do
	refresh!

# No-arg calls
save!          # same as save()

# Implicit return (last expression)
def double x
	x * 2

# Async (automatic when body uses await)
def fetch-data
	let res = await global.fetch("/api")
	await res.json!
```

### Type Annotations
```imba
let count\number = 0
def greet name\string
	"Hello {name}"
def get-count\number
	count
```

### Destructuring
Same as JS: `let {a, b} = obj`, `let [x, y] = arr`

### Named Parameters
Named params implicitly create an object:
```imba
func(a: 1, b: 2)    # same as func({a: 1, b: 2})
```

### Import / Export
Standard ES modules: `import X from 'y'`, `export def`, `export class`, `export default`.

Import file contents as string: `import text from './file.md?text'`

### Comments
`# single line` and `### multi-line block ###`

### Getters, Setters, Private
```imba
class Foo
	#count = 0          # private field
	get count
		#count
	set count value
		#count = value
```

## Control Flow

### Conditionals
```imba
if condition
	doA!
elif other
	doB!
else
	doC!

# unless = negated if
unless valid
	return

# Postfix
return if invalid
show! unless hidden
```

### Ternary
`condition ? valueA : valueB`

### Loops
```imba
for item in array
	process(item)

for item, index in array
	L index, item

for own key, value of object    # own properties only (NOTE: opposite of JS — in=arrays, of=objects)
	L key, value

while condition
	step!

```

`for` is an expression — it returns an array:
```imba
let doubled = for num in [1,2,3]
	num * 2
```

### Conditional Assignment
`=?` only assigns if value changed, returns whether it changed:
```imba
if hidden =? yes
	animate!
```

### Nullish Coalescing
`??`, `??=`, `||=`, `&&=` — same as JS.

### Rescue (inline try/catch)
`rescue expr` wraps the right-hand expression in a try/catch and returns the thrown error instead of the result if it throws:

```imba
let res = rescue risky-call!
if res isa Error
	# handle/assert the failure
```

Compiles to `(()=>{ try { return expr } catch(e) { return e } })()`. Idiomatic for tests asserting that something throws (`let err = rescue tree.add({as: Bad})` then `assert err isa Error`) and for tolerating expected failures without a `try` block. Note the success value and the error share one variable — only use it where `isa Error` (or similar) can distinguish them.

### Template Control Flow
Inside `<self>`, use `if` and `for` directly:
```imba
<self>
	if showHeader
		<header> "Hello"
	for item in items
		<div> item.name
```

## Classes

```imba
class Animal
	name
	sound = "..."

	def speak
		L "{name} says {sound}"

class Dog < Animal             # inheritance with <
	sound = "Woof"

global class MyService         # global = no import needed

extend class Dog               # reopen/extend existing class (no <)
	def fetch
		L "{name} fetches!"
```

**`extend class` / `extend tag` limitations:**
- You cannot override `static def` methods via `extend class`. The original static method will always be called. If you need to run init logic from an addon/extension, put it in a `static def init` on your own class instead.
- You **cannot declare plain fields with default values** in `extend class` or `extend tag`. Declarations like `field = value` or `#field = value` will not work. OP field declarations (`field @string`, `field @int`, etc.) ARE allowed. For plain fields, initialize them lazily in a method instead (e.g., `#field ??= new Set` in the method that uses it).

### Static Members
```imba
class Config
	static version = "1.0"
	static def create
		new self
```

### Mixins
`isa MixinName` in a class body applies a mixin (framework pattern):
```imba
tag my-app
	isa SomeMixin
```

### Key Decorators
- `@lazy` — lazy evaluation, computed once on first access
- `@bound` — auto-bind method to instance
- `@thenable` — makes a method produce a thenable (awaitable) object
- `@computed` — memoized reactive getter
- `@observable` — reactive property
- `@autorun` — auto-running reaction

### Declare
`declare def method` — type-only declaration, no implementation generated.

## Deeper Topics

- [Philosophy & Idioms](philosophy-and-idioms.md) — Native Imba patterns, ownership, state, CSS, and JS interop habits
- [Tags & Components](tags-and-components.md) — Component system, lifecycle, props, slots, flags, rendering
- [CSS System](css-system.md) — Property shorthands, colors, modifiers, breakpoints
- [Events](events.md) — Event handlers, modifiers, touch/intersect/resize/hotkey
- [Interop & Runtime](interop-and-runtime.md) — Scheduler, reactivity, storage, router, conditional compilation

## External Docs

- Official documentation: https://imba.io/
- GitHub: https://github.com/imba/imba
