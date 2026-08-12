# Custom Units

Imba supports all the regular css units like `px`, `em`, `rem`, `vw` and friends — but it also lets you declare your *own* units, and change their value anywhere in the cascade.

You might have heard about `rem` (root em) units in css. The benefit of using rems is that you can resize your whole interface by changing a single font-size on the html element. Custom units take this idea further: they are arbitrary rem-like units that you name yourself, and that can be overridden inside any selector, class, media query or component. A design token you can multiply.

## Declaring Units

The syntax for declaring a unit is `1name: value` — read it as "one *name* equals *value*":

```imba
global css @root
    1fh: 24px # a unit named fh (field height)
    1gu: 8px # a unit named gu (grid unit)
    1col: calc(100vw / 12) # units can be any expression
```

Unit names can only contain letters (`a`-`z`). Once declared, use the unit anywhere a css value is expected, with any multiplier — fractions and negative numbers included:

```imba
css .field
    height:1fh
    padding:0.5gu
    margin-top:-0.25fh
    width:calc(100% - 2gu) # works inside calc too
```

> If a unit is used but never declared anywhere, the property will be dropped by the browser — so make sure your units are declared, typically at `@root`.

## Overriding Units

This is where custom units become really powerful. Since they are backed by plain css variables, they cascade — you can override them per selector, per class, and per media query:

```imba
global css @root
    1space:14px .dense:8px
    @lg 1space:18px .dense:12px
```

Now `1space` defaults to `14px`. Inside any element with a `.dense` class it becomes `8px`. On viewports wider than 1024px (the `@lg` modifier) both values scale up. Every single style written in terms of `space` — paddings, margins, gaps, sizes, multiples and fractions alike — follows along automatically.

```imba
# [preview=lg]
# ---
global css @root
    1gu:10px
    .dense 1gu:5px

tag app-root
    css .box bg:indigo2 c:indigo8 rd:md p:1gu mt:0.5gu
    css button p:1gu rd:md bg:gray2 @hover:gray3

    <self[d:block p:1gu]>
        <button @click=flags.toggle('dense')> "Toggle density"
        <.box> "One"
        <.box> "Two"
# ---
imba.mount do <app-root>
```

Notice that toggling a single class rescales everything measured in `gu` — no extra rules needed.

## Local Units

Units don't have to be global. They can be declared at any level of your tree — inside components, selectors, even in inline styles — and only apply within that scope:

```imba
tag app-dashboard
    css self
        # sidebar width - wider on large screens
        1sbw:200px @lg:260px

    <self>
        <aside[w:1sbw]>
        <main[ml:0.5sbw pl:0.5sbw]>
```

Declaring units near where they are used keeps related measurements in one place — change `1sbw` once and the sidebar, margins and paddings all stay in sync.

## Not Just Lengths

Units aren't limited to lengths. Any value with a magnitude works — durations, for instance:

```imba
global css @root
    1beat:200ms

css .modal transition:opacity 1beat
css .drawer transition:transform 2beat
```

All your animations now share a common rhythm, and slowing the whole interface down is a one-line change.

## Dynamic Values

Custom units also work with interpolated values in inline styles. The multiplication happens efficiently at runtime via css variables:

```imba
# [preview=lg]
# ---
let rows = 3
tag app-root
    css self 1fh:24px
    css .box bg:teal2 c:teal8 rd:md mt:2 d:grid ja:center

    <self[d:block p:2]>
        <input type='range' min=1 max=5 bind=rows>
        <.box[h:{rows}fh]> "{rows}fh tall"
# ---
imba.mount do <app-root>
```

## Built-in Units

Imba ships with a few units out of the box:

**`u`** — the base size unit, where `1u` is `4px`. This one is static — it is resolved to plain pixels at compile time and cannot be overridden. `4u` compiles straight to `16px`.

**`lh`** — the current line-height. Whenever you set `line-height` (including via the `fs:md/1.5` shorthand), Imba also records it as the `lh` unit, so `0.5lh` always means half the current line-height. Great for vertical rhythm.

**`rg`** and **`cg`** — the current row-gap and column-gap. Setting `gap` (or `rg`/`cg` individually) declares them, so children can size themselves relative to the gaps of their container:

```imba
css .grid
    d:grid g:4
    .spacer h:1rg # exactly one row-gap tall
```

## Under the Hood

Custom units are implemented as css variables with a `--u_` prefix.

```imba
global css @root
    1space:12px
    hr my:0.5space
```

Compiles to:

```css
:root {
    --u_space: 12px;
}
:root hr {
    margin-top: calc(var(--u_space,1space) * 0.5);
    margin-bottom: calc(var(--u_space,1space) * 0.5);
}
```

A declaration `1space:12px` becomes `--u_space:12px`, and a usage like `0.5space` becomes `calc(var(--u_space,1space) * 0.5)`. Since these are ordinary css variables, they inherit and cascade exactly like you'd expect — which is what makes overriding per selector, class and breakpoint work.

Note the `1space` fallback inside `var()`: any unit Imba doesn't recognize compiles this way, so newer css units that Imba is unaware of still work as-is — while remaining possible to override like any custom unit.

Standard css units (`px`, `em`, `rem`, `%`, `s`, `ms`, `deg`, `fr` and the rest) are passed through untouched and cannot be redefined — the same goes for the built-in `u` unit.
