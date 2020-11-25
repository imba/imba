import chokidar from 'chokidar'
import compiler from 'compiler'
import imba1 from 'compiler1'
# import esbuild from 'esbuild'
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

class ScriptSource

	def constructor src
		sourcePath = src

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
		cachePrefix = "{o.platform}"
		entryPoints = o.entryPoints or [o.infile]
		esoptions = {
			entryPoints: entryPoints
			target: o.target or ['es2019']
			bundle: true
			format: o.format or 'iife'
			outfile: o.outfile
			outdir: o.outdir
			minify: !!o.minify
			incremental: o.watch
			platform: o.platform
			write: false
			metafile: 'meta.json'
			external: o.external or undefined
			plugins: [{name: 'imba', setup: setup.bind(self)}]
			// outExtension: { '.js': '.imba' }
			resolveExtensions: ['.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json']
		}
		console.log 'esoptions',esoptions

	def setup build
		let ext = options.external or []

		build.onResolve({ filter: /\.imba\.css$/ }) do(args)
			{path: path.resolve(args.resolveDir,args.path), namespace: 'styles'}

		build.onResolve({ filter: /.*/ }) do(args)

			let id = args.path
			let ns = args.namespace

			if id.match(/\.svg/) and ns == 'styles'
				return {external: true}

			if ns == 'styles'
				return

			if (/^imba(\/|$)/).test(id) and ext.indexOf(id) == -1
				return

			if (/[\w\@]/).test(id[0]) and ext.indexOf("packages") >= 0 and ext.indexOf("!{id}") == -1
				return {external: true}

			# console.log "resolve {id}"
			return


		build.onLoad({ filter: /\.imba1?$/ }) do(args)
			watcher.add(args.path) if watcher
			let name = path.basename(args.path)
			let raw = await fs.promises.readFile(args.path, 'utf8')
			let key = "{cachePrefix}:{args.path}" # possibly more

			let t0 = Date.now()
			let iopts = {
				platform: options.platform || 'browser',
				format: 'esm',
				sourcePath: args.path,
				imbaPath: options.imbaPath or 'imba'
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
				styles[id] = result.css
				if result.css
					body += "\nimport './{name}.{id}.imba.css';\n"
			
			let out = {contents: body}
			cache[key] = {input: raw, result: out}

			return out

		build.onLoad({ filter: /\.imba\.css$/, namespace: 'styles' }) do(args)
			let id = args.path.match(/(\w+)\.imba\.css/)[1]
			return {
				loader: 'css'
				contents: styles[id] or "/* blank */"
			}


	def build
		if built =? true
			console.log 'starting to build'
			result = await esbuild.build(esoptions)
			console.log 'built',result.outputFiles
			write(result.outputFiles)
			if watcher
				watcher.on('change') do rebuild!
					

		console.log 'did build!'
		return self

	def rebuild
		let t = Date.now!
		console.log('rebuilding',options.infile)
		let rebuilt = await result.rebuild!
		console.log('rebuilt',options.infile,Date.now! - t,rebuilt)
		result = rebuilt
		write(result.outputFiles)
	
	def findStyleDependencies entry,entries,styles
		if typeof entry == 'string'
			entry = entries[entry]

		for item in entry.imports
			if item.path.match(/\.css/)
				styles.push(item.path) unless styles.indexOf(item.path) >= 0
			else
				findStyleDependencies(item.path,entries,styles)
		return styles

	def write files
		# console.log "order",orderedStyleSheets,firstResolve,process.cwd!,entry
		let meta = JSON.parse(files.find(do $1.path.match(/meta\.json$/)).text)

		let styles = []

		for entry in entryPoints
			let rel = path.relative(options.cwd,entry)
			findStyleDependencies(rel,meta.inputs,styles)
			# console.log 'handling entry point',rel

		for file in files
			if file.path.match(/\.css$/)
				let parts = file.text.split(/(?=\/\* styles\:)/g).map do(str)
					let ref = str.match(/\/\* (styles:[^\*\s]+)/)[1]
					{path: ref, text: str, order: styles.indexOf(ref)}
				
				parts = parts.sort do(a,b) a.order - b.order
				# console.log("orders",parts.map(do [$1.path,$1.order]))
				fs.writeFileSync(file.path,parts.map(do $1.text).join('\n'))
			elif file != meta
				fs.writeFileSync(file.path,file.text)

		return


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