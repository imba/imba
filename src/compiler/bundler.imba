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

const numToId = idGenerator!
const sourceIdMappings = []

const esbuildPlatformDefaults = {
	browser: {platform: 'browser'}
	web: {platform: 'browser'}
	node: {platform: 'node'}
	worker: {platform: 'browser'} # ?
}

def ensureDir src
	let stack = []
	let dirname = src

	while true
		dirname = path.dirname(dirname)
		break if fs.existsSync(dirname)
		stack.push(dirname)

	while stack.length
		fs.mkdirSync(stack.pop!)

	return


def resolveSourceId src
	let map = sourceIdMappings
	let id = map[src]
	
	unless id
		let nr = map.length
		map.push(src)
		id = map[src] = numToId(nr) + "_"
	
	return id

class Project
	def constructor config
		config = config
		bundles = []

class Bundle
	def constructor o, config
		styles = {} # <sourceId,body> map
		config = config
		options = o
		watcher = o.watch ? chokidar.watch([]) : null
		result = null
		built = no
		cache = o.#cache or {}
		cwd = options.cwd
		cachePrefix = "{o.platform}"
		entryPoints = o.entryPoints or [o.infile]

		let defaults = esbuildPlatformDefaults[o.platform or 'browser'] or {}
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
			minifyIdentifiers: !!o.minify
			minifySyntax: !!o.minify
			incremental: o.watch
			loader: o.loader
			write: false
			metafile: 'meta.json'
			external: o.external or undefined
			plugins: [{name: 'imba', setup: setup.bind(self)}]
			// outExtension: { '.js': '.imba' }
			resolveExtensions: ['.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json']
		})
		
		# add default defines
		if o.platform != 'node'
			let defines = esoptions.define ||= {}
			let env = o.env or process.env.NODE_ENV or 'production'
			defines["process.env.NODE_ENV"] ||= "'{env}'"

		if o.outname
			esoptions.sourcefile = o.outname

		console.log 'esoptions',esoptions

	def resolve

	def setup build
		let externs = options.external or []

		build.onResolve({ filter: /(\w+)\.css$/ }) do(args)
			let id = args.path.match(/(\w+)\.css$/)[1]
			if id and styles[id]
				let abs = path.resolve(args.resolveDir,args.path)
				let rel = path.relative(cwd,abs)
				# console.log 'resolving css',args,abs,rel
				return {path: rel, namespace: 'styles'}
			return

		build.onResolve({ filter: /.*/ }) do(args)

			let id = args.path
			let ns = args.namespace
			let ext  = path.extname(id)
			let rel? = id[0] == '.'

			if ext == '.svg' and ns == 'styles' and false
				# here we can actually resolve the file on disk
				# and inspect the sizes etc to decide whether to inline
				# or reference. Could also decide based on certain options
				# console.log "svg asset in styles here??",args,ext

				if rel?
					let abs = path.resolve(args.resolveDir,id)
					let resolved = path.relative(options.outdir,abs)
					console.log 'svg resolves to?',resolved
					# if it is not possible to resolve we need to inline it or link it some other way
					return {path: abs}

				return {external: true}

			if ns == 'styles'
				return

			if (/^imba(\/|$)/).test(id) and externs.indexOf(id) == -1
				return

			if (/[\w\@]/).test(id[0]) and externs.indexOf("packages") >= 0 and externs.indexOf("!{id}") == -1
				return {external: true}

			if id.match(/\.json/) and externs.indexOf(".json") >= 0
				let abs = path.resolve(args.resolveDir,id)
				let resolved = path.relative(options.outdir,abs)
				console.log "should rewrite path",options.outdir,args,resolved,abs
				return {external: true, path: resolved}
			console.log 'resolving',args.path		
			return


		build.onLoad({ filter: /\.imba1?$/ }) do(args)
			watcher.add(args.path) if watcher
			let raw = await fs.promises.readFile(args.path, 'utf8')
			let key = "{cachePrefix}:{args.path}" # possibly more

			let t0 = Date.now()
			let iopts = {
				platform: options.platform || 'browser',
				format: 'esm',
				sourcePath: args.path,
				imbaPath: options.imbaPath or 'imba'
				sourceId: resolveSourceId(args.path)
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
				styles[id] = {
					loader: 'css'
					contents: "._css_{id}\{--ref:'{id}'\}\n" + result.css
					resolveDir: path.dirname(args.path)
				}
				if result.css
					let name = path.basename(args.path,'.imba')
					body += "\nimport './{name}.{id}.css';\n"
			
			let out = {contents: body}
			cache[key] = {input: raw, result: out}

			return out

		build.onLoad({ filter: /.*/, namespace: 'assets' }) do(args)
			console.log 'load asset',args
			let contents = await fs.promises.readFile(args.path, 'utf8')
			return {
				contents: contents
				loader: 'dataurl'
			}

		build.onLoad({ filter: /(\w+)\.css$/, namespace: 'styles' }) do(args)
			let id = args.path.match(/(\w+)\.css$/)[1]
			return styles[id]


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
	
	def findStyleDependencies entry,entries,styles,checked = {}
		
		if typeof entry == 'string'
			if checked[entry]
				return
			checked[entry] = entry
			entry = entries[entry]

		for item in entry.imports
			# FIXME not working with external stylesheets now
			if item.path.match(/styles\:/)
				let id = item.path.match(/(\w+)\.css/)[1]
				styles.push(id) unless styles.indexOf(id) >= 0
				styles[id] = item.path
			else
				findStyleDependencies(item.path,entries,styles,checked)
		return styles

	def write files
		# console.log "order",orderedStyleSheets,firstResolve,process.cwd!,entry
		let meta = JSON.parse(files.find(do $1.path.match(/meta\.json$/)).text)

		let styles = []

		for entry in entryPoints
			let rel = path.relative(cwd,entry)
			findStyleDependencies(rel,meta.inputs,styles)
			# console.log 'handling entry point',rel

		for file in files
			if file.path.match(/\.css$/)
				try
					let splitter = (/(?=\/\* styles\:)/g)
					let parts = []
					file.text.split(splitter).map do(str)
						try
							let ref = str.match(/\._css_([\w_\-]+)/)[1]
							parts.push {id: ref, text: str, order: styles.indexOf(ref)}

					parts = parts.sort do(a,b) a.order - b.order
					# console.log("orders",parts.map(do [$1.path,$1.order]))
					writeFile(file.path,parts.map(do $1.text).join('\n'))
					continue

			if !file.path.match(/meta\.json$/)
				writeFile(file.path,file.text)

		return

	def writeFile outpath, content
		console.log 'write',outpath
		ensureDir(outpath)
		fs.promises.writeFile(outpath,content)
		# fs.writeFileSync(outpath,content)


export def run options = {}
	let bundles = []
	let cwd = (options.cwd ||= process.cwd!)
	if options.argv
		Object.assign(options,compiler.helpers.parseArgs(options.argv,schema))
	
	let config = options.config or resolveConfigFile(cwd,path: path, fs: fs)

	options.#cache = {}

	for own key,value of config.entries
		continue if value.skip
		let paths = await expandPath(key)
		let entry = Object.assign({},options,value)
		# possibly to multiple entry points there?
		entry.entryPoints = paths

		let bundle = new Bundle(entry,config)
		bundles.push(bundle)
		bundle.build!
	yes

export def build options
	if options isa Array
		options = compiler.helpers.parseArgs(options,schema)
	console.log 'build with config',options
	let bundle = new Bundle(options)
	bundle.build!
	# options.plugins = [{name: 'imba', setup: plugin.bind(entry)}];