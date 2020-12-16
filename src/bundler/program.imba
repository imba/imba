const utils = require './utils'
const np = require 'path'
const micromatch = require 'micromatch'

import {FileSystem} from './fs'
import chokidar from 'chokidar'
import {Logger} from './logger'
import {Bundler} from './bundler'
import {Resolver} from './resolver'
import Component from './component'
import Cache from './cache'
const esbuild = require 'esbuild'

const workerPool = require('workerpool')
const workerScript = np.resolve(__dirname,'compiler-worker.js')

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
		
		watcher = options.watch ? chokidar.watch([],{
			ignoreInitial: true,
			depth: 5,
			ignored: '.*',
			cwd: cwd
		}) : new VirtualWatcher

		watcher.on('change') do(src,stats)
			let file = fs.lookup(src)
			file.invalidate!
			fs.touchFile(src)
			#bundler..scheduleRebuild!

		watcher.on('unlink') do(src,stats)
			console.log "watcher unlink {src}"
			fs.removeFile(src)
			#bundler..scheduleRebuild!

		watcher.on('add') do(src,stats)
			console.log "watcher add {src}"
			fs.addFile(src)
			#bundler..scheduleRebuild!


		watcher.on('raw') do(event,src,details)
			# console.log "watch {event}",src
			yes
		self

	get cwd
		fs.cwd

	get resolver
		#resolver ||= new Resolver(config: config, files: fs.files, program: self, fs: fs)

	get bundler
		#bundler ||= new Bundler(config,options,self)

	get workers
		#workers ||= workerPool.pool(workerScript, maxWorkers:2)

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
		return
		options.serve = yes
		await build!

	def run
		if self[options.command] isa Function
			let out = await self[options.command]()
			if !options.watch
				if #hasesb
					(await esb!).stop!
				if #workers
					#workers.terminate!
			return out

	