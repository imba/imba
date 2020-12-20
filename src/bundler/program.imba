const utils = require './utils'
const np = require 'path'
const micromatch = require 'micromatch'
const esbuild = require 'esbuild'
const workerPool = require 'workerpool'
const workerScript = np.resolve(__dirname,'compiler-worker.js')

import {FileSystem} from './fs'
import chokidar from 'chokidar'
import {Logger} from './logger'
import {Bundler} from './bundler'
import {Resolver} from './resolver'
import Component from './component'
import Cache from './cache'
import Serve from './serve'



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
		# console.log 'program mtime',mtime
		fs = new FileSystem(options.cwd,'.',self)
		log = new Logger(self)
		cache = new Cache(self,fs.lookup('.imba/stuff.json'))
		cache.mintime = mtime
		manifest = fs.lookup('imbabuild.json').load!
		buildinfo = fs.lookup('.imba/cache.json').load!		
		
		idFaucet = utils.idGenerator!
		idmap = {}
		sources = {}
		jobs = []
		included = new Set
		compiled = new Set
		
		watcher = options.watch ? chokidar.watch([cwd],{
			ignoreInitial: true,
			depth: 5,
			ignored: ['.*','.git/**'],
			cwd: cwd
		}) : new VirtualWatcher

		watcher.on('change') do(src,stats)
			console.log "watcher change {src}"
			fs.touchFile(src)
			#bundler..scheduleRebuild!

		watcher.on('unlink') do(src,stats)
			# console.log "watcher unlink {src}"
			fs.removeFile(src)
			#bundler..scheduleRebuild!

		watcher.on('add') do(src,stats)
			# console.log "watcher add {src}"
			fs.addFile(src)
			#bundler..scheduleRebuild!


		watcher.on('raw') do(event,src,details)
			# console.log "watch {event}",src
			yes

		watcher.add(np.resolve(imbaPath,'src'))
		self

	get cwd
		fs.cwd

	get imbaPath
		options.imbaPath

	get resolver
		#resolver ||= new Resolver(config: config, files: fs.files, program: self, fs: fs)

	get bundler
		#bundler ||= new Bundler(config,options,self)

	get server
		#server ||= new Serve(self,options)

	get workers
		#workers ||= workerPool.pool(workerScript, maxWorkers:4)

	def sourceIdForPath src
		cache.alias(src)
		# unless idmap[src]
		#	let nr = Object.keys(idmap).length
		#	idmap[src] = idFaucet(nr) + "0"
		# return idmap[src]

	def add src
		sources[fs.relative(src)] ||= fs.lookup(src)

	def queue promise
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
			await cache.setup!
			return resolve(self)

	def transpile
		await clean! if options.clean
		let sources = fs.glob(config.include,config.exclude,'imba,imba1')
		log.info 'found %d sources to compile in %elapsed',sources.length # ,sources.map do $1.rel
		await flush!
		self

	def build
		await setup!
		await bundler.run!
		await cache.save!

	def watch
		await build!

	def clean
		let sources = fs.nodes fs.find(/\.imba1?(\.web)?\.\w+$/,'mjs,js,cjs,css,meta')

		for file in sources
			await file.unlink!

		log.info 'cleaned %d files in %elapsed',sources.length
		fs.reset!
		return

	def start
		options.serve = yes

		if options.build
			await build!

		if options.main
			console.log 'check if main exists?',options.main

		# find the scripts to start
		let scripts = []

		if options.main
			scripts.push({exec: options.main})
		elif config.serve
			scripts.push(config.serve)
		server.start(scripts)

	def run
		if self[options.command] isa Function
			let out = await self[options.command]()
			if !options.watch
				if #hasesb
					(await esb!).stop!
				if #workers
					#workers.terminate!
			return out

	