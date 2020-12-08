const fs = require 'fs'
const path = require 'path'
const readdirp = require 'readdirp'
const utils = require './utils'
const micromatch = require 'micromatch'

import {fdir} from '../../vendor/fdir/index.js'
import SourceFile from './sourcefile'


const readdirpOptions = {
	depth: 5
	fileFilter: ['*.imba','*.imba.mjs']
	directoryFilter: ['!.git', '!*modules','!tmp']
}

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

export class FileNode

	def constructor root, rel, abs
		self.fs = root
		rel = rel
		abs = abs
		cache = {}
		#watchers = new Set
		#watched = no

	def [Symbol.toPrimitive] hint
		abs

	get program
		self.fs.program

	get name
		path.basename(rel)

	def invalidate
		cache = {}
		#imba..invalidate!
		#body = null
		self
	
	def write body
		if #body =? body
			await utils.ensureDir(abs)
			fs.promises.writeFile(abs,body)
	
	def read enc = 'utf8'
		#body or fs.promises.readFile(abs,enc)
	
	def stat
		fs.promises.stat(abs).then(do $1).catch(do blankStat)

	def mtime
		unless #mtime
			let s = await stat!
			#mtime = s.mtimeMs
		return #mtime

	get imba
		return null unless (/\.imba1?$/).test(rel)
		#imba ||= new SourceFile(self)

	get id
		#id ||= program.sourceIdForPath(rel)

	def tmp ns = ''
		self.fs.lookup('.imba/_' + (rel + ns).replace(/\//g,'_$$_'))

	get imba?
		(/\.imba1?$/).test(rel)
	
	def unlink
		fs.promises.unlink(abs)

	def watch observer
		#watchers.add(observer)
		if #watched =? yes
			program.watcher.add(abs)
			# console.log 'now watching file!',rel,abs

	def unwatch observer
		#watchers.delete(observer)
		if #watched and #watchers.size == 0
			#watched = no
			program.watcher.add(abs)
			console.log 'unwatch file!'

# Need to allow proxies to filenodes per project

export default def mount dir, base = '.'
	let cwd = path.resolve(base,dir)
	roots[cwd] ||= new FileSystem(dir,base)

export class FileSystem
	def constructor dir, base, program
		cwd = path.resolve(base,dir)
		program = program
		nodemap = {}
		scanned = null

	def toString do cwd
	def valueOf do cwd
	
	def lookup src
		src = relative(src)
		nodemap[src] ||= new FileNode(self,src,resolve(src))

	def nodes arr
		arr.map do lookup($1)

	def resolve src
		path.resolve(cwd,src)

	def relative src
		path.relative(cwd,resolve(src))

	def writePath src,body
		await utils.ensureDir(resolve(src))
		writeFile(resolve(src),body)

	def writeFile src,body
		fs.promises.writeFile(resolve(src),body)

	def unlink src,body
		fs.promises.unlink(resolve(src))

	def readFile src,enc='utf8'
		fs.promises.readFile(resolve(src),enc)

	def findFiles options = {}
		let res = await readdirp.promise(cwd,Object.assign({},readdirpOptions,options))
		res.map do $1.path

	def stat src
		fs.promises.stat(resolve(src)).then(do $1).catch(do blankStat)

	def prescan
		return if scanned
		scanned = crawl!
		for item in scanned
			let li = item.lastIndexOf('.')
			let ext = item.slice(li + 1) or '*'
			let map = scanned[ext] ||= []
			map.push(item)
		return scanned
		

	def glob match = [], ignore = null, ext = null
		prescan!
		let sources = scanned
		if ext
			sources = []
			if typeof ext == 'string'
				ext = ext.split(',')
			for item in ext
				sources = sources.concat(scanned[item] or [])

		let res = micromatch(sources,match,ignore: ignore)
		return res

	# scanning through the files that are already loaded into the filesystem
	def scan match
		prescan!
		let matched = []
		for src in scanned
			let m = no
			if match isa RegExp
				m = match.test(src)
				matched.push(lookup(src)) if m
		return matched

	def crawl o = {}
		# let sep = path.sep
		let slice = cwd.length + 1
		let api = (new fdir).crawlWithOptions(cwd,{
			includeBasePath: true
			# includeDirs: true
			group: false
			includeDirs: false
			maxDepth: 8
			filters: [do $1[0] != '.']
			exclude: do
				if $3 == 7 and o.rootDirs and !o.rootDirs[$1]
					return yes
				return (/^(\.|node_modules)/).test($1)
		})

		return api.sync!.map do $1.slice(slice)

		let results = api.sync!
		return results
		let entries = []
		for dir in results
			for file in dir.files
				let full = dir.dir + sep + file
				entries[full] = yes

		return entries
