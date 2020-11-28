import chokidar from 'chokidar'
import compiler from 'compiler'
import imba1 from 'compiler1'

const esbuild = require 'esbuild'
const fs = require 'fs'
const path = require 'path'
const readdirp = require 'readdirp'
import {resolveConfigFile} from './imbaconfig'

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
	worker: {platform: 'browser'} # ?
}

const defaultLoaders = {
	".png": "file",
	".svg": "file",
	".woff2": "file",
	".woff": "file",
	".ttf": "file",
	".otf": "file"
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

class Bundler
	def constructor config, options
		config = config
		options = options
		cwd = options.cwd
		bundles = []
		sourceIdMap = []
		#cache = {}
		return self

	def sourceIdForPath src
		let map = sourceIdMap

		unless map[src]
			let gen = #sourceIdGenerator ||= idGenerator!			
			map[src] = gen(map.push(src)) + "_"

		return map[src]

	def setup
		for own key,value of config.entries
			continue if value.skip
			let paths = await expandPath(key)
			let entry = Object.assign({},options,{entryPoints: paths},value)
			let bundle = new Bundle(self,entry)
			bundles.push(bundle)

	def run
		let builds = for bundle in bundles
			bundle.build!
		await Promise.all(builds)
		console.log 'built all entries'

class Entry
	def constructor bundle, options
		bundle = bundle
		options = options
	
class Bundle
	get config
		bundler.config

	def constructor bundler,o
		bundler = bundler
		styles = {}
		options = o
		watcher = o.watch ? chokidar.watch([]) : null
		result = null
		built = no
		cache = bundler.#cache or {}
		manifest = {}

		cwd = options.cwd
		cachePrefix = "{o.platform}"
		entryPoints = o.entryPoints or [o.infile]

		let defaults = esbuildPlatformDefaults[o.platform or 'browser'] or {}

		# create entrypoint abstraction
		for item in entryPoints
			let src = path.relative(cwd,item)
			{
				path: path.relative(cwd,item)
			}

		esoptions = Object.assign(defaults,{
			entryPoints: entryPoints
			target: o.target or ['es2019']
			bundle: true
			define: o.define
			format: o.format or 'iife'
			outfile: o.outfile
			outdir: o.outdir
			outbase: o.outbase
			globalName: o.globalName
			publicPath: o.publicPath
			banner: o.banner
			footer: o.footer
			// minifyIdentifiers: !!o.minify
			minify: !!o.minify
			incremental: o.watch
			loader: Object.assign({},defaultLoaders,o.loader or {})
			write: false
			metafile: "{o.name or 'bundle'}.meta.json"
			external: o.external or undefined
			plugins: (o.plugins or []).concat({name: 'imba', setup: setup.bind(self)})
			resolveExtensions: ['.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json']
		})
		
		# add default defines
		if o.platform != 'node'
			let defines = esoptions.define ||= {}
			let env = o.env or process.env.NODE_ENV or 'production'
			defines["process.env.NODE_ENV"] ||= "'{env}'"

		if o.outname
			esoptions.sourcefile = o.outname


	def setup build
		let externs = options.external or []
		let expkg = externs.indexOf("packages") >= 0

		build.onResolve(filter: /\.imba\.css$/) do(args)
			return {path: args.path, namespace: 'styles'}

		expkg && build.onResolve(filter: /.*/, namespace: 'file') do(args)
			let id = args.path
			let ns = args.namespace

			if (/[\w\@]/).test(id[0]) and externs.indexOf("!{id}") == -1
				console.log 'mark as external',args
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
			}
			let body = null

			if cache[key] and cache[key].input == raw
				return cache[key].result

			# legacy handling
			if args.path.match(/\.imba1$/)
				iopts.target = iopts.sourcePath
				body = String(imba1.compile(raw,iopts))
			else
				let result = compiler.compile(raw,iopts)
				let id = result.sourceId
				body = result.js
				
				if result.css
					let name = path.basename(args.path,'.imba')
					let cssname = "{name}-{id}.imba.css"
					styles[cssname] = {
						loader: 'css'
						contents: result.css
						resolveDir: path.dirname(args.path)
					}
					
					body += "\nimport '{cssname}';\n"
			
			let out = {contents: body}
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
			if watcher
				watcher.on('change') do rebuild!

		console.log 'did build!'
		return self 

	def rebuild
		let t = Date.now!
		console.log('rebuilding',options.infile)
		let rebuilt = await result.rebuild!
		console.log('rebuilt',options.infile,Date.now! - t)
		result = rebuilt
		write(result.outputFiles)

	def traverseInput entry, inputs, root = entry
		inputs.#nr ||= 1
		return if entry.nr
		entry.nr = (inputs.#nr += 1)

		for item in entry.imports
			traverseInput(inputs[item.path],inputs,root)

		return
	
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
		let meta = JSON.parse(files.find(do $1.path.match(/meta\.json$/)).text)

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

		manifest = meta
		# now all css inputs that are used should have an output property with
		# the final processed body of that input.

		# if we want a shared css file for all entries now it should be enough to just traverse the entrypoints and collect any css we come across

		# generate shared stylesheet
		# remove duplicates of all the included style chunks
		files.push {
			path: path.resolve(options.outdir,"shared-styles.css")
			contents: meta.css.map(do meta.inputs[$1].output).join('\n')
		}
		

		for file in files
			if !file.path.match(/meta\.json$/)
				writeFile(file.path,file.contents or file.text)

		let metadest = path.resolve(options.outdir,esoptions.metafile)
		writeFile(metadest,JSON.stringify(meta,null,2))
		# generate a shared stylesheet
		return

	def writeFile outpath, content
		console.log 'write',outpath
		await ensureDir(outpath)
		fs.promises.writeFile(outpath,content)
		# fs.writeFileSync(outpath,content)


export def run options = {}
	let bundles = []
	let cwd = (options.cwd ||= process.cwd!)
	if options.argv
		Object.assign(options,compiler.helpers.parseArgs(options.argv,schema))
	
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