import chokidar from 'chokidar'
import compiler from 'compiler'
import imba1 from 'compiler1'

const esbuild = require 'esbuild'
const fs = require 'fs'
const path = require 'path'
const readdirp = require 'readdirp'
const crypto = require 'crypto'
import {resolveConfigFile} from './imbaconfig'
import {Server} from '../bundler/server'

def pluck array, cb
	for item,i in array
		if cb(item)
			array.splice(i,1)
			return item
	return null

const schema = {
	alias: {
		o: 'outfile',
		h: 'help',
		s: 'stdio',
		p: 'print',
		m: 'sourceMap',
		t: 'tokenize',
		v: 'version',
		w: 'watch',
		d: 'debug'
	},
	
	schema: {
		infile: {type: 'string'},
		outfile: {type: 'string'},
		platform: {type: 'string'}, # node | browser | worker
		styles: {type: 'string'}, # extern | inline
		imbaPath: {type: 'string'}, # global | inline | import
		format: {type: 'string'}, # cjs | esm
	},
	
	group: ['source-map']
}

def resolvePaths obj,cwd
	if obj isa Array
		for item,i in obj
			obj[i] = resolvePaths(item,cwd)
	elif typeof obj == 'string'
		return obj.replace(/^\.\//,cwd + '/')
	elif typeof obj == 'object'
		for own k,v of obj
			let alt = k.replace(/^\.\//,cwd + '/')
			obj[alt] = resolvePaths(v,cwd)
			if alt != k
				delete obj[k]
	return obj

def expandPath src
	unless src.indexOf("*") >= 0
		return Promise.resolve([src])

	let options = {
		depth: 1
		fileFilter: '*.imba',
	}

	src = src.replace(/(\/\*\*)?(\/\*\.(\w+))?$/) do(m,deep,last,ext)
		if last
			options.fileFilter = last.slice(1)
		if deep
			options.depth = 5
		return ""
	# console.log "readdirp",src,options
	let files = await readdirp.promise(src,options)
	# console.log 'files from promise',files
	return files.map do $1.fullPath

def idGenerator alphabet = 'abcdefghijklmnopqrstuvwxyz'
	let remap = {}
	for k in [0 ... (alphabet.length)]
		remap[k.toString(alphabet.length)] = alphabet[k]
	return do(num)
		num.toString(alphabet.length).split("").map(do remap[$1]).join("")

const esbuildPlatformDefaults = {
	browser: {platform: 'browser'}
	web: {platform: 'browser'}
	node: {platform: 'node'}
	worker: {platform: 'browser'}
}

const defaultLoaders = {
	".png": "file",
	".svg": "file",
	".woff2": "file",
	".woff": "file",
	".ttf": "file",
	".otf": "file"
}

const defaultOptions = {
	node:
		platform: 'node'
		format: 'cjs'
		outdir: './lib'
		loader: defaultLoaders
		name: 'node'

	browser:
		platform: 'browser'
		outdir: './lib'
		loader: defaultLoaders
		name: 'browser'

	server:
		platform: 'node'
		format: 'cjs'
		outdir: './dist/server'
		loader: defaultLoaders
		name: 'server'

	client:
		platform: 'browser'
		outdir: './dist/client'
		loader: defaultLoaders
		name: 'client'
}

const dirExistsCache = {}

def ensureDir src
	let stack = []
	let dirname = src
	
	new Promise do(resolve)

		while dirname = path.dirname(dirname)
			if dirExistsCache[dirname] or fs.existsSync(dirname)
				break
			stack.push(dirname)

		while stack.length
			let dir = stack.pop!
			fs.mkdirSync(dirExistsCache[dirname] = dir)

		resolve(src)

def createHash body
	crypto.createHash('sha1').update(body).digest('base64').replace(/[\=\+\/]/g,'').slice(0,8)

class Bundler
	def constructor config, options
		cwd = options.cwd
		config = config
		options = options
		bundles = []
		sourceIdMap = {}
		watcher = options.watch ? chokidar.watch([]) : null
		
		env = options.env or process.env.NODE_ENV or 'development'
		env = 'development' if env == 'dev' or options.dev
		env = 'production' if env == 'prod' or options.prod

		manifestpath = absp(config.manifest..path or './dist/manifest.json')
		console.log manifestpath
		try
			manifest = JSON.parse(fs.readFileSync(manifestpath,'utf-8'))
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

	get publicPath
		config.publicPath
	
	get publicDir
		config.client..outdir

	get dev?
		env == 'development'

	get prod?
		env == 'production'

	def sourceIdForPath src
		let map = sourceIdMap
		src = relp(src)

		unless map[src]
			let gen = #sourceIdGenerator ||= idGenerator!	
			let nr = Object.keys(map).length
			map[src] = gen(nr) + "0"

		return map[src]

	def #parseBundle item, defaults = [{}]
		let files = []
		for entry,i in item.entries
			if entry.indexOf('*') >= 0
				# need to start watching paths here?
				let paths = await expandPath(entry)
				files.push(...paths)
			else
				files.push(entry)

		item.entryPoints = files
		let out = Object.assign({},...defaults,item)
		console.log 'parsed bundle',out
		return out

	def time name = 'default'
		let now = Date.now!
		let prev = #timestamps[name] or now
		let diff = now - prev
		#timestamps[name] = now		
		return diff
	
	def timed name = 'default'
		console.log "time {name}: {time(name)}"

	get client
		bundles.find do $1.name == 'client'
		
	def setup
		let entries = []

		for own name,defaults of defaultOptions
			if config[name]
				let entry = await #parseBundle(config[name],[options,defaults])
				config[name] = entries[name] = entry
				entries.push(entry)

		if config.entries
			for own key,value of config.entries
				continue if value.skip
				let paths = await expandPath(key)
				entries.push Object.assign({},options,{entryPoints: paths},value)
				console.log 'added entry',entries[entries.length - 1]

		
		bundles = entries.map do new Bundle(self,$1)
		for bundle in bundles
			await bundle.setup!

		if watcher
			watcher.on('change') do(src,stats)
				#dirtyInputs.add(relp(src))
				clearTimeout(#rebuildTimeout)
				# only rebuild if a rebuild is not already ongoing?
				#rebuildTimeout = setTimeout(&,50) do rebuild!
		
		if options.serve
			server = new Server(self)
			server.start!
		return self

	def run
		time 'build'
		let builds = for bundle in bundles
			bundle.build!
		await Promise.all(builds)
		console.log 'built all entries'
		write!
		timed 'build'

	def rebuilt bundle
		self

	def rebuild
		time 'rebuild'
		clearTimeout(#rebuildTimeout)
		let changes = Array.from(#dirtyInputs)
		#dirtyInputs.clear!

		let dirtyBundles = new Set

		for bundle in bundles
			for input in changes
				if bundle.inputs[input]
					dirtyBundles.add(bundle)

		console.log 'rebuild now!',changes,Array.from(dirtyBundles).length

		# await Promise.all Array.from(dirtyBundles).map do $1.rebuild!
		let awaits = for item of dirtyBundles
			item.rebuild!

		await Promise.all(awaits) 
		console.log 'was rebuilt',time('rebuild')
		write!
		self

	def write bundles = self.bundles
		let watch = new Set
		# watch / unwatch
		time 'watch'
		for bundle in bundles
			for own src,value of bundle.inputs
				if !src.match(/^[\w\-]+\:/) and src.match(/\.imba/)
					watch.add( absp(src) )
		console.log 'filesToWatch',Array.from(watch).length
		for file in Array.from(watch)
			if #watchedFiles[file] =? yes
				watcher..add(file)
		timed 'watch'
		
		let filesToWrite = []
		let manifest = {
			files: {}
			urls: {}
			assets: {}
			idmap: sourceIdMap
		}

		let pubdir = publicDir
		let puburl = publicPath
		let files = []
		# go through output files to actually 
		for bundle in bundles
			for file in bundle.files
				file.writePath = dev? ? file.path : file.hashedPath
				let src = relp(file.path)
				let pub = path.relative(pubdir,file.path)
				let hashpub = path.relative(pubdir,file.hashedPath)
				# let id = sourceIdForPath(src) # for the outputs, not the inputs??

				let entry = manifest.files[src] = {
					hash: file.hash
					path: file.writePath
					#file: file
				}
				
				let url = puburl + '/' + pub
				let redir = url

				if dev?
					redir += "?v={file.hash}"
				else
					redir = puburl + '/' + hashpub

				# better way to check whether file is in public path?
				if !pub.match(/^\.\.?\//)
					entry.url = redir
					file.url = redir
					manifest.urls[url] = src # hashed url

					manifest.assets[pub] = {
						url: redir
						path: file.writePath
						hash: file.hash
					}

				file.pubpath = path.relative(bundle.outdir,file.path)
			
				if file.dirty
					file.dirty = no
					filesToWrite.push(file)

			if options.verbose
				manifest.bundles ||= []
				manifest.bundles.push(bundle.meta)

		time 'writeFiles'

		let fsp = fs.promises
		let writes = []
		for file in filesToWrite
			let dest = file.writePath
			let link = dest != file.path and file.path
			file.dirty = no
			console.log 'writing files',dest,file.hash
			await ensureDir(dest)
			let promise = fsp.writeFile(dest,file.contents or file.text)
			
			if link
				promise = promise.then do
					try
						await fsp.access(link,fs.constants.R_OK)
						await fsp.unlink(link)
					fsp.symlink(dest,link)
			writes.push promise

		# could write to a virtual dir as well?
		await Promise.all(writes)
		timed 'writeFiles'
		
		if writes.length
			# write the manifest
			await writeManifest(manifest)

		if server
			server.updated(filesToWrite)
		yes

	def writeManifest manifest
		let dest = manifestpath
		let json = JSON.stringify(manifest,null,2)
		self.manifest = manifest
		console.log 'writing manifest'
		fs.promises.writeFile(dest,json)

	def serve
		let port = config.serve.port
		console.log "start serving!!!",config.serve.port

class Entry
	def constructor bundle, options
		bundle = bundle
		options = options
	
class Bundle
	get config
		bundler.config

	get outdir
		options.outdir

	get node?
		platform == 'node'

	get web?
		!node?

	get publicPath
		options.publicPath or bundler.publicPath

	def time name = 'default'
		let now = Date.now!
		let prev = #timestamps[name] or now
		let diff = now - prev
		#timestamps[name] = now		
		return diff
	
	def timed name = 'default'
		console.log "time {name}: {time(name)}"

	def constructor bundler,o
		#timestamps = {}
		bundler = bundler
		styles = {}
		manifest = {}
		options = o
		# watcher = o.watch ? chokidar.watch([]) : null
		result = null
		built = no
		cache = bundler.#cache or {}
		meta = {}

		name = options.name
		cwd = options.cwd
		platform = o.platform
		cachePrefix = "{o.platform}"
		entryPoints = o.entryPoints

		console.log "construct with options",o

		let defaults = esbuildPlatformDefaults[o.platform or 'browser'] or {}

		esoptions = Object.assign({},defaults,{
			entryPoints: entryPoints
			target: o.target or ['es2019']
			bundle: true
			define: o.define
			format: o.format or 'iife'
			outfile: o.outfile
			outdir: o.outdir
			outbase: o.outbase
			globalName: o.globalName # weird, no?
			publicPath: publicPath
			banner: o.banner
			footer: o.footer
			splitting: o.splitting
			minify: !!o.minify
			incremental: o.watch
			loader: o.loader or {} # Object.assign({},defaultLoaders,o.loader or {})
			write: false
			metafile: "metafile.json"
			external: o.external or undefined
			plugins: (o.plugins or []).concat({name: 'imba', setup: plugin.bind(self)})
			resolveExtensions: ['.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json']
		})

		# console.log esoptions
		
		# add default defines
		unless node?
			let defines = esoptions.define ||= {}
			let env = o.env or process.env.NODE_ENV or 'production'
			defines["process.env.NODE_ENV"] ||= "'{env}'"

		# if o.outname
		#	esoptions.sourcefile = o.outname

		if o.splitting and esoptions.format != 'esm'
			esoptions.splitting = false

	def setup
		self

	def plugin build
		let externs = options.external or []
		let extdeps = externs.indexOf("dependencies") >= 0
		let extjson = externs.indexOf(".json") >= 0
		let extmap = {}
		if extdeps
			try
				for value in Object.keys(config.package.dependencies)
					extmap[value] = yes

		for key in externs when key[0] == '!'
			delete extmap[key.slice(1)]

		build.onResolve(filter: /\.imba\.css$/) do(args)
			return {path: args.path, namespace: 'styles'}

		(extdeps or extjson) and build.onResolve(filter: /.*/, namespace: 'file') do(args)
			let id = args.path
			let ns = args.namespace

			if extjson and id.match(/\.json$/)
				let abspath = path.resolve(args.resolveDir,id)
				let outpath = path.relative(outdir,args.resolveDir)
				return {external: true, path: abspath}

			if extmap[id]
				return {external: true}
			return

		

		build.onLoad({ filter: /\.imba1?$/, namespace: 'file' }) do(args)
			watcher.add(args.path) if watcher
			let raw = await fs.promises.readFile(args.path, 'utf8')
			let key = "{cachePrefix}:{args.path}" # possibly more

			let t0 = Date.now()
			let iopts = {
				platform: options.platform || 'browser',
				format: 'esm',
				sourcePath: args.path,
				imbaPath: options.imbaPath or 'imba'
				sourceId: bundler.sourceIdForPath(args.path)
				config: config
				styles: 'extern'
				hmr: options.serve and !node?
				bundle: yes
			}
			let body = null

			if cache[key] and cache[key].input == raw
				return cache[key].result

			let out = {
				errors: []
				warnings: []
			}

			# legacy handling
			if args.path.match(/\.imba1$/)
				iopts.target = iopts.sourcePath
				out.contents = String(imba1.compile(raw,iopts))
			else
				let result = compiler.compile(raw,iopts)
				let id = result.sourceId
				body = result.js

				# if result.warnings
				#	console.warn "WARNINGS",args.path
				
				if result.errors..length
					console.warn "ERRORS!!!",args.path
					let arr = out.errors
					for err in result.errors
						let loc = err.range.start
						out.errors.push(
							text: err.message
							location: {
								file: args.path
								line: loc.line + 1
								column: loc.character
							}
						)

				
				if result.css
					let name = path.basename(args.path,'.imba')
					let cssname = "{name}-{id}.imba.css"
					styles[cssname] = {
						loader: 'css'
						contents: result.css
						resolveDir: path.dirname(args.path)
					}
					
					body += "\nimport '{cssname}';\n"

				out.contents = body


			cache[key] = {input: raw, result: out}

			return out

		build.onLoad({ filter: /\.*/, namespace: 'styles'}) do(args)
			styles[args.path]

	def build
		if built =? true
			console.log 'starting to build'
			let t = Date.now!
			result = await esbuild.build(esoptions)
			console.log 'built',Date.now! - t
			write(result.outputFiles)
			# if watcher
			#	watcher.on('change') do rebuild!

		console.log 'did build!'
		return self 

	def rebuild
		let t = Date.now!
		console.log('rebuilding',options.infile)
		let rebuilt = await result.rebuild!
		console.log('rebuilt',options.infile,Date.now! - t)
		result = rebuilt
		write(result.outputFiles)
		bundler.rebuilt(self)

	def traverseInput entry, inputs, root = entry
		inputs.#nr ||= 1
		return if entry.nr
		entry.nr = (inputs.#nr += 1)
		entry.css = []

		for item in entry.imports
			let dep = inputs[item.path]
			traverseInput(dep,inputs,root)
			if item.path.match(/\.css$/)
				entry.css.push(item.path)
			else
				entry.css.push(...dep.css)

		entry.css = entry.css.filter do(item,i) entry.css.indexOf(item) == i
		return

	def write files
		let pubdir = bundler.client..outdir
		let metafile = pluck(files) do $1.path.indexOf(esoptions.metafile) >= 0 # match(/metafile\.json$/)
		let meta = JSON.parse(metafile.text)

		# see if we have already built things before and nothing has changed?
		time 'hashing'
		for file in files
			# find the related entrypoint for this file
			# finding the related previously compiled file if rebuilding
			if pubdir and node? and !file.path.match(/\.[cm]?js(\.map)?$/)
				file.path = path.resolve(pubdir,path.basename(file.path))
				# calculate the public path?

			let prev = self.files and self.files.find do $1.path == file.path

			let hash = file.hash = (file.path.match(/\.([A-Z\d]{8})\.\w+$/) or [])[1]
			let name = path.basename(file.path)

			if hash
				file.hashedName = name
			else
				hash = file.hash = createHash(file.contents)
				file.hashedName = name.replace(/(?=\.\w+$)/,".{hash}")

			# console.log "will write",file.path,file.hash,prev and prev.hash == hash
			file.dirty = !prev or prev.hash != hash

			# asset files should always be redirected to pubdir instead
			file.hashedPath = path.resolve(path.dirname(file.path),file.hashedName)

		timed 'hashing'

		unless files.some(do $1.dirty)
			console.log 'nothing has changed!!!'
			return yes
		
		let o = options
		let styles = []

		for src in entryPoints
			let entry = meta.inputs[path.relative(cwd,src)]
			traverseInput(entry,meta.inputs,entry)
			styles.push(...entry.css)

		meta.css = styles.filter do(item,i) styles.indexOf(item) == i

		# go through to extract the actual css chunks from output files
		# that is - before the correct ordering
		for own key,value of meta.outputs
			let file = files.find do path.relative(cwd,$1.path) == key
			value.#file = file
			continue unless file and key.match(/\.css$/)

			let offset = 0
			let body = file.text
			let parts = []

			for own src,details of value.inputs
				let entry = meta.inputs[src]
				let bytes = details.bytesInOutput
				let header = "/* {src} */\n"

				if !o.minify
					offset += header.length

				let chunk = body.substr(offset,bytes)
				offset += bytes
				offset += 1 if !o.minify
				entry.output ||= chunk
				parts[entry.nr] = chunk
				
			file.contents = parts.filter(do $1).join('\n')

		inputs = meta.inputs
		outputs = meta.outputs
		self.meta = meta
		self.files = files
		return

export def run options = {}
	let bundles = []
	let cwd = (options.cwd ||= process.cwd!)
	if options.argv
		Object.assign(options,compiler.helpers.parseArgs(options.argv,schema))

	if options.serve
		options.watch = yes # ?
	
	let config = options.config or resolveConfigFile(cwd,path: path, fs: fs)
	let bundler = new Bundler(config,options)
	await bundler.setup!
	bundler.run!

export def build options
	if options isa Array
		options = compiler.helpers.parseArgs(options,schema)
	console.log 'build with config',options
	let bundle = new Bundle(options)
	bundle.build!