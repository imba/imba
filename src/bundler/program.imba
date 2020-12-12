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

	def stop
		yes

export default class Program < Component

	def constructor config, options
		super()
		key = Symbol!
		config = config
		options = options
		outdir = config.outdir or 'build'
		mtime = options.force ? Date.now! : 0
		fs = new FileSystem(options.cwd,'.',self)
		log = new Logger(self)
		
		idFaucet = utils.idGenerator!
		idmap = {}
		sources = {}
		jobs = []
		included = new Set
		compiled = new Set

		watcher = options.watch ? chokidar.watch([]) : new VirtualWatcher

		watcher.on('change') do(src,stats)
			let file = fs.lookup(src)
			console.log 'watcher changed?!',src,stats
			file.invalidate!
		self

	get cwd
		fs.cwd

	get resolver
		#resolver ||= new Resolver(config: config, files: fs.files, program: self)

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
		let sources = fs.nodes fs.glob(config.include,config.exclude,'imba,imba1')
		log.info 'found %d sources to compile in %elapsed',sources.length # ,sources.map do $1.rel
		# get the stats for them as well
		# we do need the id mappings?
		# console.log fs.files.imba
		let stack = {
			promises: []
			promise: do this.promises.push($1)
			resolver: resolver
		}

		# run through an include all he sources

		# then start building

		
		for source in sources
			source.imba.load!

		await flush!
		# await Promise.all(promises)
		# await Promise.all(stack.promises)

		# now write as well?

		log.info 'transpiled %d files in %elapsed',sources.length

	def build
		await setup!
		await transpile!
		await bundler.run!

	def watch
		await build!

	def clean
		# let sources = fs.nodes fs.glob(['**/*.imba.mjs','**/*.imba.js','**/*.imba.css'],null,'mjs,js,css,meta')
		let sources = fs.nodes fs.find(/\.imba1?\.\w+$/,'mjs,js,cjs,css,meta')

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

	def run
		if self[options.command] isa Function
			let out = await self[options.command]()
			if #hasesb and !options.watch
				(await esb!).stop!
			return out

	get bundler
		#bundler ||= new Bundler(config,options,self)
