const utils = require './utils'
const path = require 'path'
const readdirp = require 'readdirp'
const micromatch = require 'micromatch'

import {FileSystem} from './fs'
import chokidar from 'chokidar'
import {Logger} from './logger'
import {Bundler} from './bundler'
const esbuild = require 'esbuild'

class VirtualWatcher

	def on ev
		yes

	def add watched
		yes

	def stop
		yes


export default class Program

	def constructor config, options
		config = config
		options = options
		fs = new FileSystem(options.cwd,'.',self)
		log = new Logger(self)
		idFaucet = utils.idGenerator!
		idmap = {}
		sources = {}

		watcher = options.watch ? chokidar.watch([]) : new VirtualWatcher

		watcher.on('change') do(src,stats)
			let file = fs.lookup(src)
			console.log 'watcher changed?!',src,stats
			file.invalidate!
		self

	get cwd
		fs.cwd

	def sourceIdForPath src
		unless idmap[src]
			let nr = Object.keys(idmap).length
			idmap[src] = idFaucet(nr) + "0"
		return idmap[src]


	def add src
		sources[fs.relative(src)] ||= fs.lookup(src)

	def esb
		#esb ||= await esbuild.startService({})

	def setup
		#setup ||= new Promise do(resolve)
			esb! # start setting up the service

			filters = {
				depth: 5
				fileFilter: '*.imba'
				directoryFilter: ['!.git', '!*modules','!tmp','!.imba']
			}

			let t = Date.now!
			# Should rather just run through the directories recursively
			# without fancy filtering etc

			let files = await readdirp.promise(cwd,filters)
			let paths = files.map(do $1.path)

			let matches = match(paths)
			console.log 'found files',filters,matches
			
			for src in matches
				add(src)
			resolve(self)

	def match files
		let matchers = []
		return files unless config.include or config.exclude
		return micromatch(files,config.include or [],ignore: config.exclude)

	def prepare
		await setup!
		let promises = for own src,file of sources when file.imba
			# console.log 'handle file',file
			file.imba..prepare!
		await Promise.all(promises)

	def transpile
		await prepare!
		log.info 'transpiled in %elapsed'

	def build
		await setup!
		# await prepare!
		await bundler.run!

	def watch
		await build!

	def run
		if self[options.command] isa Function
			let out = await self[options.command]()
			#esb.stop! if #esb and !options.watch
			return out

	get bundler
		#bundler ||= new Bundler(config,options,self)
