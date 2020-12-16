import chokidar from 'chokidar'
# import esbuild from 'esbuild'
const esbuild = require 'esbuild'
const nodefs = require 'fs'
const path = require 'path'
const utils = require './utils'
import mountfs from './fs'
import Component from './component'
import {Server} from './server'
import {Logger} from './logger'
import {Bundle} from './bundle'

export class Bundler < Component
	def constructor config, options, program
		super()
		#key = Symbol!
		cwd = options.cwd
		config = config
		options = options
		bundles = []
		sourceIdMap = {}
		program = program
		pathLookups = {}
		# watcher = options.watch ? chokidar.watch([]) : null
		log = new Logger
		
		env = options.env or process.env.NODE_ENV or 'development'
		env = 'development' if env == 'dev' or options.dev
		env = 'production' if env == 'prod' or options.prod

		manifestpath = path.resolve(cwd,'manifest.json')

		try
			manifest = JSON.parse(nodefs.readFileSync(manifestpath,'utf-8'))
			sourceIdMap = manifest.idmap or {}
		catch
			manifest = {}

		#cache = {}
		#dirtyInputs = new Set
		#watchedFiles = {}
		#timestamps = {}

		return self

	def absp ...src
		path.resolve(cwd,...src)

	def relp src
		path.relative(cwd,src)

	get package
		options.package or {}		

	get fs
		program.fs

	get puburl do config.puburl or '/assets/'
	get basedir do config.basedir or './'
	get outdir do config.outdir or './build'
	get pubdir do config.pubdir or 'dist/web'  # './build/public'
	get libdir do config.libdir or 'dist' # + '/server'  # './build/server'

	get incremental?
		options.watch

	get dev?
		env == 'development'

	get prod?
		env == 'production'

	def sourceIdForPath src
		let map = sourceIdMap
		src = relp(src)

		unless map[src]
			let gen = #sourceIdGenerator ||= utils.idGenerator!
			let nr = Object.keys(map).length
			map[src] = gen(nr) + "0"

		return map[src]

	def parseEntryPoints item
		if typeof item == 'string'
			return parseEntryPoints([item])
		if item isa Array
			let files = []
			for entry,i in item
				if entry.indexOf('*') >= 0
					let paths1 = fs.glob([entry])
					# console.log 'expand entries',entry,paths1
					
					let paths = await utils.expandPath(entry)
					files.push(...paths)
				else
					files.push(entry)

			return files
		elif item and item.entryPoints
			parseEntryPoints(item.entryPoints)

	def time name = 'default'
		let now = Date.now!
		let prev = #timestamps[name] or now
		let diff = now - prev
		#timestamps[name] = now		
		return diff
	
	def timed name = 'default'
		let str = "time {name}: {time(name)}"

	get client
		bundles.find do $1.name == 'client'
		
	def setup
		#setup ||= new Promise do(resolve)
			esb = await (program ? program.esb! : esbuild.startService!)

			time('setup')
			let entries = []
			let shared = {}

			if config.node
				entries.push(config.node)

			if config.browser
				entries.push(config.browser)

			if config.entries
				for own key,value of config.entries
					continue if value.skip
					entries.push cfg

			bundles = for cfg in entries
				continue unless cfg.entryPoints or cfg.exports
				cfg.loader = Object.assign({},utils.defaultLoaders,cfg.loader or {})
				cfg.format = 'cjs' if cfg.platform == 'node' and !cfg.format
				# cfg.entryPoints = fs.glob(cfg.entryPoints or [],null,'imba')
				
				new Bundle(self,cfg)

			# bundles = entries.map do new Bundle(self,$1)

			for bundle in bundles
				await bundle.setup!

			log.info 'setup %ms',time('setup')
			resolve(self)

	def run
		await setup!
		time 'build'
		let builds = for bundle in bundles
			bundle.build!
		await Promise.all(builds)
		log.info 'bundled in %elapsed' # ,time('build')
		write!


		if options.watch
			setInterval(&,5000) do rebuild(yes)
		# 	program.watcher.on('change') do
		# 		clearTimeout(#rebuildTimeout)
		# 		#rebuildTimeout = setTimeout(&,20) do
		# 			# don't queue yet if we are already rebuilding
		# 			rebuild!

	def scheduleRebuild
		clearTimeout(#rebuildTimeout)
		#rebuildTimeout = setTimeout(&,20) do rebuild!
		self

	def rebuilt bundle
		self

	def rebuild force? = no
		let t = Date.now!
		time 'rebuild'
		clearTimeout(#rebuildTimeout)
		let changes = fs.changelog.pull(self)
		
		let dirty = []
		for bundle in bundles
			if force? or changes.find(do bundle.pathLookups[$1])
				dirty.push(bundle)

		# let changes = Array.from(#dirtyInputs)
		# #dirtyInputs.clear!
		# let dirtyBundles = bundles # new Set
		# for bundle in bundles
		# 	for input in changes
		# 		if bundle.inputs[input]
		# 			dirtyBundles.add(bundle)

		console.log 'rebuild based on changes in files?',changes,dirty.length

		return self unless dirty.length

		log.info 'rebuilding'
		# await Promise.all Array.from(dirtyBundles).map do $1.rebuild!
		let awaits = for item of dirty
			item.rebuild!

		await Promise.all(awaits) 
		log.info 'finished rebuilding in %ms',time('rebuild')
		write!
		log.info 'finished rebuilding in %ms',Date.now! - t
		self

	def write bundles = self.bundles
		let t = Date.now!
		# watch / unwatch
		# for bundle in bundles
		# 	for own src,value of bundle.inputs
		# 		# TODO start watching essentially all files instead?
		# 		if !src.match(/^[\w\-]+\:/) and src.match(/\.(imba|css|svg)$/)
		# 			# watch.add( absp(src) )
		# 			# console.log 'start watching!',src
		# 			fs.lookup(src).watch(bundle)

		# for file in Array.from(watch)
		#	if #watchedFiles[file] =? yes
		#		watcher..add(file)
		
		let filesToWrite = []
		let manifest = {
			files: {}
			urls: {}
			assets: {}
			idmap: sourceIdMap
		}

		let firstWrite = !self.files
		let prevFiles = self.files or []

		let files = []
		let sheets = []
		# go through output files to actually 
		for bundle in bundles
			for file in bundle.files
				
				files.push(file)
				if file.path.match(/\.css$/)
					sheets.push(file)

			if options.verbose
				manifest.bundles ||= []
				manifest.bundles.push(bundle.meta)

		time 'writeFiles'

		let sharedcss = []

		for sheet in sheets
			sharedcss.push(...sheet.contents.split("/* chunk:end */"))
		
		let sheetbody = sharedcss.filter(do(v,i) sharedcss.indexOf(v) == i).join('\n')
		let sheethash = utils.createHash(sheetbody)

		files.push {
			contents: sheetbody
			hash: sheethash
			path: path.resolve(pubdir,"bundle.css")
			hashedPath: path.resolve(pubdir,"bundle.{sheethash}.css")
		}

		for file in files
			file.writePath = dev? ? file.path : file.hashedPath
			let prev = prevFiles.find do $1.path == file.path
			let src = relp(file.path)
			let pub = path.relative(pubdir,file.path)
			let hashpub = path.relative(pubdir,file.hashedPath)

			let entry = manifest.files[src] = {
				hash: file.hash
				path: file.writePath
				#file: file
			}
			
			let url = puburl + pub
			let redir = dev? ? "{url}?v={file.hash}" : puburl + hashpub

			# better way to check whether file is in public path?
			if !pub.match(/^\.\.?\//)
				entry.url = redir
				file.url = redir
				manifest.urls[url] = src

				manifest.assets[pub] = {
					url: redir
					path: file.writePath
					hash: file.hash
				}

			if !prev or prev.hash != file.hash
				filesToWrite.push(file)

		let fsp = nodefs.promises
		let writes = []
		for file in filesToWrite
			let dest = file.writePath
			let link = dest != file.path and file.path
			let body = file.contents or file.text
			let size = (body or "").length
			log.success 'write %path %kb',relp(dest),size
			continue if body == undefined

			await utils.ensureDir(dest)
			let promise = fsp.writeFile(dest,body)
			
			if link
				promise = promise.then do
					try
						await fsp.access(link,nodefs.constants.R_OK)
						await fsp.unlink(link)
					fsp.symlink(dest,link)
			writes.push promise

		# could write to a virtual dir as well?
		await Promise.all(writes)
		timed 'writeFiles'

		self.files = files
		
		if writes.length
			
			manifest.changes = filesToWrite.map do relp($1.path)
			let buildinfo = program.manifest
			for own k,v of manifest
				buildinfo.data[k] = v

			await writeManifest(manifest)

			buildinfo.save!

			if options.serve and !server
				server = new Server(self,options.serve)
				server.start!

			server.updated(filesToWrite,manifest,firstWrite) if server

		if true
			let json = JSON.stringify(bundles.map(do $1.meta),null,2)
			await nodefs.promises.writeFile(fs.resolve('buildinfo.json'),json)
		
		# log.success ''
		# console.log 'did write',Date.now! - t
		yes

	def writeManifest manifest
		let dest = manifestpath
		let json = JSON.stringify(manifest,null,2)
		self.manifest = manifest
		await utils.ensureDir(dest)
		await nodefs.promises.writeFile(dest,json)
		log.success 'write %path %kb',relp(dest),json.length