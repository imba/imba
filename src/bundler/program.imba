const utils = require './utils'
const path = require 'path'
const readdirp = require 'readdirp'
const micromatch = require 'micromatch'

import {FileSystem} from './fs'
import chokidar from 'chokidar'
import {Logger} from './logger'
import {Bundler} from './bundler'
import {Resolver} from './resolver'
import Component from './component'
const esbuild = require 'esbuild'

class VirtualWatcher

	def on ev
		yes

	def add watched
		yes

	def path
		self

	def stop
		yes

export default class Program < Component

	def constructor config, options
		super()
		key = Symbol!
		config = config
		options = options
		outdir = config.outdir or 'build'
		mtime = options.force ? Date.now! : (options.mtime or 0)
		console.log 'program mtime',mtime
		fs = new FileSystem(options.cwd,'.',self)
		log = new Logger(self)

		manifest = fs.lookup('imbabuild.json').load!
		
		idFaucet = utils.idGenerator!
		idmap = {}
		sources = {}
		jobs = []
		included = new Set
		compiled = new Set
		
		watcher = options.watch ? chokidar.watch([],{
			ignoreInitial: true,
			depth: 5,
			ignored: '.*',
			cwd: cwd
		}) : new VirtualWatcher

		watcher.on('change') do(src,stats)
			let file = fs.lookup(src)
			console.log 'watcher changed?!',src,stats
			file.invalidate!

		watcher.on('unlink') do(src,stats)
			console.log "watcher unlink {src}"
			fs.removeFile(src)

		watcher.on('add') do(src,stats)
			console.log "watcher add {src}"
			fs.addFile(src)
			console.log fs.#tree.withExtension('svg').paths

		watcher.on('raw') do(event,src,details)
			console.log "watch {event}",src
			yes
		self

	get cwd
		fs.cwd

	get resolver
		#resolver ||= new Resolver(config: config, files: fs.files, program: self, fs: fs)

	def sourceIdForPath src
		unless idmap[src]
			let nr = Object.keys(idmap).length
			idmap[src] = idFaucet(nr) + "0"
		return idmap[src]


	def add src
		sources[fs.relative(src)] ||= fs.lookup(src)

	def include file
		unless included.has(file)
			console.log 'including file!',file
			included.add(file)
		self

	def queue promise
		# console.log 'queue promise',!!promise
		if promise[key]
			console.log 'promise has already been queued'
		else
			promise[key] = 1
			jobs.push(promise)
		return promise
	
	def flush
		# copy all current promises
		let promises = jobs.slice(0)
		jobs = []
		await Promise.all(promises)
		if jobs.length
			await flush!
		return true

	def esb
		#hasesb = yes
		#esb ||= await esbuild.startService({})

	def setup
		#setup ||= new Promise do(resolve)
			esb!
			return resolve(self)

	def transpile
		await clean! if options.clean
		let sources = fs.glob(config.include,config.exclude,'imba,imba1')
		log.info 'found %d sources to compile in %elapsed',sources.length # ,sources.map do $1.rel
		console.log 'found sources',sources.paths

		for source in sources
			source.imba.load!

		await flush!
		# log.info 'transpiled %d files in %elapsed',sources.length

		if options.watch
			log.info 'start watching?'
			# hmm - we want to watch all directories mentioned in paths etc
			for source in sources
				source.dir.watch!
			yes

		# console.log Object.keys(fs.#map)
		# console.log fs.#tree
		# console.log fs.#tree.match('.(imba|js)$').paths
		# console.log fs.#tree.withExtension('css').paths


	def build
		await setup!
		bundler
		await transpile!
		await bundler.run!
		# watcher.on('change') do(src,stats)
		# 	clearTimeout(#rebuild)
		# 	#rebuild = setTimeout(&,10) do bundler.rebuild!
		# if options.watch
		#	setInterval(&,15000) do bundler.rebuild!`

	def watch
		await build!

	def clean
		# let sources = fs.nodes fs.glob(['**/*.imba.mjs','**/*.imba.js','**/*.imba.css'],null,'mjs,js,css,meta')
		let sources = fs.nodes fs.find(/\.imba1?(\.web)?\.\w+$/,'mjs,js,cjs,css,meta')

		for file in sources
			await file.unlink!

		log.info 'cleaned %d files in %elapsed',sources.length
		fs.reset!
		return

		let remove = fs.scan(/\.imba\.(css|mjs|js|tjs)$/)
		# console.log 'found files',Object.keys(fs.nodes).length,remove

		let files = await log.time 'crawl' do
			fs.crawl!

		# console.log 'files',files
		
		let files2 = await log.time 'crawl2' do
			fs.crawl(rootDirs: {src: 1, scripts: 1})
		# console.log files2

		for item in remove
			await item.unlink!
		self

	def start
		return
		console.log 'starting!!'
		options.serve = yes
		await build!

	def run
		if self[options.command] isa Function
			let out = await self[options.command]()
			if #hasesb and !options.watch
				(await esb!).stop!
			return out

	get bundler
		#bundler ||= new Bundler(config,options,self)
