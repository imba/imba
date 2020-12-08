const fs = require 'fs'
const path = require 'path'
const readdirp = require 'readdirp'
const utils = require './utils'

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
const nodes = {}

export class FileNode

	def constructor root, rel, abs
		self.fs = root
		rel = rel
		abs = abs
		cache = {}
		#watchers = new Set
		#watched = no

	get program
		self.fs.program

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

	get imba
		return null unless (/\.imba1?$/).test(rel)
		#imba ||= new SourceFile(self)

	get id
		#id ||= program.sourceIdForPath(rel)

	def tmp ns = ''
		self.fs.lookup('.imba/_' + (rel + ns).replace(/\//g,'_$$_'))

	get imba?
		(/\.imba1?$/).test(rel)

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
		#cache = {}

	def toString do cwd
	def valueOf do cwd
	
	def lookup src
		src = relative(src)
		#cache[src] ||= new FileNode(self,src,resolve(src))

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