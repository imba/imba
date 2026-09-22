// Generates css-reference.json — a machine-readable ground truth for Imba CSS,
// bound directly to the compiler's source-of-truth maps so it can never drift.
//
// Phase 1 of the CSS-docs plan. Emits four kinds of mapping, kept deliberately
// separate because they behave differently (see the critique):
//   - aliases         : finite short->CSS property map (enumerable)
//   - layouts         : compound `d:` values that expand to several properties
//   - keyword_values  : per-property value keywords (enumerable)
//   - tokens          : palettes/scales (colors, font-size, radius, shadow, easing)
//   - rules           : ALGORITHMIC transforms — described + illustrated, NOT enumerated
//   - modifiers        : pseudo / breakpoint / media / priority
//   - mechanisms      : the handful of real DOM/runtime effects (the honest "dom impact")
//
// `rules.examples` glosses here are ILLUSTRATIVE. Phase 2 (gen-css-corpus.mjs)
// attaches a compiler-verified `css_actual` to each so they are grounded.
//
// This module is a pure builder — it exports buildReference() and writes nothing.
// The orchestrator css-docs.mjs generates/checks the files.

import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

import { aliases, layouts } from '../../src/compiler/styler.mjs'
import { colors, named_colors, variants, modifiers, fonts } from '../../src/compiler/theme.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')
const rel = (p) => relative(repoRoot, p).replaceAll('\\', '/')

const SRC = {
	styler: rel(join(repoRoot, 'src/compiler/styler.mjs')),
	theme: rel(join(repoRoot, 'src/compiler/theme.mjs')),
	runtime: rel(join(repoRoot, 'src/imba/dom/styles.imba')),
}

// ---------------------------------------------------------------------------
// 1. Property aliases (short -> real CSS property)
// ---------------------------------------------------------------------------
// A target is "virtual" when it is not itself a real CSS property but is further
// expanded by the compiler (axis shorthands like padding-x, and `size`). We flag
// these so consumers know the true CSS is resolved downstream (captured in Phase 2).
const REAL_CSS = new Set([
	// minimal allow-list of the non-obvious virtuals we care to flag; anything
	// matching these shapes is marked virtual, everything else is treated as real.
])
const isVirtual = (target) => {
	const t = Array.isArray(target) ? target.join(' ') : target
	return /(^|\b)(padding|margin|border|inset)-[xy]\b/.test(t)
		|| /\bborder-[xy]-(style|width|color)\b/.test(t)
		|| t === 'size'
}

function buildAliases() {
	const out = {}
	for (const short of Object.keys(aliases).sort()) {
		const target = aliases[short]
		const entry = { css: target }
		if (isVirtual(target)) {
			entry.virtual = true
			entry.note = 'expands further in the compiler; see golden corpus for exact CSS'
		}
		out[short] = entry
	}
	return out
}

// ---------------------------------------------------------------------------
// 2. Compound display layouts (`d:hflex`, `d:hcc`, `d:box` ...)
// ---------------------------------------------------------------------------
// The layout entries are functions that mutate a style object. We execute each
// with a fresh object to capture its expansion, then resolve the shorthand keys
// (fld/ai/jc/...) through `aliases` so we also record the final CSS property names.
function resolveShorthandObject(obj) {
	const css = {}
	for (const [k, v] of Object.entries(obj)) {
		const prop = aliases[k] || k // fld->flex-direction, etc; display passes through
		css[Array.isArray(prop) ? prop.join('+') : prop] = v
	}
	return css
}

function buildLayouts() {
	const out = {}
	for (const name of Object.keys(layouts).sort()) {
		const fn = layouts[name]
		if (typeof fn !== 'function') continue
		const shorthand = {}
		try {
			fn(shorthand)
		} catch (err) {
			out[name] = { error: String(err && err.message || err) }
			continue
		}
		out[name] = {
			shorthand,
			css: resolveShorthandObject(shorthand),
		}
	}
	return out
}

// ---------------------------------------------------------------------------
// 3. Keyword value expansions
// ---------------------------------------------------------------------------
// These live in StyleTheme methods in styler.mjs (not in a data map), so they are
// curated here with a source pointer. Small, stable set.
function buildKeywordValues() {
	return {
		position: {
			source: `${SRC.styler} (StyleTheme.position)`,
			values: { abs: 'absolute', rel: 'relative' },
		},
		'text-transform': {
			source: `${SRC.styler} (StyleTheme.tt)`,
			values: { cap: 'capitalize', up: 'uppercase' },
		},
	}
}

// ---------------------------------------------------------------------------
// 4. Tokens (palettes and scales)
// ---------------------------------------------------------------------------
function buildTokens() {
	// font-size variants are [value, line-height] tuples; split named vs numeric.
	const fsNamed = {}
	const fsNumeric = {}
	for (const [k, v] of Object.entries(variants['font-size'])) {
		const rec = { size: v[0], 'line-height': v[1] }
		if (/^\d+$/.test(k)) fsNumeric[k] = rec
		else fsNamed[k] = rec
	}

	return {
		colors: {
			families: Object.keys(colors),
			shades: '0 (lightest) .. 9 (darkest)',
			palette: colors,
			named: named_colors,
			specials: ['black', 'white', 'transparent', 'clear', 'current (currentColor)'],
			alpha: 'blue5/50 => 50% opacity; blue5/$var => dynamic alpha',
			fractional: 'blue55 => 50% between blue5 and blue6 (HSL interpolation of nearest shades)',
		},
		font_family: fonts,
		font_size: { named: fsNamed, numeric: fsNumeric },
		radius: variants.radius, // includes NUMBER: bare-number scale factor
		box_shadow: Object.keys(variants['box-shadow']),
		easings: variants.easings,
		letter_spacing: variants['letter-spacing'],
		sizing: variants.sizing, // NUMBER: bare-number multiplier for dimension props
	}
}

// ---------------------------------------------------------------------------
// 5. Rules — algorithmic transforms (described + illustrated)
// ---------------------------------------------------------------------------
// These CANNOT be enumerated value-by-value. Each is a rule plus a couple of
// illustrative pairs. Phase 2 verifies the pairs by compiling them.
function buildRules() {
	return [
		{
			id: 'spacing-scale',
			applies_to: 'padding, margin, width, height, gap, top/right/bottom/left, size (CSS_DIM_PROPS)',
			description: 'Bare number => multiply by the sizing unit. Compile-time uses 0.25rem; the runtime path (inline/dynamic values) uses the `u` unit = 4px (value*4+"px").',
			source: `${SRC.runtime} (toValue, CSS_DIM_PROPS, variants.sizing)`,
			examples: [{ imba: 'p:4', css: 'padding: 1rem' }, { imba: 'gap:2', css: 'gap: 0.5rem' }],
		},
		{
			id: 'px-props',
			applies_to: 'x, y, z (CSS_PX_PROPS)',
			description: 'Bare number defaults to px unit.',
			source: `${SRC.runtime} (CSS_PX_PROPS, CSS_DEFAULT_UNITS)`,
			examples: [{ imba: 'x:10', css: 'translateX(10px) (via transform composite)' }],
		},
		{
			id: 'rotate-unit',
			applies_to: 'rotate',
			description: 'Bare number defaults to turn.',
			source: `${SRC.runtime} (CSS_DEFAULT_UNITS)`,
			examples: [{ imba: 'rotate:0.5', css: 'rotate(0.5turn)' }],
		},
		{
			id: 'radius-scale',
			applies_to: 'border-radius (rd)',
			description: 'Bare number => multiply by 2px (variants.radius.NUMBER). Named scale also available.',
			source: `${SRC.theme} (variants.radius)`,
			examples: [{ imba: 'rd:2', css: 'border-radius: 4px' }, { imba: 'rd:md', css: 'border-radius: 4px' }],
		},
		{
			id: 'letter-spacing-scale',
			applies_to: 'letter-spacing (ls)',
			description: 'Bare number => multiply by 0.05em.',
			source: `${SRC.theme} (variants[letter-spacing])`,
			examples: [{ imba: 'ls:2', css: 'letter-spacing: 0.1em' }],
		},
		{
			id: 'custom-units',
			applies_to: 'any dimension value with an unknown unit',
			description: 'Unknown unit => calc(var(--u_{unit},1px) * value). Declare with `1{unit}:value` which sets --u_{unit}.',
			source: `${SRC.runtime} (toValue else-branch)`,
			examples: [{ imba: '1fh:24px\nh:2fh', css: '--u_fh: 24px; height: calc(var(--u_fh,1fh) * 2)' }],
		},
		{
			id: 'palette-color',
			applies_to: 'any color value (c, bg, bc, ...)',
			description: 'family+shade => hsla(). Runtime resolves via CSS_COLORS; alpha via /NN; fractional shades interpolate nearest.',
			source: `${SRC.runtime} (CSS_COLORS, CSS_COLORS_REGEX, toValue)`,
			examples: [{ imba: 'bg:blue5', css: 'background: hsla(217,91%,60%,100%)' }, { imba: 'bg:blue5/50', css: 'background: hsla(217,91%,60%,50%)' }],
		},
		{
			id: 'smart-border',
			applies_to: 'border (bd), outline (ol)',
			description: 'Style keyword is auto-inserted. bd:1px blue5 => 1px solid <blue5>; bd:blue5 => 1px solid <blue5>.',
			source: `${SRC.styler} (StyleTheme border/outline)`,
			examples: [{ imba: 'bd:1px blue5', css: 'border: 1px solid hsla(217,91%,60%,100%)' }],
		},
		{
			id: 'compound-display',
			applies_to: 'display (d)',
			description: 'Compound values expand to several properties (see the `layouts` section for the full resolved map).',
			source: `${SRC.styler} (layouts)`,
			examples: [{ imba: 'd:hcc', css: 'display:flex; flex-direction:row; justify-content:center; align-items:center' }],
		},
		{
			id: 'font-size-with-line-height',
			applies_to: 'font-size (fs)',
			description: 'fs:<size>/<lh> sets font-size and line-height together. A unitless <lh> is resolved to a computed px line-height by the compiler (see css_actual); a unit like 1.5em is passed through verbatim.',
			source: `${SRC.styler} (StyleTheme.fs)`,
			examples: [{ imba: 'fs:24px/1.2', css: 'font-size: 24px; line-height: <computed>' }],
		},
		{
			id: 'string-props-autoquote',
			applies_to: 'content, prefix, suffix (CSS_STR_PROPS)',
			description: 'Unquoted string values are auto-quoted. `prefix`/`suffix` also generate ::before/::after content.',
			source: `${SRC.runtime} (CSS_STR_PROPS, toValue)`,
			examples: [{ imba: 'prefix:"x"', css: '::before { content: "x" }' }],
		},
	]
}

// ---------------------------------------------------------------------------
// 6. Modifiers (classified by the shape of each theme.modifiers entry)
// ---------------------------------------------------------------------------
function buildModifiers() {
	const pseudo_classes = [] // { name, shimmable }
	const pseudo_elements = []
	const breakpoints = {}
	const media = {}
	const functional = {} // predefined value pseudos (odd/even) + selector fns (is/has/not)
	const flags = {} // Imba runtime state flags (@touch, @ssr, ...)
	const scroll_state = {} // scroll-state() modifiers
	const priority = {}
	const other = {}

	for (const [name, def] of Object.entries(modifiers)) {
		if (!def) { flags[name] = { note: 'runtime flag (class selector)' }; continue }
		if (def.shim) pseudo_classes.push({ name, shimmable: true })
		else if (def.type === 'el') pseudo_elements.push(name)
		else if (def.type === 'selector') functional[name] = { kind: 'selector-function' }
		else if (def.flag) flags[name] = { class: def.flag }
		else if (def.scrollstate) scroll_state[name] = { selector: def.scrollstate }
		else if (def.media) {
			const rec = { media: def.media }
			if (def.medianeg) rec.negated = def.medianeg
			if (/min-width|max-width/.test(def.media)) breakpoints[name] = rec
			else media[name] = rec
		}
		else if (typeof def.pri === 'number') priority[name] = { priority: def.pri }
		else if (def.name) functional[name] = { kind: 'value-pseudo', ...def } // nth-child(odd) etc
		else if (Object.keys(def).length === 0) pseudo_classes.push({ name, shimmable: false }) // {} => emitted as :name
		else other[name] = def
	}

	return {
		pseudo_classes: pseudo_classes.sort((a, b) => a.name.localeCompare(b.name)),
		pseudo_elements: pseudo_elements.sort(),
		breakpoints,
		media,
		functional,
		flags,
		scroll_state,
		priority,
		other,
		note: 'Any undefined @modifier compiles to a class selector .\\@modifier (custom state flag). Shimmable pseudo-classes compile to :is(:x, .\\@x) so they can be toggled via flags.',
	}
}

// ---------------------------------------------------------------------------
// 7. Mechanisms — the honest "DOM impact" (a small fixed set, not per-property)
// ---------------------------------------------------------------------------
function buildMechanisms() {
	return [
		{ id: 'scope-class', summary: 'Static CSS => stylesheet rule applied via an auto-generated scope class. No per-property DOM effect beyond the class.' },
		{ id: 'dynamic-var', summary: 'Inline [] / dynamic values => a CSS custom property set at runtime via element.style.setProperty (css$var). Final CSS is computed in the browser (see runtime rules).' },
		{ id: 'transform-composite', summary: 'x/y/z/rotate/scale/skew each set a CSS variable; a single composite `transform` rule is auto-injected that references them.' },
		{ id: 'ease-cascade', summary: 'ea/es/eo/ec/eb/et set cascading easing variables (duration/function/delay) that transitions read from.' },
		{ id: 'color-decomposition', summary: '#color definitions decompose into --u_{name}L/C/H/A variables (LCH); var-to-var #color refs resolve at definition level and do NOT cascade.' },
		{ id: 'pseudo-shim', summary: 'Shimmed pseudo-classes compile to :is(:hover, .\\@hover) so they can be toggled via flags/classes at runtime.' },
	]
}

// ---------------------------------------------------------------------------
// Assemble. Returns the base reference object (pre-verification). css-docs.mjs
// is the orchestrator that verifies rule examples and writes the files.
// ---------------------------------------------------------------------------
export function buildReference() {
	const reference = {
		$meta: {
			description: 'Machine-readable ground truth for Imba CSS shorthands. Generated — do not edit by hand.',
			generator: rel(join(__dirname, 'gen-css-reference.mjs')),
			generatedFrom: SRC,
			disclaimer: 'aliases/layouts/tokens/modifiers are extracted from source. keyword_values and rules glosses are illustrative; rules[].examples[].css_actual is compiler-verified in Phase 2.',
		},
		aliases: buildAliases(),
		layouts: buildLayouts(),
		keyword_values: buildKeywordValues(),
		tokens: buildTokens(),
		rules: buildRules(),
		modifiers: buildModifiers(),
		mechanisms: buildMechanisms(),
	}

	reference.$meta.counts = {
		aliases: Object.keys(reference.aliases).length,
		layouts: Object.keys(reference.layouts).length,
		color_families: reference.tokens.colors.families.length,
		named_colors: Object.keys(reference.tokens.colors.named).length,
		rules: reference.rules.length,
		pseudo_classes: reference.modifiers.pseudo_classes.length,
		breakpoints: Object.keys(reference.modifiers.breakpoints).length,
	}
	return reference
}
