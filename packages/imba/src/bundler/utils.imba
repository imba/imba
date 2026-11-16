import nfs from 'fs'
import np from 'path'
import {createHash as cryptoCreateHash} from 'crypto'
import os from 'os'

import {resolve as parseConfig,merge as mergeConfig} from './config'
import * as smc from 'sourcemap-codec'

export const defaultLoaders = {
	".png": "file",
	".svg": "file",
	".woff2": "file",
	".woff": "file",
	".ttf": "file",
	".otf": "file"
}

export const Extensions = {
	".png": "file",
	".apng": "file",
	".webp": "file",
	".heif": "file",
	".avif": "file",
	".svg": "file",
	".gif": "file",
	".jpg": "file",
	".jpeg": "file",
	".ico": "file",
	".woff2": "file",
	".woff": "file",
	".eot": "file",
	".ttf": "file",
	".otf": "file",
	".html": "file"
}

export const FontRegex = /\.(woff2?|eot|ttf|otf)$/
export const ImageRegex = /\.(gif?|a?png|jpe?g|svg|avif|heif|webp|ico)$/

export const builtInModules = {
	"assert":         true,
	"async_hooks":    true,
	"buffer":         true,
	"child_process":  true,
	"cluster":        true,
	"console":        true,
	"constants":      true,
	"crypto":         true,
	"dgram":          true,
	"dns":            true,
	"domain":         true,
	"events":         true,
	"fs":             true,
	"fs/promises":    true,
	"http":           true,
	"http2":          true,
	"https":          true,
	"inspector":      true,
	"module":         true,
	"net":            true,
	"os":             true,
	"path":           true,
	"perf_hooks":     true,
	"process":        true,
	"punycode":       true,
	"querystring":    true,
	"readline":       true,
	"repl":           true,
	"stream":         true,
	"string_decoder": true,
	"sys":            true,
	"timers":         true,
	"tls":            true,
	"trace_events":   true,
	"tty":            true,
	"url":            true,
	"util":           true,
	"v8":             true,
	"vm":             true,
	"worker_threads": true,
	"zlib":           true
}

export def getCacheDir options
	# Default to a project-local cache inside node_modules/.cache so it never
	# leaks across projects and resets when imba is reinstalled. IMBA_CACHEDIR
	# always wins; fall back to a project-local .imba-cache when there is no
	# node_modules (e.g. a standalone script).
	let cwd = options..cwd or process.cwd!
	let dir = process.env.IMBA_CACHEDIR
	unless dir
		let nm = options..nodeModulesPath or np.resolve(cwd,'node_modules')
		dir = nfs.existsSync(nm) ? np.resolve(nm,'.cache','imba') : np.resolve(cwd,'.imba-cache')
	unless nfs.existsSync(dir)
		nfs.mkdirSync(dir,{recursive: true})
	return dir

export def getAliasDir
	# The path-alias map is global on purpose: its ids seed CSS class/scope
	# names and field-registry keys, so separately-built projects that get
	# mixed together must not collide. Unlike the per-project compiled-output
	# cache it lives in a shared, user-level dir. IMBA_ALIASDIR overrides.
	let dir = process.env.IMBA_ALIASDIR or np.resolve(os.homedir!,'.imba')
	unless nfs.existsSync(dir)
		nfs.mkdirSync(dir,{recursive: true})
	return dir

export def diagnosticToESB item, add = {}
	# {"id":"bs","warnings":[],"errors":[{"range":{"start":{"line":3,"character":9,"offset":41},"end":{"line":3,"character":9,"offset":41}},"severity":1,"source":"imba-parser","message":"Unexpected 'TERMINATOR'"}],"js":"","css":""}
	{
		text: item.message
		location: Object.assign({
			line: item.range.start.line + 1
			column: item.range.start.character
			length: item.range.end.offset - item.range.start.offset
			lineText: item.lineText
		},add)
	}

export def normalizePath src
	src.replace(/\/+/g,'/').replace(/\/\.\//g,'/')

export def relativePath ...parts
	np.relative(...parts).split('\\').join('/')

export def writeFile src, body
	nfs.promises.writeFile(src,body)

export def readFile src, encoding = 'utf8'
	nfs.promises.readFile(src, encoding)

export def exists src
	let p = nfs.promises.access(src, nfs.constants.F_OK)
	p.then(do yes).catch(do no)

export def rename src, pattern
	let dir = np.dirname(src)
	let ext = np.extname(src)
	let name = np.basename(src,ext)
	return np.join(dir,pattern.replace('*',name))

	let parsed = np.parse(src)
	if typeof pattern == 'string'
		if pattern[0] == '.'
			return np.join(dir,name + pattern)
			parsed.ext = pattern
		elif pattern.indexOf('')
			parsed.name = pattern
	else
		Object.assign(parsed,pattern)
	console.log 'rename',parsed
	return np.format(parsed)
	# let basedir = path.dirname(src)
	# let ext = path.exxtname

# find, remove and return item from array
export def pluck array, cb
	for item,i in array
		if cb(item)
			array.splice(i,1)
			return item
	return null

export def resolveConfig options
	const cwd = options.cwd
	const name = options.config or 'imbaconfig.json'
	try
		let src = np.resolve(cwd or '.',name or 'imbaconfig.json')
		let config = JSON.parse(nfs.readFileSync(src,'utf8'))
		config.#mtime = nfs.statSync(src).mtimeMs or 0
		config.#path = src
		return parseConfig(config)
	catch e
		return parseConfig({})

export def extendObject obj,patch,path = []
	mergeConfig(obj,patch,...path)

export def resolvePath name, cwd = '.', cb = null
	let src = np.resolve(cwd,name)
	let dir = np.dirname(src)
	if nfs.existsSync(src)
		return src
	let up = np.dirname(dir)
	up != dir ? resolvePath(name,up) : null

export def resolveFile name,cwd,handler
	if let src = resolvePath(name,cwd)
		let file = {
			path: src
			body: nfs.readFileSync(src,'utf-8')
		}
		return handler ? handler(file) : file
	return null

export def resolvePackage cwd
	resolveFile('package.json',cwd) do
		let body = JSON.parse($1.body)
		return body

# generates a function that converts integers to a short
# alphanumeric string utilizing the supplied alphabet
export def idGenerator alphabet = 'bcdefghijklmnopqrstuvwxyz'
	let remap = {}
	for k in [0 ... (alphabet.length)]
		remap[k.toString(alphabet.length)] = alphabet[k]
	return do(num)
		num.toString(alphabet.length).split("").map(do remap[$1]).join("")

export def createHash body
	cryptoCreateHash('sha1').update(body).digest('base64').replace(/[\=\+\/]/g,'').slice(0,8).toUpperCase!

export def replaceAll str, pattern, replacement
	str.replace(new RegExp(pattern, 'g'), replacement)

export def injectStringBefore target, toInject, patterns = ['']
	for patt in patterns
		let idx = target.indexOf(patt)
		if idx >= 0
			return target.slice(0,idx) + toInject + target.slice(idx)
	return target

export def slash(str)
	str.replace(/\\/g, "/")

# The top-level @property rules of a stylesheet, as [start,end,key] triples.
# Rules with the same key register the same property in the same way.
def findPropertyRules body
	let rules = []
	let depth = 0
	let i = 0
	let len = body.length
	while i < len
		let chr = body[i]
		if chr == '/' and body[i + 1] == '*'
			let end = body.indexOf('*/',i + 2)
			i = end == -1 ? len : end + 2
			continue
		if chr == '"' or chr == "'"
			i++
			while i < len and body[i] != chr
				i++ if body[i] == '\\'
				i++
		elif chr == '{'
			depth++
		elif chr == '}'
			depth--
		elif chr == '@' and depth == 0 and body.startsWith('@property',i) and (/\s/).test(body[i + 9] or '')
			let end = body.indexOf('}',i)
			break if end == -1
			let key = body.slice(i,end + 1).replace(/\s+/g,' ').replace(/\s?([{};:])\s?/g,'$1')
			rules.push([i,end + 1,key])
			i = end
		i++
	return rules

# Every compiled stylesheet registers the css properties it relies on, so a
# file that merges many of them repeats the same @property rules over and over.
# Takes the stylesheets in the order they are merged and removes each rule that
# is repeated further down. The last one is the one that counts in css, so the
# merged result registers the same properties. With `collapse` the line of a
# removed rule is removed as well, which changes the line numbers.
export def dedupePropertyRules chunks, collapse = no
	let seen = new Set
	let out = chunks.slice(0)
	let idx = chunks.length
	while --idx >= 0
		let body = out[idx]
		continue unless body and body.indexOf('@property') >= 0
		let rules = findPropertyRules(body)
		let nr = rules.length
		while --nr >= 0
			let [start,end,key] = rules[nr]
			unless seen.has(key)
				seen.add(key)
				continue
			if collapse and body[end] == '\n' and (start == 0 or body[start - 1] == '\n')
				end++
			body = body.slice(0,start) + body.slice(end)
		out[idx] = body
	return out

# At-rules whose rules apply to elements like top-level rules do, and at-rules
# that never compete with a style rule. Anything else is left alone.
const GroupRule = /^@(media|supports|container)\b/i
const InertRule = /^@(-\w+-)?(keyframes|font-face|property|page|counter-style|font-feature-values|font-palette-values|position-try|view-transition)\b/i

# The bodies that the compiler shares between the selectors of a stylesheet
# (StyleExtenders in compiler/styler): easing, transforms and outlines.
const HelperBody = /^(--e_b:.*;transition:|transform:translate(3d)?\(var\(--t_x\)|--ol_s:)/

# A selector list is dropped as a whole when the browser cannot read one of its
# selectors. Only lists that every browser reads are joined across stylesheets.
const SafePseudo = /^(::?(before|after)(?![\w-])|:(not|is|where|nth-child|nth-last-child|nth-of-type|nth-last-of-type)\(|:(root|hover|focus|active|disabled|checked|empty|first-child|last-child|only-child|first-of-type|last-of-type)(?![\w-]))/

# The index after the escape, comment or string that starts at i, or i itself
def skipToken text, i
	let chr = text[i]
	if chr == '\\'
		return i + 2
	if chr == '/' and text[i + 1] == '*'
		let end = text.indexOf('*/',i + 2)
		return end == -1 ? text.length : end + 2
	if chr == '"' or chr == "'"
		let k = i + 1
		while k < text.length and text[k] != chr
			k++ if text[k] == '\\'
			k++
		return k + 1
	return i

# The index of the bracket that closes the one at i, or -1
def closingIndex text, i, open, close
	let depth = 0
	let len = text.length
	while i < len
		let k = skipToken(text,i)
		if k > i
			i = k
			continue
		if text[i] == open
			depth++
		elif text[i] == close
			return i if --depth == 0
		i++
	return -1

def splitTopLevel text, separator
	let parts = []
	let depth = 0
	let from = 0
	let i = 0
	let len = text.length
	while i < len
		let k = skipToken(text,i)
		if k > i
			i = k
			continue
		let chr = text[i]
		if chr == '(' or chr == '['
			depth++
		elif chr == ')' or chr == ']'
			depth--
		elif chr == separator and depth == 0
			parts.push(text.slice(from,i).trim!)
			from = i + 1
		i++
	parts.push(text.slice(from).trim!)
	return parts

# Text that is the same when two rules only differ in whitespace. Left as it is
# written when it has a string or an escape, where whitespace can have meaning.
def selectorKey text
	text = text.trim!
	return text if (/["']|\\[\s,]/).test(text)
	text.replace(/\s+/g,' ').replace(/\s?,\s?/g,',')

def bodyKey text
	text = text.trim!
	return text if (/["'\\]/).test(text)
	text = text.replace(/\s+/g,' ').replace(/\s?([;{}])\s?/g,'$1')
	text = text.replace(/(^|;)([\w-]+)\s?:\s?/g,'$1$2:').replace(/\s?!\s?important/gi,'!important')
	text.replace(/;+$/,'')

# The style rules of a stylesheet in the order they are written, including the
# ones inside @media, @supports and @container. A rule or at-rule that is not
# understood is added as an `opaque` item.
def scanStyleRules text, i, ctx, group, sheet, out
	let len = text.length
	while i < len
		let chr = text[i]
		if chr == '}'
			return i
		if chr == ';' or chr.charCodeAt(0) <= 32
			i++
			continue
		if chr == '/' and text[i + 1] == '*'
			i = skipToken(text,i)
			continue

		let start = i
		while i < len
			chr = text[i]
			break if chr == '{' or chr == ';' or chr == '}'
			let k = skipToken(text,i)
			i = k > i ? k : i + 1

		group.items++ if group

		# a statement such as @import
		continue unless i < len and chr == '{'

		let open = i
		let prelude = text.slice(start,open)

		if prelude[0] == '@' and GroupRule.test(prelude)
			let item = {sheet: sheet, start: start, end: len, items: 0, removed: 0, parent: group}
			out.groups.push(item)
			i = scanStyleRules(text,open + 1,ctx + selectorKey(prelude) + '\{',item,sheet,out)
			item.end = i = Math.min(i + 1,len)
			continue

		let close = closingIndex(text,open,'{','}')
		i = close == -1 ? len : close + 1

		if prelude[0] == '@'
			out.rules.push({opaque: yes}) unless InertRule.test(prelude)
			continue

		let body = text.slice(open + 1,i - 1)
		if close == -1 or body.indexOf('\{') >= 0
			out.rules.push({opaque: yes})
			continue

		out.rules.push({
			sheet: sheet
			start: start
			end: i
			selectorEnd: start + prelude.trimEnd!.length
			selector: selectorKey(prelude)
			body: body
			key: bodyKey(body)
			ctx: ctx
			group: group
		})
	return i

# The number of ids a selector counts in its specificity. A pseudo-class that
# takes selectors counts as the most specific of them, and :where() as nothing.
def idCount selector
	let count = 0
	let i = 0
	let len = selector.length
	while i < len
		let k = skipToken(selector,i)
		if k > i
			i = k
			continue
		let chr = selector[i]
		if chr == '#'
			count++
		elif chr == '['
			let close = closingIndex(selector,i,'[',']')
			break if close == -1
			i = close
		elif chr == '('
			let close = closingIndex(selector,i,'(',')')
			break if close == -1
			unless (/:where$/i).test(selector.slice(0,i))
				let inner = splitTopLevel(selector.slice(i + 1,close),',')
				count += Math.max(...inner.map(idCount))
			i = close
		i++
	return count

def isSafeSelector selector
	return no if (/\sof\s/).test(selector)
	let depth = 0
	let i = 0
	let len = selector.length
	while i < len
		let chr = selector[i]
		if chr == '\\'
			i += 2
		elif chr == '['
			let close = closingIndex(selector,i,'[',']')
			return no if close == -1
			i = close + 1
		elif chr == ':'
			let m = selector.slice(i).match(SafePseudo)
			return no unless m
			depth++ if m[0].endsWith('(')
			i += m[0].length
		elif chr == '(' or chr == '"' or chr == "'"
			return no
		elif chr == ')'
			return no if --depth < 0
			i++
		else
			i++
	return depth == 0

# The properties a rule sets, as [name,important] pairs
def declarationsOf body
	let res = []
	for part in splitTopLevel(body,';')
		let idx = part.indexOf(':')
		continue if idx < 1
		let name = part.slice(0,idx).trim!
		name = name.toLowerCase!.replace(/^-(webkit|moz|ms|o)-/,'') unless name.startsWith('--')
		res.push([name,(/!\s*important\s*$/i).test(part)])
	return res

# Whether a declaration of the one property takes part in the cascade of the
# other. `all` sets every property, a shorthand sets its longhands.
def sameProperty a, b
	return a == b if a.startsWith('--') or b.startsWith('--')
	return yes if a == b or a == 'all'
	return no if a == 'transform' or b == 'transform'
	a.startsWith(b + '-') or b.startsWith(a + '-')

def competes rule, helper
	return no unless helper.probe.test(rule.body)
	rule.declarations ||= declarationsOf(rule.body)
	for [name,important] in rule.declarations
		for [other,level] in helper.declarations
			return yes if important == level and sameProperty(name,other)
	return no

def idCounts rule
	rule.ids ||= rule.selectors.map(idCount)

###
Every compiled stylesheet writes the rules it shares with other stylesheets
again: the rules for enter and leave transitions, and one block per helper
(easing, transforms) with the selectors of that stylesheet that use it. Takes
the stylesheets in the order they are merged and returns them with each of
these rules once. Without `collapse` every line stays where it was.

1. A rule that is written again further down, with the same selectors and the
   same body, is removed. Both set the same values with the same specificity
   and the last one wins over everything the first one wins over, so the first
   one never decides anything.

2. Helper blocks with the same body, under the same at-rules, are joined into
   the first of them. That moves the declarations for the selectors of the
   later block up in the file. A declaration only depends on its position
   relative to declarations that set the same property for the same element,
   with the same importance and the same specificity. So the move is safe
   unless such a declaration is written between the two blocks. The helper
   selectors have their `:not(#_)` bumps removed and the values a user sets
   are variables (`--t_x`, `--e_ad`, `--e_rest`) that the body reads, so rules
   compiled from imba styles rarely do this. A hand-written `transform:` or
   `transition:` with a selector without bumps can: a global `.card` rule in
   one file would start to win over the block of another file that is
   imported later. A block is therefore not moved past a rule that sets one of
   its properties (or `all`, or a longhand) with the same importance and with
   a selector that counts as many ids as one of the selectors of the block.
   The block then starts a new shared rule. Joining into the last block
   instead would move a block past the rules of its own stylesheet, which the
   compiler writes after it on purpose.

   Rules with the same body cannot change each others outcome. Rules inside
   at-rules that are not read here (@layer, @scope, nesting) end every shared
   rule. A block with a selector that some browsers cannot read stays where
   it is, since one such selector makes a browser drop the whole rule.
###
export def mergeSharedRules chunks, collapse = no
	let out = chunks.slice(0)
	let scan = {rules: [], groups: []}
	for chunk,nr in chunks
		scanStyleRules(chunk,0,'',null,nr,scan) if chunk

	let rules = scan.rules
	let changed = no

	# 1. remove the rules that are repeated further down
	let seen = new Set
	let idx = rules.length
	while --idx >= 0
		let rule = rules[idx]
		continue if rule.opaque
		let id = rule.ctx + rule.selector + '\{' + rule.key
		if seen.has(id)
			changed = rule.removed = yes
		else
			seen.add(id)

	# 2. join the helper blocks
	let shared = new Map
	let helpers = new Map

	for rule in rules
		if rule.opaque
			shared.clear!
			helpers.clear!
			continue
		continue if rule.removed

		for [key,helper] of helpers
			if key != rule.key and competes(rule,helper)
				rule.selectors ||= splitTopLevel(rule.selector,',')
				helper.barriers.push(idCounts(rule))

		continue unless HelperBody.test(rule.key)
		rule.selectors = splitTopLevel(rule.selector,',')
		continue unless rule.selectors.every(isSafeSelector)

		let helper = helpers.get(rule.key)
		unless helper
			let declarations = declarationsOf(rule.body)
			let names = declarations.map(do $1[0].replace(/[^\w-]/g,''))
			helpers.set(rule.key,helper = {
				declarations: declarations
				probe: new RegExp("{names.join('|')}|\\ball\\s*:",'i')
				barriers: []
			})

		let id = rule.ctx + rule.key
		let target = shared.get(id)
		if target
			let ids = idCounts(rule)
			let nr = target.barrier
			while nr < helper.barriers.length
				if helper.barriers[nr++].some(do ids.indexOf($1) >= 0)
					target = null
					break

		unless target
			rule.barrier = helper.barriers.length
			rule.added = []
			shared.set(id,rule)
			continue

		for selector in rule.selectors
			if target.selectors.indexOf(selector) < 0 and target.added.indexOf(selector) < 0
				target.added.push(selector)
		changed = rule.removed = yes

	return out unless changed

	# an at-rule that is left without rules is removed as well
	for rule in rules when rule.removed and rule.group
		rule.group.removed++
	idx = scan.groups.length
	while --idx >= 0
		let group = scan.groups[idx]
		if group.items > 0 and group.removed == group.items
			group.dead = yes
			group.parent.removed++ if group.parent

	let edits = out.map(do [])
	for group in scan.groups when group.dead and !(group.parent and group.parent.dead)
		edits[group.sheet].push([group.start,group.end,''])
	for rule in rules when !rule.opaque
		if rule.removed
			edits[rule.sheet].push([rule.start,rule.end,'']) unless rule.group and rule.group.dead
		elif rule.added and rule.added.length
			let glue = out[rule.sheet][rule.selectorEnd] == '\{' ? ',' : ', '
			let added = rule.added.map(do $1.replace(/\s*\n\s*/g,' '))
			edits[rule.sheet].push([rule.selectorEnd,rule.selectorEnd,glue + added.join(glue)])

	for list,nr in edits when list.length
		let body = out[nr]
		list.sort(do $2[0] - $1[0])
		for [start,end,text] in list
			if end > start and collapse
				# take the whole line when nothing else is on it
				let from = start
				from-- while from > 0 and (body[from - 1] == ' ' or body[from - 1] == '\t')
				if body[end] == '\n' and (from == 0 or body[from - 1] == '\n')
					start = from
					end++
			elif end > start
				text = body.slice(start,end).replace(/[^\n]+/g,'')
			body = body.slice(0,start) + text + body.slice(end)
		out[nr] = body
	return out
