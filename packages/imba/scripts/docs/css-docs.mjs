// Orchestrator + drift guard for the Imba CSS docs artifacts.
//
//   node scripts/docs/css-docs.mjs           # (re)generate the JSON files
//   node scripts/docs/css-docs.mjs --check    # CI guard: exit 1 if committed files are stale
//
// render() is the single source of truth for what the committed files must
// contain, so generate and check can never disagree.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

import { buildReference } from './gen-css-reference.mjs'
import { buildCorpus, verifyReference } from './gen-css-corpus.mjs'
import { renderMarkdown } from './gen-css-markdown.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')
const rel = (p) => relative(repoRoot, p).replaceAll('\\', '/')

// Produce the exact string content of every artifact. Deterministic.
export function render() {
	const reference = verifyReference(buildReference()) // Phase 1 base + Phase 2 verification
	const corpus = buildCorpus()
	const serialize = (o) => JSON.stringify(o, null, '\t') + '\n'
	return {
		[join(__dirname, 'css-reference.json')]: serialize(reference),
		[join(__dirname, 'css-corpus.json')]: serialize(corpus),
		[join(__dirname, 'css-reference.md')]: renderMarkdown(reference, corpus),
	}
}

const files = render()
const paths = Object.keys(files)

if (process.argv.includes('--check')) {
	const stale = []
	for (const p of paths) {
		let current = null
		try { current = readFileSync(p, 'utf8') } catch { /* missing */ }
		if (current !== files[p]) stale.push(rel(p))
	}
	if (stale.length) {
		console.error('CSS docs are stale:\n  ' + stale.join('\n  '))
		console.error('\nRun `npm run docs:css` and commit the result.')
		process.exit(1)
	}
	console.log('CSS docs are up to date (' + paths.length + ' files).')
} else {
	for (const p of paths) writeFileSync(p, files[p])
	console.log('wrote:\n  ' + paths.map(rel).join('\n  '))
}
