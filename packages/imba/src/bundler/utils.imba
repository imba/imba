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
