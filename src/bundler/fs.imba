const nodefs = require 'fs'
const np = require 'path'
const utils = require './utils'
const micromatch = require 'micromatch'

import {fdir} from '../../vendor/fdir/index.js'
import {Resolver} from './resolver'
import {parseAsset} from '../compiler/assets'
import ChangeLog from './changes'

const blankStat = {
	size: 0,
	blocks: 0,
	atimeMs: 0,
	mtimeMs: 0,
	ctimeMs: 0,
	birthtimeMs: 0,
	atime: "",
	mtime: "",
	ctime: "",
	birthtime: ""
}

const roots = {}

const FLAGS = {
	CHECKED: 1
	EXISTS: 2
	REGISTERED: 4
	WATCHED: 8
	RESOLVED: 16
	REMOVED: 32
	ADDED: 64
}

const matchToRegexCache = {}

def matchToRegex str 
	matchToRegexCache[str] ||= if true
		str = str.replace(/(\*\*|\*|\.)/g) do(m,t)
			if t == '**'
				"(.*)"
			elif t == '*'
				"([^\/]+)"
			elif t == '.'
				"\\."
		new RegExp(str)
		
# console.log matchToRegex("*.imba$")
# console.log matchToRegex("*.(imba|js|cjs)$")

# special list with optimizations for filtering etc
export class FSTree < Array

	def constructor ...items
		super(...items)
		#cache = {}

	def withExtension ext
		match(".({ext.replace(/,/g,'|')})$")

	def match match
		if typeof match == 'string'
			let regex = matchToRegex(match)
			#cache[match] ||= filter(do regex.test($1.rel))

	def add node
		let idx = indexOf(node)
		if idx == -1
			push(node)
			#cache = {}
		self

	get paths
		map do $1.rel

	def remove node
		let idx = indexOf(node)
		if idx >= 0
			splice(idx,1)
			for own key, res of #cache
				res.remove(node)
		return self
	
export class FSNode

	static def create program, src, abs
		let ext = src.slice(src.lastIndexOf('.'))
		let types = {
			'.json': JSONFile
			'.imba': ImbaFile
			'.imba1': Imba1File
			'.svg': SVGFile
		}

		let cls = types[ext] or FileNode
		new cls(program,src,abs)

	def constructor root, rel, abs
		self.fs = root
		rel = rel
		abs = abs
		flags = 0
		#watchers = new Set
		#watched = no
	
	get program
		self.fs.program

	get name
		np.basename(rel)

	def memo key, cb
		program.cache.memo("{rel}:{key}",mtimesync,cb)

	def watch observer
		#watchers.add(observer)
		if #watched =? yes
			program.watcher.add(abs)
			# console.log 'watch',abs

	get registered?
		flags & FLAGS.REGISTERED

	def register
		if flags |=? FLAGS.REGISTERED
			self.fs.#tree.add(self)
		self
	
	def deregister
		if flags ~=? FLAGS.REGISTERED
			# console.log 'now deregistering node',rel
			self.fs.#tree.remove(self)

	def touch
		#mtime = Date.now!
		#body = undefined
		self

	def existsSync
		return true if registered?
		# return false if deregistered I presume
		# console.log 'check nodefs.existsSync',abs
		let real = nodefs.existsSync(abs)
		if real
			register!
			return yes
		else
			return no

	def unwatch observer
		#watchers.delete(observer)
		if #watched and #watchers.size == 0
			#watched = no
			program.watcher.unwatch(abs)
			# console.log 'unwatch',abs


export class DirNode < FSNode

export class FileNode < FSNode

	def constructor root, rel, abs
		super
		cache = {}

	def [Symbol.toPrimitive] hint
		abs

	get reldir
		rel.slice(0,rel.lastIndexOf('/') + 1)
	
	get absdir
		abs.slice(0,abs.lastIndexOf('/') + 1)

	get dir
		self.fs.lookup(absdir,DirNode)
	
	def write body
		if #body =? body
			await utils.ensureDir(abs)
			nodefs.promises.writeFile(abs,body)

	def writeSync body
		if #body =? body
			nodefs.writeFileSync(abs,body)

	def read enc = 'utf8'
		#body or nodefs.promises.readFile(abs,enc)
	
	def readSync enc = 'utf8'
		#body ||= nodefs.readFileSync(abs,enc)
	
	def stat
		nodefs.promises.stat(abs).then(do $1).catch(do blankStat)

	get mtimesync
		#mtime ||= (existsSync! ? nodefs.statSync(abs).mtimeMs : 1)

	def mtime
		unless #mtime
			let s = await stat!
			#mtime = s.mtimeMs
		return #mtime

	get id
		#id ||= program.sourceIdForPath(rel)

	def unlink
		nodefs.promises.unlink(abs)

	def extractStarPattern pat
		let regex = new RegExp(pat.replace(/\*/g,'([^\/]+)'))
		return (rel.match(regex) or []).slice(1)


export class ImbaFile < FileNode

	def compile o
		memo(o.platform) do
			o = Object.assign({
				platform: 'node',
				format: 'esm',
				raw: true
				imbaPath: 'imba'
				styles: 'extern'
				hmr: true
				bundle: false
				sourcePath: rel,
				sourceId: id,
				cwd: fs.cwd
			},o)

			let code = await read!

			let params = {
				code: code
				options: o
				type: 'imba'
			}

			let t = Date.now!
			let out = await program.workers.exec('compile', [params])
			program.log.success 'compile %path in %ms',rel,Date.now! - t
			return out

export class Imba1File < FileNode

	def compile o
		memo(o.platform) do
			o = Object.assign({
				platform: 'node',
				format: 'esm',
				sourcePath: rel,
				filename: rel,
				inlineHelpers: 1,
				cwd: fs.cwd
			},o)

			o.target = o.platform

			let code = await read!

			let params = {
				code: code
				options: o
				type: 'imba1'
			}

			let t = Date.now!
			let out = await program.workers.exec('compile', [params])
			program.log.success 'compile %path in %ms',rel,Date.now! - t
			return out


export class SVGFile < FileNode

	def compile o
		memo(o.format) do
			let svgbody = await read!
			let parsed = parseAsset({body: svgbody})
			return {js: "export default {JSON.stringify(parsed)};"}

export class JSONFile < FileNode

	def constructor
		super

	def load
		try 
			raw = readSync!
			data = JSON.parse(raw)
		catch
			data = {}
		return self
		
	def save
		let out = JSON.stringify(data,null,2)
		if out != raw
			raw = out
			writeSync(out)
		self

export class FileSystem
	def constructor dir, base, program
		cwd = np.resolve(base,dir)
		program = program
		nodemap = {}
		existsCache = {}
		changelog = new ChangeLog
		#files = null
		#tree = new FSTree
		#map = {}

	def toString do cwd
	def valueOf do cwd

	def existsSync src
		let entry = nodemap[src]
		if entry
			return entry.existsSync!
		else
			# return false
			# if the filesystem is live
			# console.log 'checking node',src
			if existsCache[src] != undefined
				return existsCache[src]
			return existsCache[src] = nodefs.existsSync(resolve(src))
	
	def lookup src, typ = FileNode
		src = relative(src)
		nodemap[src] ||= typ.create(self,src,resolve(src))

	def nodes arr
		arr.map do lookup($1)

	get outdir
		program.outdir

	get files
		prescan! unless #files
		return #files

	def resolve ...src
		np.resolve(cwd,...src)

	def relative src
		np.relative(cwd,resolve(src))

	def writePath src,body
		await utils.ensureDir(resolve(src))
		writeFile(resolve(src),body)

	def writeFile src,body
		nodefs.promises.writeFile(resolve(src),body)

	def unlink src,body
		nodefs.promises.unlink(resolve(src))

	def readFile src,enc='utf8'
		nodefs.promises.readFile(resolve(src),enc)

	def stat src
		nodefs.promises.stat(resolve(src)).then(do $1).catch(do blankStat)

	def touchFile src
		changelog.mark(src)
		lookup(src).touch!
		
	def addFile src
		changelog.mark(src)
		lookup(src).register!
		
	def removeFile src
		changelog.mark(src)
		lookup(src).deregister!
		
	def prescan items = null
		return #files if #files
		#files = items or crawl!
		for item in #files
			let li = item.lastIndexOf('.')
			let ext = item.slice(li) or '.*'
			let map = #files[ext] ||= []
			unless map.push
				console.log 'ext?!',ext,item
			map.push(item)
		# should we drop the abspart here?
		return #files
	
	def reset
		#files = null
		self

	def glob match = [], ignore = null, ext = null
		prescan!

		let sources = #tree
		if ext
			sources = #tree.withExtension(ext)

		if match isa RegExp and !ignore
			return sources.filter do match.test($1.rel)
		
		elif typeof match == 'string'
			if match.indexOf('*') >= 0
				match = [match]
			else
				# not working
				return new FSTree(existsSync(match) ? lookup(match) : null)

		if !match or match.length == 0
			return sources.slice(0) if !ignore
			match = ['*']

		let res = micromatch(sources.paths,match,ignore: ignore)
		
		return new FSTree(...res.map(do nodemap[$1]))

	def find regex, ext = null
		prescan!
		let sources = ext ? [] : #files

		if typeof ext == 'string'
			ext = ext.split(',')

		if ext isa Array
			for item in ext
				sources = sources.concat(#files['.' + item] or [])
		
		return sources.filter do regex.test($1)

	# scanning through the files that are already loaded into the filesystem
	def scan match
		prescan!
		let matched = []
		for src in #files
			let m = no
			if match isa RegExp
				m = match.test(src)
				matched.push(lookup(src)) if m
		return matched

	def crawl o = {}
		# let sep = path.sep
		let slice = cwd.length + 1
		let filter = do(a) a[0] != '.'
		let grouped = yes
		let api = (new fdir).crawlWithOptions(cwd,{
			includeBasePath: !grouped
			# includeDirs: true
			group: grouped
			includeDirs: false
			maxDepth: 8
			filters: [filter]
			exclude: do
				if $3 == 7 
					if o.includeRoots and !o.includeRoots[$1]
						return yes
					if o.excludeRoots and o.excludeRoots[$1]
						return yes

				return (/^(\.|node_modules)/).test($1)
		})

		let res = api.sync!

		unless grouped
			return res.map do $1.slice(slice)

		let paths = []
		for entry in res
			let absdir = entry.dir
			let reldir = absdir.slice(slice)
			let dir = nodemap[reldir] ||= new DirNode(self,reldir,absdir)
			# dir.register!

			for f in entry.files
				let rel = reldir + '/' + f
				let abs = absdir + '/' + f
				let file = nodemap[rel] ||= FSNode.create(self,rel,abs)
				file.register!
				paths.push(rel)
		# console.log 'paths',paths
		return paths