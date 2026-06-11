# Tags & Components

Imba's component system is built on web components. Tags compile to custom elements extending `HTMLElement`.

## Defining Tags

```imba
tag my-component
	# tag body

tag my-child < my-parent    # inheritance
```

- Must use **kebab-case** names
- Tags are **globally scoped** — never import them
- Extend `HTMLElement` by default (via `Component`)

## Rendering

Define a `render` method with `<self>` as the root:

```imba
tag my-card
	<self>
		<h1> "Title"
		<p> "Content"
		<span> data.label
```

- Children are indented under their parent element
- Text content goes after the tag on the same line: `<h1> "Hello"`
- Dynamic content: `<span> variable` or `<span> "{variable} text"`
- The DOM is memoized — only changed parts update

## Props

```imba
tag user-card
	name = "Anonymous"
	age\number

	<self>
		<h2> name
		<span> "Age: {age}"

# Usage from parent
<user-card name="Ali" age=30>
```

- `name` declares a prop with getter/setter
- `name = default` with a default value
- `declare name` for type-only declaration (no setter generated)

## Data

`data` is a built-in property on all tags:

```imba
tag todo-item
	<self>
		<span> data.title

# Usage
<todo-item data=todo>
```

## Lifecycle Methods

Lifecycle order (from `component.imba` and `connectedCallback`):

| Method | When |
|--------|------|
| `build()` | In constructor, before any props are set |
| `setup()` | First render, after props are set (compiler-generated call) |
| `hydrate()` | Before awaken, only if element was SSR'd (not created by Imba) |
| `awaken()` | Before first mount |
| `mount()` | When attached to the document |
| `visit()` | When re-rendered from parent (calls `commit!`) |
| `rendered()` | After each render cycle |
| `tick()` | On scheduler tick (if scheduled, default calls `commit!`) |
| `unmount()` | When detached from the document |
| `remount()` | When moved in the document (defaults to calling `mount!`) |
| `dehydrate()` | Before element is stringified on server (SSR only) |

```imba
tag my-app
	def build
		# Initialize instance variables
		@items = []

	def mount
		# DOM is available, fetch data
		let res = await global.fetch("/api/items")
		@items = await res.json!

	def unmount
		# Cleanup
```

## State Properties

| Property | Meaning |
|----------|---------|
| `mounted?` | Element is in the document |
| `mounting?` | Element is being mounted |
| `awakened?` | Element has been awakened |
| `rendered?` | Element has been rendered at least once |
| `suspended?` | Rendering is suspended |
| `rendering?` | Currently in a render cycle |
| `scheduled?` | Element is scheduled for updates |
| `hydrated?` | Element has been hydrated |

## Slots

Imba slots are virtual fragment-based (not shadow DOM slots). Default slot:

```imba
tag my-card
	<self>
		<.header> "Card"
		<.body>
			<slot>    # children go here

# Usage
<my-card>
	<p> "This goes into the slot"
```

Named slots:

```imba
tag my-layout
	<self>
		<slot name="header">
		<slot>             # default slot
		<slot name="footer">
```

## Flags (Dynamic CSS Classes)

Toggle CSS classes based on conditions with `.className=expr`:

```imba
<div .active=isActive .hidden=!visible>
<li .done=todo.done>
```

Combine with CSS class selectors:

```imba
tag todo-item
	css .done td:line-through c:gray5

	<self .done=data.done>
		<span> data.title
```

The `flags` API for programmatic control:

```imba
el.flags.add('name')
el.flags.remove('name')
el.flags.toggle('name')
el.flags.incr('name')    # reference-counted add
el.flags.decr('name')    # reference-counted remove
```

## Conditional Rendering

```imba
<self>
	if user
		<h1> "Hello {user.name}"
	elif loading
		<spinner>
	else
		<login-form>
```

## List Rendering

```imba
<self>
	<ul> for item in items
		<li> item.name
```

Keyed lists for stable DOM identity across re-renders:

```imba
<ul> for item in items
	<li key=item> item.name
```

**IMPORTANT:** Always use `key=` when the list order can change (sorting, shuffling, filtering, drag-and-drop). Without `key`, Imba reuses DOM elements by index — so if you shuffle the array, the DOM elements stay in place and just get new content patched in. With `key=item` (or `key=item.id`), Imba moves the actual DOM nodes to match the new order, preserving element identity. This is essential for:
- FLIP/morph animations (the element must physically move for `getBoundingClientRect` to change)
- Elements with local state (scroll position, focus, animation state)
- Web components with lifecycle hooks (prevents spurious unmount/remount)

## Bindings

Two-way binding with `bind=`:

```imba
tag my-form
	name = ""
	agree = no

	<self>
		<input bind=name placeholder="Name">
		<input type="checkbox" bind=agree>
		<textarea bind=description>
		<select bind=color>
			<option value="red"> "Red"
			<option value="blue"> "Blue"
```

## Scheduling & Rendering

By default, tags re-render when their parent renders or after event handlers (via `imba.commit!`).

```imba
tag my-timer
	prop count = 0

	# Self-scheduling: re-render independently
	autoschedule = yes

	# Or timed rendering
	autorender = "1fps"       # render once per second
	autorender = "500ms"      # render every 500ms
	autorender = yes          # render on every scheduler tick
```

Manual control:

```imba
el.schedule!      # start self-scheduling
el.unschedule!    # stop
imba.commit!      # trigger a global render pass
```

## Mounting

```imba
tag app-root
	<self>
		<h1> "Hello"

imba.mount <app-root>                  # mounts to document.body
imba.mount <app-root>, document.getElementById('app')   # specific target
```

## Teleport & Global

Render children into a different DOM location:

```imba
<teleport to="body">
	<.modal> "I render in body"
```

`<global>` renders to `document.body` and listens on `window`:

```imba
<global @resize=handleResize>
	<.overlay> "Full-page overlay"
```
