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

		mtime = options.force ? Date.now! : 0
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
		#hasesb = yes
		#esb ||= await esbuild.startService({})

	def setup
		#setup ||= new Promise do(resolve)
			esb!
			return resolve(self)


	def match files
		let matchers = []
		return files unless config.include or config.exclude
		return micromatch(files,config.include or [],ignore: config.exclude)

	def prepare
		await setup!
		let promises = for own src,file of sources when file.imba
			file.imba..prepare!
		await Promise.all(promises)

	def transpile
		# await prepare!
		let sources = fs.nodes fs.glob(config.include,config.exclude,'imba')
		# get the stats for them as well
		# we do need the id mappings?

		let promises = for source in sources
			source.imba.prebuild!

		await Promise.all(promises)

		log.info 'transpiled %d files in %elapsed',promises.length


	def build
		await setup!
		await transpile!
		await bundler.run!

	def watch
		await build!

	def clean
		let sources = fs.nodes fs.glob(['**/*.imba.mjs','**/*.imba.css'],null,'mjs,js,css,meta')

		for file in sources
			await file.unlink!

		log.info 'cleaned %d files in %elapsed',sources.length
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
