# Philosophy & Idioms

Imba is best at compact, stateful product UI where markup, styling, behavior, and local state can live close together. Do not write JavaScript-shaped code and translate the syntax afterward. Let Imba's tags, CSS blocks, flags, scheduler, and object model carry the design.

## Native Shape

- Treat a tag as an object with a lifecycle, not as a render function plus loose helpers. Put behavior that belongs to the surface on the tag as methods/getters.
- Render should describe the current state. Prefer flags, bindings, slots, keyed lists, and nested CSS over imperative DOM mutation.
- Keep styling near the surface it styles. Use Imba CSS shorthands, nested selectors, custom units, and modifier states instead of raw `style` strings or scattered class assembly.
- Use the language affordances: `yes`/`no`, `..`, `isa`, `is`, postfix guards, `bind`, `key=`, block callbacks, and `&` placeholders.
- Prefer named methods for non-trivial event handlers. Inline event expressions are good for simple forwarding; complex inline `do` blocks make templates hard to scan.

## Ownership

Code should usually live on the thing that owns the concept:

- A visual surface owns its render, styling, local interaction state, and event handlers.
- A model owns operations and derived facts about that model.
- A parent coordinates children when it is genuinely responsible for the workflow.
- A small context object is useful when several objects participate in one cross-cutting operation.

Avoid large helper piles that inspect everything from the outside. Extract a function or module when it is a real reusable operation or boundary, not just to imitate React-style separation.

## State And Derived Data

- Store the minimum durable state; derive the rest close to where it is used.
- Use getters for cheap scalar projections and readable aliases.
- When derived state becomes structural or expensive, give it a clear owner instead of scattering recomputation through templates.
- Do not put fresh object/array allocation in hot getters if an owned object, cached value, or framework-level memo in the local codebase would model the state better.
- For lists whose order can change, use `key=` so Imba moves DOM nodes instead of patching by index.

## CSS As State

Imba CSS is part of the component model. Prefer stateful CSS over manual style mutation:

```imba
tag todo-row
	css .done td:line-through c:gray5

	<self .done=data.done>
		<span> data.title
```

Use flags for state, nested selectors for structure, and owner modifiers when needed:

```imba
css .row
	@.active c:blue       # this row is active
	@@.compact gap:1      # component/root owner is compact
	@@hover bg:gray1      # component/root owner is hovered
```

## Events And Effects

- Keep templates declarative. For complex behavior, call a named method such as `@click=select-item`.
- Use `bind=` for normal form inputs instead of manual change handlers.
- Use event modifiers, hotkey elements, and lifecycle methods before reaching for raw `addEventListener`.
- Put browser/third-party imperative APIs at clear edges such as `mount`, `unmount`, or a small adapter method.
- When passing callbacks to APIs where the callback is not the last argument, use the ampersand placeholder:

```imba
setTimeout(&, 500) do
	refresh!
```

## Imba Idioms Over JS Habits

| JS-shaped habit | Imba idiom |
|-----------------|------------|
| `typeof val == 'string'` | `val isa 'string'` |
| `el.classList.toggle('active', active)` | `<self .active=active>` |
| `input.addEventListener('change', ...)` | `<input bind=value>` |
| Conditional style strings | flags plus `css` modifiers |
| Manual DOM updates after state changes | update state and let render/commit patch DOM |
| External helper scans over another object's internals | ask the owning object/collection for what you need, or add a method there |
| React-style component extraction for every small fragment | extract when there is a real concept, lifecycle, reuse, or boundary |

## Interop Boundaries

Imba compiles to JavaScript, but product code should stay Imba-shaped. Use `global.` for browser globals that are not registered, keep dynamic imports explicit when bundling could rewrite them, and isolate imperative JavaScript libraries behind small methods or adapter objects. The rest of the code should read like Imba: objects own behavior, templates express state, and CSS carries visual state.
