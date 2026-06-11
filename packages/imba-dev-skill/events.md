# Events

Imba has a rich event system with modifiers for control flow, timing, keyboard/pointer filtering, and custom event types for touch, intersection, and resize.

## Basic Syntax

```imba
# Method handler
<button @click=handleClick> "Click me"

# Inline handler
<button @click=(do L "clicked!")> "Click"

# Handler with arguments
<button @click=remove(item)> "Remove"

# Multiple events
<input @focus=onFocus @blur=onBlur @keydown.enter=submit>
```

Event handlers automatically trigger `imba.commit!` (a render pass) after running, unless marked `.passive` or `.silent`.

## Modifiers

Chained with `.` after the event name:

### Control Flow
| Modifier | Effect |
|----------|--------|
| `.prevent` | `event.preventDefault()` |
| `.stop` | `event.stopImmediatePropagation()` (stops all handlers, not just propagation) |
| `.trap` | Both `stopImmediatePropagation()` and `preventDefault()` |
| `.once` | Remove handler after first trigger |
| `.self` | Only trigger if `event.target` is the element itself |
| `.outside` | Only trigger if target is outside the element's parent |
| `.capture` | Use capture phase |
| `.passive` | Mark as passive listener |

```imba
<form @submit.prevent=handleSubmit>
<a @click.stop.prevent=navigate>
<div @click.self=handleSelf>   # ignores clicks on children
<div @click.outside=close>     # clicks outside this element
```

### Timing
| Modifier | Effect |
|----------|--------|
| `.wait(ms)` | Delay execution (default 250ms) |
| `.throttle(ms)` | Throttle to once per ms (default 250ms, adds `throttled` CSS class) |
| `.debounce(ms)` | Debounce by ms (default 250ms) |
| `.cooldown(ms)` | Prevent re-trigger for ms (default 250ms, adds `cooldown` CSS class) |

```imba
<input @input.debounce(300)=search>
<button @click.throttle(1000)=save>
<button @click.cooldown(2000)=submit>
```

### UI Feedback
| Modifier | Effect |
|----------|--------|
| `.flag(name)` | Add CSS class during handler execution (min 250ms, removed after) |
| `.busy` | Alias for `.flag('busy')` |
| `.commit` | Trigger render after handler |
| `.silence` / `.silent` | Suppress auto-commit after handler |
| `.log(...)` | Log params and continue (returns true) |

```imba
# Button gets .busy class while async handler runs
<button @click.busy=save> "Save"

css .busy o:0.5 pe:none
```

### Guards
| Modifier | Effect |
|----------|--------|
| `.if(expr)` | Only trigger if expression is truthy |
| `.sel(selector)` | Only if target matches CSS selector |
| `.closest(selector)` | Only if target or ancestor matches |
| `.trusted` | Only browser-generated events |
| `.untrusted` | Only programmatic events |
| `.focin` | Only if element contains `document.activeElement` |

```imba
<div @click.if(isEnabled)=handle>
<ul @click.sel('li')=handleItem>
```

### Keyboard Modifiers
Key filters for `@keydown`, `@keyup`, `@keypress`:

| Modifier | Key |
|----------|-----|
| `.enter` | Enter (keyCode 13) |
| `.esc` | Escape (keyCode 27) |
| `.tab` | Tab (keyCode 9) |
| `.space` | Space (keyCode 32) |
| `.up` / `.down` / `.left` / `.right` | Arrow keys |
| `.del` | Backspace (8) or Delete (46) |
| `.ctrl` | Control held |
| `.alt` | Alt held |
| `.shift` | Shift held |
| `.meta` | Meta/Cmd held |
| `.mod` | Meta on Mac, Ctrl elsewhere |
| `.key(code)` | Match a specific key by string or keyCode |

```imba
<input @keydown.enter=submit>
<input @keydown.esc=cancel>
<div @keydown.ctrl.s.prevent=save>
```

### Pointer Modifiers
For `@click`, `@pointerdown`, `@pointerup`, etc.:

| Modifier | Effect |
|----------|--------|
| `.primary` | Primary pointer and left mouse button |
| `.secondary` | Non-primary pointer, non-zero button (right or middle click) |
| `.mouse` | Mouse pointer only |
| `.pen` | Stylus/pen only |
| `.touch` | Touch only |
| `.pressure(n)` | Minimum pressure threshold (default 0.5) |

Mouse-specific modifiers (from `mouse.imba`):
| `.left` / `.middle` / `.right` | Specific mouse button |

## Custom Event Types

### @touch — Pointer Tracking

A custom event for tracking pointer movement. Provides deltas, position, and lifecycle phases.

```imba
<div @touch.moved(10)=drag>    # only fires after 10px movement
<div @touch.flag('dragging')=handleDrag>
<div @touch.lock=handleTouch>  # capture pointer for continued tracking
```

Touch modifiers:
| Modifier | Effect |
|----------|--------|
| `.moved(threshold)` | Only trigger after threshold px of movement (default 4) |
| `.lock` | Capture pointer via `setPointerCapture` |
| `.pin` | Pin element to pointer position |
| `.fit` | Constrain to bounds (remap coordinates with clamping) |
| `.hold(time)` | Long-press detection |
| `.sync(item, xprop, yprop)` | Sync touch position to object properties |
| `.round(sx, sy)` | Round position values |
| `.flag(name)` | Add CSS class during touch |
| `.end` | Only fires when touch ends |

Touch handler receives a touch object:
```imba
def drag e\Touch
	L e.dx, e.dy    # delta movement from start
	L e.clientX      # current position
	L e.phase        # 'init', 'active', or 'ended'
	L e.elapsed      # time since start
	L e.active?      # still touching (phase != 'ended')
	L e.ended?       # touch ended (phase == 'ended')
```

### @intersect — Intersection Observer

Fires when element enters/leaves viewport (or a custom root).

```imba
<div @intersect=onVisible>                      # default
<div @intersect(0.5)=onHalfVisible>             # 50% threshold
<img @intersect.in.once=loadImage>              # trigger once when entering
<div @intersect.out=onLeave>                    # when leaving
<div @intersect.css=updateRatio>                # sets --ratio CSS var on element
<div @intersect.flag('in-view')=handleView>     # toggle flag based on intersection
```

Note: `.css` always sets `--ratio` regardless of any argument passed.

### @resize — Resize Observer

Fires when element size changes.

```imba
<div @resize=onResize>
<div @resize.css=handler>                    # sets --u_elw and --u_elh on element
<div @resize.css('1myw','1myh')=handler>     # custom unit names → --u_myw, --u_myh
```

The `.css` modifier creates custom CSS units from element dimensions. Default args are `'1elw'` and `'1elh'`, setting `--u_elw` (element width) and `--u_elh` (element height) as CSS custom properties. These can then be used anywhere in CSS as `1elw`, `2elw`, etc. (compiled to `var(--u_elw,1elw)`).

### @hotkey — Keyboard Shortcuts

```imba
<div @hotkey('ctrl+s')=save>
<div @hotkey('mod+k')=openSearch>   # mod = cmd on mac, ctrl elsewhere
```

Additional modifiers: `.local` (restrict to element scope), `.repeat` (allow repeated key events).

### @selection — Text Selection

Fires on `selectionchange` for focused `input` and `textarea` elements only (not arbitrary elements).

```imba
<input @selection=onSelect>
```

### @mutate — Mutation Observer

Fires on DOM mutations. Additional modifiers configure the observer:

```imba
<div @mutate=onMutate>
<div @mutate.subtree.attributes=onDeepChange>
```

Modifiers: `.subtree`, `.text`, `.childList`, `.attributes`. Defaults to `childList: true` if none specified.

## Emitting Custom Events

```imba
# Via emit modifier
<button @click.emit('item-selected')> "Select"

# Programmatically (on any element)
element.emit('custom-event', detailData)
```

Custom events bubble by default (`bubbles: true`).

## Global Listeners

Use `<global>` to listen on `window`:

```imba
tag my-app
	<self>
		<global @resize=handleResize @keydown.esc=close>
		<div> "Content"
```
