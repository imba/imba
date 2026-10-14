// Phase 2 — golden corpus. Compiles curated Imba CSS snippets through the real
// compiler and captures the actual emitted CSS, so every example is VERIFIED
// rather than asserted. Doubles as a regression fixture: if the compiler changes,
// regenerate and the diff surfaces exactly what moved.
//
// This module is a pure builder — it exports buildCorpus() and verifyReference()
// and writes nothing. The orchestrator css-docs.mjs generates/checks the files.
//   - buildCorpus()        -> curated {imba, css} pairs grouped by category
//   - verifyReference(ref) -> attaches compiler-verified css_actual to rule examples

import { compile } from '../../dist/compiler.mjs'

const SOURCE_PATH = 'corpus.imba'

// Compile a `css` fragment inside a throwaway tag and return the cleaned CSS.
// `fragment` may be one line, or several lines (\n-separated) which are emitted
// as an indented css block. Diagnostics use numeric LSP severity (1 = error).
function compileCss(fragment) {
	const lines = fragment.split('\n')
	const src = lines.length > 1
		? `tag t\n\tcss\n${lines.map((l) => '\t\t' + l).join('\n')}\n`
		: `tag t\n\tcss ${fragment}\n`
	let res
	try {
		res = compile(src, { sourcePath: SOURCE_PATH })
	} catch (err) {
		return { error: String((err && err.message) || err).split('\n')[0] }
	}
	const isError = (d) => d.severity === 1 || d.severity === 'error'
	const err = (res.diagnostics || []).find(isError)
	if (err) return { error: err.message || 'compile error' }
	return { css: cleanCss(res.css || '', res.sourceId) }
}

// Normalize the per-source scope hash to `.scope`, drop the auto default
// `t-tag { display:block; }` rule and the leading resets, and tidy whitespace.
function cleanCss(css, sourceId) {
	let out = css
	if (sourceId) out = out.split(sourceId).join('scope')
	out = out
		.replace(/^\s*t-tag \{[^}]*\}\s*$/gm, '') // default display:block rule
		.replace(/\t/g, ' ')
		.replace(/[ ]+\n/g, '\n')
		.replace(/\n{2,}/g, '\n')
		.trim()
	return out
}

// ---------------------------------------------------------------------------
// Curated snippets. Coverage target: every rule id, the keyword expansions,
// each modifier class, and the documented gotchas (as verified counterexamples).
// `rule` links a snippet back to a css-reference rule for cross-checking.
// ---------------------------------------------------------------------------
const SNIPPETS = [
	// --- rules ---
	{ cat: 'rule', rule: 'spacing-scale', imba: 'p:4' },
	{ cat: 'rule', rule: 'spacing-scale', imba: 'gap:2 mt:1' },
	{ cat: 'rule', rule: 'px-props', imba: 'x:10 y:20' },
	{ cat: 'rule', rule: 'rotate-unit', imba: 'rotate:0.25' },
	{ cat: 'rule', rule: 'radius-scale', imba: 'rd:2' },
	{ cat: 'rule', rule: 'radius-scale', imba: 'rd:md' },
	{ cat: 'rule', rule: 'letter-spacing-scale', imba: 'ls:2' },
	{ cat: 'rule', rule: 'custom-units', imba: '1fh:24px\nh:2fh', note: 'declare + use a custom unit' },
	{ cat: 'rule', rule: 'palette-color', imba: 'bg:blue5' },
	{ cat: 'rule', rule: 'palette-color', imba: 'bg:blue5/50' },
	{ cat: 'rule', rule: 'palette-color', imba: 'bg:blue55' },
	{ cat: 'rule', rule: 'smart-border', imba: 'bd:1px blue5' },
	{ cat: 'rule', rule: 'smart-border', imba: 'bd:blue5' },
	{ cat: 'rule', rule: 'compound-display', imba: 'd:hcc' },
	{ cat: 'rule', rule: 'font-size-with-line-height', imba: 'fs:24px/1.2' },
	{ cat: 'rule', rule: 'string-props-autoquote', imba: 'prefix:"hi"' },

	// --- keyword values ---
	{ cat: 'keyword', imba: 'pos:abs' },
	{ cat: 'keyword', imba: 'pos:rel' },
	{ cat: 'keyword', imba: 'tt:up' },
	{ cat: 'keyword', imba: 'tt:cap' },

	// --- plain alias pass-through (one per family) ---
	{ cat: 'alias', imba: 'zi:10' },
	{ cat: 'alias', imba: 'of:hidden' },
	{ cat: 'alias', imba: 'fl:1' },
	{ cat: 'alias', imba: 'ta:center' },
	{ cat: 'alias', imba: 'o:0.5' },

	// --- modifiers ---
	{ cat: 'modifier', imba: 'bg:blue5 @hover:blue6', note: 'pseudo-class shim' },
	{ cat: 'modifier', imba: 'fs:sm @md:lg', note: 'breakpoint => @media' },
	{ cat: 'modifier', imba: 'c:red5 @dark:red3', note: 'media query' },
	{ cat: 'modifier', imba: 'bg:blue5 @hover@focus:blue6', note: 'AND-stacked modifiers' },

	// --- gotchas (verified counterexamples) ---
	{ cat: 'gotcha', imba: 'inset:0', note: 'inset:* ALSO sets position:absolute' },
	{ cat: 'gotcha', imba: 'd:block!', note: 'the ! priority suffix is NOT valid Imba CSS' },
	{ cat: 'gotcha', imba: 'fs:24px/1.2', note: 'slash sets line-height, not division' },
]

// ---------------------------------------------------------------------------
// Build corpus
// ---------------------------------------------------------------------------
// Build the golden corpus: compile every curated snippet and capture real CSS.
export function buildCorpus() {
	const corpus = { $meta: { generator: 'scripts/docs/gen-css-corpus.mjs', compiledWith: 'dist/compiler.mjs', note: 'CSS captured from the real compiler; scope hash normalized to .scope' }, entries: [] }
	for (const snip of SNIPPETS) {
		corpus.entries.push({ ...snip, ...compileCss(snip.imba) })
	}
	const byCat = {}
	for (const e of corpus.entries) byCat[e.cat] = (byCat[e.cat] || 0) + 1
	corpus.$meta.counts = { total: corpus.entries.length, byCategory: byCat, errors: corpus.entries.filter((e) => e.error).length }
	return corpus
}

// Attach compiler-verified output to each rules[].example (in place). css_actual
// is authoritative; the hand `css` becomes a non-authoritative `css_illustrative`.
export function verifyReference(ref) {
	let checked = 0, uncovered = 0
	for (const rule of ref.rules) {
		for (const ex of rule.examples || []) {
			const { css, error } = compileCss(ex.imba)
			ex.css_illustrative = ex.css
			delete ex.css
			ex.css_actual = error ? `ERROR: ${error}` : css
			// Coverage check: property NAMES in the gloss present in real output?
			// (Values legitimately differ — 1rem vs 16px, hsla precision — so we
			// assert property coverage only, not value equality.)
			const props = String(ex.css_illustrative).match(/[a-z-]+\s*:/g) || []
			ex.properties_covered = !error && props.every((p) => (css || '').includes(p.replace(/\s+/g, '')))
			checked++
			if (!ex.properties_covered) uncovered++
		}
	}
	ref.$meta.phase2 = { verified_examples: checked, gloss_property_gaps: uncovered, note: 'css_actual is compiler-verified ground truth. css_illustrative is a non-authoritative human gloss; properties_covered checks property-name coverage only, not values.' }
	return ref
}
