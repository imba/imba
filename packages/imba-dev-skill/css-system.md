# CSS System

Imba has a built-in CSS engine with property shorthands, scoping, a color palette, modifiers, responsive breakpoints, transitions, and dynamic bindings.

## CSS Contexts

CSS behaves differently depending on where it's written:

```imba
# Global — no scoping, styles apply everywhere
global css body m:0 p:0 ff:sans

tag my-card
	# Component-level — scoped to this component via auto-generated class
	css d:flex fld:column p:4 bg:white rd:md
	css .title fs:lg fw:600 c:blue7

	<self>
		<.title> "Card"
		# Inline on element — scoped to this specific element
		<div[p:2 bg:gray1]> "Inline styles via []"
```

**Scoping mechanism:** Every component gets a unique class name derived from its source file. The compiler injects this class into CSS selectors so styles don't leak. Elements in the render tree accumulate scope classes from parent components.

## Selectors

```imba
tag my-comp
	css d:block              # & (self) is implicit when no selector given
	css &.active bg:blue1    # self with .active class
	css .child c:red         # descendant .child inside this component
	css h1 fs:xl             # descendant h1 inside this component
	css .h1 *.stroke d:none # reach into a nested component under .h1
	css >>> .deep c:green    # escape scoping — targets anything in subtree
	css >> .direct c:green   # one level deep (compiles to >)
```

- `&` — references the current scope element (component root or specific element)
- `*` between selector parts — pierces nested component CSS scope for the following selector while keeping the previous selector scoped. Example: `.h1 *.stroke` can target a `.stroke` rendered inside a child component under `.h1`.
- `>>>` — escapes scoping entirely, subsequent parts are unscoped (for targeting child component internals)
- `>>` — one level deep, compiles to `>` and marks scope boundary
- Non-native tag names without hyphens render as `:is(tagname, tagname-tag)` in selectors. Tags with hyphens (standard custom elements) and native HTML tags render as-is.

### Parent / Ancestor / Owner Selectors

```imba
css ^.collapsed d:none        # direct parent has .collapsed → :is(.collapsed > *)
css ^^^.collapsed d:none      # 3 levels up → :is(.collapsed > * > * > *)
css ..collapsed d:none        # any ancestor has .collapsed → :is(.collapsed *)
css @.active bg:blue1         # current selector also has .active (top-level current selector is self)
css .row
	@.active c:blue           # .row.active
	@@.dense gap:1            # component/root owner has .dense
	@@hover bg:gray1          # component/root owner is hovered
```

- `^` — direct parent selector. Each `^` adds one level of `> *`. If >5, simplifies to descendant ` *`.
- `..` — ancestor class selector. Matches if any ancestor has the class. Compiles to `:is(.class *)`.
- `@.` — current-selector class modifier. It can appear in nested CSS rules; it means this selector also has the class. At top level the current selector is the component/root element. Marked "legacy" in the compiler but heavily used in practice.
- `@@.class` / `@@pseudo` — component/root owner modifier. Inside nested CSS, use this when the current component/root CSS block owner has a class or pseudo-state, e.g. `@@.x fw:bold` or `@@hover bg:gray1`.

**Ancestor modifier gotcha — one property per `..class` inline, additional props on next line:**
```imba
# WRONG — cannot chain ..light with another property on the same line
css bg:#op-gray-8 ..light:white ..light@:bxs:0 1px 3px black/15  # compile error

# RIGHT — put additional ancestor-conditional properties on their own indented line
css @before content:"" bg:#op-gray-8 ..light:white
	..light bxs:0 1px 3px black/15
```
The `..class:value` inline modifier works for a single property value override. For additional properties under the same ancestor condition, use a new indented line with `..class`.

### The `%` Semantic Element

```imba
<self>
	<%footer> "Footer content"
	<%main>
		<%title> "Hello"
		<%content> "Body text"
```

`<%name>` creates a div with a CSS mixin class. Used as a semantic naming convention — the element is still a `div`, but gets a `%name` class for scoped styling. Widely used in Scrimba codebases for naming layout sections without creating separate tags.

## Dynamic CSS / Bindings

### Inline style expressions via `[]`

```imba
<div[bg:{dynamicColor}]>
<div[w:{width}px]>
<div[fs:{size}]>
```

The compiler creates a CSS custom property per expression and sets it at runtime via `element.style.setProperty`. Unit conversion (including the 4px base) happens at runtime.

### Custom property attributes

```imba
<div --my-var=someValue>     # sets --my-var on the element
<div --size=computedSize>    # binds --size to a value
```

Attribute names starting with `--` compile to runtime `css$var` calls.

### The `$` shorthand for variables

```imba
css $myvar:blue5        # compiles to --myvar: [resolved blue5]
css c:$myvar            # compiles to color: var(--myvar)
css bg:$accent          # compiles to background: var(--accent)
```

`$name` as a property → `--name`. `$name` as a value → `var(--name)`.

## Custom Properties and Color Definitions

### Standard custom properties

```imba
css --accent:blue5
css c:var(--accent)
```

### The `#colorname` property (color definitions)

```imba
css #primary:blue5
css #accent:hsl(200 50% 60%)
```

When a property starts with `#`, it's a color definition (not an ID selector — those go in selectors). The compiler converts to LCH color space and sets CSS variables `--u_{name}L`, `--u_{name}C`, `--u_{name}H`, `--u_{name}A` for flexible color manipulation. The colon separates property from value, like all Imba CSS properties.

**CRITICAL — `#color` variable-to-variable references don't cascade:**
Because Imba decomposes `#colors` into L/C/H/A component vars, `#a: #b` compiles to `--u_aL: var(--u_bL)` etc. CSS resolves `var()` in custom property definitions at the **level where the property is set**, not where it's inherited. So if you define `#bg: #gray1` at `:root`, and override `#gray1` in a `.light` class, the `.light` override does NOT propagate to `#bg` — it stays at the `:root`-resolved value.

```imba
# WRONG — light mode won't change #bg
global css @root
	#gray1: lch(10 2 250)
	#bg: #gray1              # resolves to L=10 at :root, inherited as 10

global css .light
	#gray1: lch(99 1 250)    # changes gray1 but bg stays L=10

# RIGHT — define semantic tokens with direct values in BOTH scopes
global css @root
	#bg: lch(10 2 250)

global css .light
	#bg: lch(99 1 250)
```

**CRITICAL — Imba sets inline `background` on custom tags:**
When a tag (custom element) has `css bg:#somevar`, Imba's runtime may also set an inline `style.background` that overrides the class-based CSS rule. If the inline value is wrong, use `def rendered` to clear it: `style.removeProperty('background')`.

### The `hue` property

```imba
css hue:blue
```

Sets `--hue` and `--hue0` through `--hue9` CSS variables, enabling theming where `hue0`-`hue9` are available throughout the component tree.

## Property Shorthands

### Layout
| Short | CSS Property |
|-------|-------------|
| `d` | display |
| `pos` | position (`pos:abs` → absolute, `pos:rel` → relative) |
| `t` / `b` / `l` / `r` | top / bottom / left / right |
| `zi` | z-index |
| `of` / `ofx` / `ofy` | overflow / overflow-x / overflow-y |
| `pe` | pointer-events |
| `us` | user-select |
| `o` | opacity |
| `inset` | top + right + bottom + left |

### Display Shortcuts

All standard CSS display values work: `d:flex`, `d:grid`, `d:block`, `d:inline-flex`, `d:inline-block`, `d:none`, `d:contents`, etc.

Imba adds compound layout values that expand to `display` + `flex-direction` + `align-items` + `justify-content`:

| Value | Display | Direction | JC | AI |
|-------|---------|-----------|----|----|
| `hflex` | flex | row | — | — |
| `vflex` | flex | column | — | — |
| `hgrid` | grid | column (auto-flow), columns=1fr | — | — |
| `vgrid` | grid | row (auto-flow) | — | — |

**Dynamic combos** — `h`/`v` + vertical + horizontal alignment. These are the most common layout patterns:
- Direction: `h` (row) or `v` (column)
- Vertical: `t` (top/flex-start), `c` (center), `b` (bottom/flex-end), `s` (stretch or space-between)
- Horizontal: `l` (left/flex-start), `c` (center), `r` (right/flex-end), `s` (space-between or stretch)

Most used: `d:hcc` (row, center, center), `d:hcl` (row, center, left), `d:vts` (column, top, space-between), `d:vtl` (column, top, left), `d:vcc` (column, center, center), `d:hcs` (row, center, space-between)

For `h` direction: horizontal letter → `justify-content`, vertical letter → `align-items`.
For `v` direction: vertical letter → `justify-content`, horizontal letter → `align-items`.

The `s` letter means `space-between` when mapped to `justify-content`, and `stretch` when mapped to `align-items`.

Other named layouts exist (`box`, `hbox`, `vbox`, `lbox`, `rbox`, `tbox`, `bbox`) but are rarely used in practice — the dynamic combos above are preferred.

### Unit System

**Bare numbers on dimension properties** (padding, margin, width, height, gap, top/left/right/bottom): multiply by `0.25rem`. So `p:4` = `padding: 1rem` (16px at default root size).

**The `u` unit:** Explicit 4px base. `1u` = `4px`, `4u` = `16px`.

**Border radius bare numbers:** multiply by `2px`. So `rd:2` = `4px`.

**Letter spacing bare numbers:** multiply by `0.05em`.

**Custom units → CSS variables:** Unknown units compile to `var(--u_{unit})` with the raw value as fallback. `1fh` → `var(--u_fh,1fh)`, `2rg` → `calc(var(--u_rg,1rg) * 2)`.

**Declaring custom units:** Use `1name:value` syntax in CSS to define units as CSS variables:

```imba
tag my-grid
	css @root
		1fh:24px             # declare fh unit globally
		1gg:20px             # declare grid-gap unit
	css
		1fh:20px             # override at component level
		@sm 1fh:24px         # override per breakpoint
	<self>
		<div[h:2fh p:1gg]>   # uses the custom units
```

`1fh:24px` compiles to `--u_fh: 24px`. Then `2fh` anywhere in CSS compiles to `calc(var(--u_fh,1fh) * 2)`. Custom units cascade via CSS custom properties and can be overridden per selector or breakpoint.

The compiler auto-declares some units: `--u_lh` (from line-height), `--u_rg`/`--u_cg` (from gap).

### Spacing
| Short | CSS Property |
|-------|-------------|
| `p` / `pt` / `pr` / `pb` / `pl` / `px` / `py` | padding and sides |
| `m` / `mt` / `mr` / `mb` / `ml` / `mx` / `my` | margin and sides |
| `g` / `rg` / `cg` | gap / row-gap / column-gap |

### Sizing
| Short | CSS Property |
|-------|-------------|
| `w` / `h` / `s` | width / height / size (both) |
| `miw` / `maw` | min-width / max-width |
| `mih` / `mah` | min-height / max-height |

### Flex
| Short | CSS Property |
|-------|-------------|
| `fl` | flex |
| `fld` | flex-direction |
| `flb` | flex-basis |
| `flg` | flex-grow |
| `fls` | flex-shrink |
| `flw` | flex-wrap |
| `flf` | flex-flow |

### Grid
| Short | CSS Property |
|-------|-------------|
| `gtr` / `gtc` / `gta` | grid-template-rows / columns / areas |
| `gar` / `gac` / `gaf` | grid-auto-rows / columns / flow |
| `ga` / `gr` / `gc` | grid-area / grid-row / grid-column |
| `grs` / `gcs` / `gre` / `gce` | grid-row/column-start/end |
| `gt` | grid-template |

### Alignment
| Short | CSS Property |
|-------|-------------|
| `jc` / `ji` / `js` | justify-content / items / self |
| `ac` / `ai` / `as` | align-content / items / self |
| `jai` / `jac` / `jas` | place-items / content / self |
| `ja` | justify + align |

### Typography
| Short | CSS Property |
|-------|-------------|
| `ff` | font-family |
| `fs` | font-size |
| `fw` | font-weight |
| `lh` | line-height |
| `ls` | letter-spacing |
| `ta` | text-align |
| `td` | text-decoration |
| `tt` | text-transform |
| `ws` | white-space |
| `va` | vertical-align |
| `tof` | text-overflow |

Font size with line-height: `fs:24px/1.2` — the `/1.2` sets line-height.

Named font sizes: `xs`(12px), `sm-`(13px), `sm`(14px), `md-`(15px), `md`(16px), `lg`(18px), `xl`(20px), `2xl`(24px), `3xl`(30px), `4xl`(36px), `5xl`(48px), `6xl`(64px)

Numeric font sizes: `1`-`16` mapping to 10px-96px with proportional line-heights.

Named font stacks: `sans` (system-ui), `mono` (Menlo/Monaco)

Text transform shortcuts: `tt:cap` → capitalize, `tt:up` → uppercase

### Colors
| Short | CSS Property |
|-------|-------------|
| `c` | color |
| `bg` | background |
| `bgc` | background-color |
| `bc` | border-color |

### Border
| Short | CSS Property |
|-------|-------------|
| `bd` / `bdt` / `bdr` / `bdb` / `bdl` / `bdx` / `bdy` | border and sides |
| `bw` / `bwt` / `bwr` / `bwb` / `bwl` / `bwx` / `bwy` | border-width and sides |
| `bs` / `bst` / `bsr` / `bsb` / `bsl` / `bsx` / `bsy` | border-style and sides |
| `bc` / `bct` / `bcr` / `bcb` / `bcl` / `bcx` / `bcy` | border-color and sides |
| `rd` / `rdt` / `rdb` / `rdl` / `rdr` / `rdtl` / `rdtr` / `rdbl` / `rdbr` | border-radius |

Border shorthand is smart: `bd:1px blue5` → `border: 1px solid blue5` (style auto-inserted). `bd:blue5` → `1px solid blue5`.

`bdx` maps to `border-inline`, `bdy` maps to `border-block`.

Border radius scales: `sm`(3px), `md`(4px), `lg`(6px), `xl`(8px), `full`(9999px)

### Background
| Short | CSS Property |
|-------|-------------|
| `bg` | background |
| `bgc` / `bgp` / `bgr` / `bgi` / `bga` / `bgs` / `bgo` / `bgclip` | background-* |

### Shadow
| Short | CSS Property |
|-------|-------------|
| `bxs` | box-shadow |
| `txs` | text-shadow |

Box shadow scales: `xxs`, `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `none`

### Transform

Transform properties use CSS custom variables internally. Using any transform property auto-injects a composite `transform` rule:

| Short | Effect |
|-------|--------|
| `x` / `y` / `z` | translate (px default for x/y/z) |
| `rotate` | rotate (turn default) |
| `scale` / `scale-x` / `scale-y` | scale |
| `skew-x` / `skew-y` | skew |
| `origin` | transform-origin |

### Outline

Outline uses CSS variables internally. `ol:2px blue5` → `outline: 2px solid blue5`. `ol:blue5` → `1px solid blue5`.

| Short | CSS Property |
|-------|-------------|
| `ol` / `olc` / `ols` / `olw` / `olo` | outline / color / style / width / offset |

### Transitions & Easing

Imba has a cascading ease system using CSS custom properties:

| Short | Controls | Falls back to |
|-------|----------|--------------|
| `ea` | All properties (base duration/function/delay) | — |
| `es` | Styles (default for all sub-groups) | `ea` |
| `eo` | Opacity | `es` |
| `ec` | Colors (color, background-color, border-color, fill, stroke, outline-color, box-shadow, filter) | `es` |
| `eb` | Box (inset, width, height, max-*, min-*, border-width, outline-width, stroke-width, margin, padding) | `es` |
| `et` | Transform | `eb` |

Each has sub-properties: `{prefix}d` (duration), `{prefix}f` (function), `{prefix}w` (delay).

`tween` is an alias for the CSS `transition` property: `tween:200ms` = `transition: 200ms`.

Default easing function: `cubic-bezier(0.23, 1, 0.32, 1)` (quint-out).

Named easings: `sine-in`, `sine-out`, `sine-in-out`, `quad-*`, `cubic-*`, `quart-*`, `quint-*`, `expo-*`, `circ-*`, `back-*`

**Note:** CSS custom variables cannot be used for transition/animation durations (browser limitation). Use custom units or inline expressions instead.

### Content Helpers
| Short | Effect |
|-------|--------|
| `prefix:"text"` | `::before { content: "text" }` |

String values are auto-quoted.

## Color Palette

Built-in colors with scale 0-9 (0 = lightest, 9 = darkest):

`rose`, `pink`, `fuchsia`, `purple`, `violet`, `indigo`, `blue`, `sky`, `cyan`, `teal`, `emerald`, `green`, `lime`, `yellow`, `amber`, `orange`, `red`, `warmer`, `warm`, `gray`, `cool`, `cooler`

Usage: `blue3` (light), `blue7` (dark)

Alpha: `blue5/50` for 50% opacity. Dynamic alpha: `blue5/$opacity` uses a CSS variable.

Fractional shades: multi-digit precision after the base shade digit. `blue55` = 50% between blue5 and blue6. `blue440` = 40% between blue4 and blue5. `blue465` = 65% between blue4 and blue5. The compiler HSL-interpolates between the two nearest defined shades.

Special values: `black`, `white`, `transparent`, `clear`, `current` (currentColor)

All standard CSS named colors also work (`aliceblue`, `coral`, etc.).

## CSS Modifiers

Modifiers go **inline after the value** they modify:

```imba
# CORRECT — modifier inline after value
css bg:blue5 @hover:blue6 c:white @hover:gray1

# WRONG — modifier as separate line
css @hover bg:blue6
```

Negated modifiers with `!`: `@!hover`, `@!md`, `@!dark`

### Pseudo-classes
`@hover`, `@focus`, `@active`, `@checked`, `@disabled`, `@enabled`, `@first`, `@last`, `@odd`, `@even`, `@empty`, `@valid`, `@invalid`, `@required`, `@optional`, `@placeholder-shown`, `@read-only`, `@read-write`, `@indeterminate`, `@autofill`, `@focus-visible`, `@focus-within` (alias: `@focin`)

Pseudo-classes are "shimmed" — `@hover` compiles to `:is(:hover, .\\@hover)` so they can be toggled programmatically via flags.

### Pseudo-elements
`@before`, `@after`, `@placeholder`, `@selection`, `@marker`, `@first-letter`, `@first-line`, `@backdrop`

### Responsive Breakpoints
| Modifier | Min-width |
|----------|-----------|
| `@xs` | 480px |
| `@sm` | 640px |
| `@md` | 768px |
| `@lg` | 1024px |
| `@xl` | 1280px |
| `@2xl` | 1536px |

Numeric breakpoints: `@640` for `min-width: 640px`, `@!640` for `max-width: 639px`. Height: `@480h`.

Named `@lt-*` variants also exist (`@lt-sm` = max-width: 639px) but numeric `@!600` style is preferred in practice.

### Media Queries
`@dark`, `@light`, `@landscape`, `@portrait`, `@print`, `@screen`, `@standalone`

### Selector Modifiers
`@is(selector)`, `@not(selector)`, `@has(selector)`, `@where(selector)`

### Priority Modifiers
`@important` (priority 4), `@inline` (priority 3), `@force` (priority 6)

**IMPORTANT:** Imba CSS does NOT support `!important` syntax (`d:block!`, `w:100%!`). This is NOT CSS — the `!` suffix causes compile errors. Use `@important` as a selector modifier if you need priority, but prefer solving specificity by placing rules in the right context (e.g., nested under the right layout selector in block-styles.imba) instead of forcing priority.

### Transition State Flags
`@off`, `@out`, `@in` — for CSS entry/exit animations. Boost specificity to s1=4.

```imba
css o:1 @off:0    # opacity 0 when element is in "off" state
```

### Custom Modifiers

Any undefined `@modifier` compiles to a class selector `.\@modifier`. This lets you create arbitrary state flags:

```imba
css d:none @logged-in:block    # shows when .\@logged-in class is present
```

Known flags like `@touch`, `@ssr`, `@hold`, `@suspended`, `@move` use this same mechanism — they're just class selectors toggled by Imba's event system or runtime.

### Modifier Stacking

Multiple `@` modifiers on the same value are all required (AND logic). They compile to concatenated selectors:

```imba
css bg:blue5 @hover@focus:blue6    # needs both hover AND focus
```

### Other Flags
`@touch`, `@suspended`, `@move`, `@hold`, `@ssr`

## Keyframes

```imba
css @keyframes fadein
	0% o:0
	100% o:1

# Global keyframes (no name scoping)
global css @keyframes slidein
	from x:-100%
	to x:0
```

Keyframe names are scoped per-component (auto-namespaced). The compiler creates `--animation-{name}` CSS variable so animations resolve correctly within scope. Global keyframes preserve the original name.

## Conditional Styles

Use flag toggling, not value expressions:

```imba
tag todo-item
	css .done td:line-through c:gray5
	css .urgent c:red6 fw:bold

	<self .done=data.done .urgent=data.urgent>
		<span> data.title
```

## Global Styles

```imba
global css
	body m:0 p:0 ff:sans
	* box-sizing:border-box
```

## Auto-Prefixing

These properties automatically get `-webkit-` prefixed duplicates: `user-select`, `appearance`, `backdrop-filter`, `mask-image`.
