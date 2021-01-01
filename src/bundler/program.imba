const utils = require './utils'
const np = require 'path'
const micromatch = require 'micromatch'
const esbuild = require 'esbuild'
const workerPool = require 'workerpool'
const workerScript = np.resolve(__dirname,'..','compiler-worker.js')

import {startWorkers} from './pooler'
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
		package = options.package

		fs = new FileSystem(options.cwd,'.',self)
		cache = new Cache(self)

		manifest = fs.lookup('imbabuild.json').load!

		watcher = options.watch ? chokidar.watch([cwd],{
			ignoreInitial: true,
			depth: 0,
			ignored: ['.*','.git/**','.cache'],
			cwd: cwd
		}) : new VirtualWatcher

		watcher.on('change') do(src,stats)
			console.log 'watcher on change',src
			fs.touchFile(src)
			#bundler..scheduleRebuild!

		watcher.on('unlink') do(src,stats)
			fs.removeFile(src)
			#bundler..scheduleRebuild!

		watcher.on('add') do(src,stats)
			fs.addFile(src)
			#bundler..scheduleRebuild!

		watcher.on('raw') do(event,src,details)
			yes

		watcher.add(np.resolve(imbaPath,'src'))
		self

	get cwd
		fs.cwd

	get imbaPath
		options.imbaPath

	get program
		self

	get resolver
		#resolver ||= new Resolver(config: config, files: fs.files, program: self, fs: fs)

	get bundler
		#bundler ||= new Bundler(config,options,self)

	get server
		#server ||= new Serve(self,options)

	get workers
		# TODO add reference counting and start/stop to allow correctly terminating etc
		#workers ||= startWorkers! # workerPool.pool(workerScript, maxWorkers:2)

	def esb
		#hasesb = yes
		console.log 'called program esb'
		#esb ||= await esbuild.startService({})

	def setup
		#setup ||= new Promise do(resolve)
			await cache.setup!
			return resolve(self)

	def build
		await setup!
		await bundler.run!
		await cache.save!
		unless options.watch
			workers.terminate!

	def clean
		let sources = fs.nodes fs.find(/\.imba1?(\.web)?\.\w+$/,'mjs,js,cjs,css,meta')

		for file in sources
			await file.unlink!

		log.info 'cleaned %d files in %elapsed',sources.length
		fs.reset!
		return

	def run
		if self[options.command] isa Function
			let out = await self[options.command]()
			if !options.watch
				if #workers
					#workers.terminate!
			return out

	def dispose
		if #hasesb
			(await esb!).stop!
		if #workers
			#workers.terminate!