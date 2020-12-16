import compiler from 'compiler'
import imba1 from 'compiler1'

import {parseAsset} from '../compiler/assets'

const esbuild = require 'esbuild'
const nodefs = require 'fs'
const np = require 'path'
const utils = require './utils'
import Component from './component'

import {SourceMapper} from '../compiler/sourcemapper'

export class Bundle < Component
	get config
		bundler.config

	get node?
		platform == 'node'

	get web?
		!node?

	get minify?
		!!bundler.options.minify

	get puburl
		options.puburl or bundler.puburl or ''

	get pubdir
		options.pubdir or bundler.pubdir or 'public'
	
	get libdir
		options.libdir or bundler.libdir or 'dist'

	get esb
		bundler.esb

	get fs
		bundler.fs
	
	get program
		bundler.program

	def time name = 'default'
		let now = Date.now!
		let prev = #timestamps[name] or now
		let diff = now - prev
		#timestamps[name] = now		
		return diff
	
	def timed name = 'default'
		let str = "time {name}: {time(name)}"

	def constructor bundler,o
		super()
		#key = Symbol!
		#timestamps = {}

		bundler = bundler
		styles = {}
		options = o
		result = null
		built = no
		#cache = bundler.#cache or {}
		meta = {}

		name = options.name
		cwd = fs.cwd
		
		platform = o.platform or 'browser'
		cachePrefix = "{o.platform}"
		entryPoints = o.entryPoints
		entryNodes = []
		resolvedEntryMap = {}
		outfileMap = {}
		pathLookups = {}

		let externals = []
		let package = bundler.package or {}
		for ext in o.external
			if ext == "dependencies"
				let deps = Object.keys(package.dependencies or {})
				externals.push(...deps)
			if ext == ".json"
				externals.push("*.json")
			externals.push(ext)

		if options.exports
			let raw = options.exports
			entryPoints = entries = []
			if typeof raw == 'string'
				raw = {main: raw}

			# console.log 'exports!!',raw
			for own key, value of raw
				let paths = value.indexOf('*') >= 0 ? fs.glob(value) : [fs.lookup(value)]
				# console.log 'checking exports',key,value
				
				for res in paths
					let slots = res.extractStarPattern(value)
					let name = key.replace(/\*/g) do(m) slots.shift!
					# console.log res.rel,value,slots,name
					let esentry = res.rel # res.imba ? res.imba.out[platform].rel : res.rel
					entryNodes.push(res)
					entries.push(esentry)

					let out = esentry.replace(/\.(imba|[mc]?js)$/,'')
					outfileMap[out + '.bundle.js'] = name + '.js'   # out + '.bundle.js'
					outfileMap[out + '.bundle.css'] = name + '.css'
					# outfileMap[esentry.replace(/\.(imba|[mc]?js)$/,'.bundle.css')] = name + '.css'

		esoptions = {
			entryPoints: entryPoints
			bundle: o.bundle === false ? false : true
			define: o.define
			platform: o.platform == 'node' ? 'node' : 'browser'
			format: o.format or 'iife'
			outfile: o.outfile
			# outdir: o.outfile ? '' : (o.outdir ? o.outdir : (node? ? bundler.libdir : bundler.pubdir))
			outbase: o.outbase or bundler.basedir
			outbase: fs.cwd
			outdir: fs.cwd
			outExtension: {
				".js": ".bundle.js"
				".css": ".bundle.css"
			}
			globalName: o.globalName
			publicPath: o.publicPath or bundler.puburl
			banner: o.banner
			footer: o.footer
			splitting: o.splitting
			minify: !!minify?
			incremental: bundler.incremental?
			loader: o.loader or {}
			write: false
			metafile: "metafile.json"
			external: externals
			tsconfig: o.tsconfig
			plugins: (o.plugins or []).concat({name: 'imba', setup: plugin.bind(self)})
			# outExtension: o.outExtension
			# resolveExtensions: ['.imba.mjs','.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json']
			resolveExtensions: [
				'.imba.mjs','.imba',
				'.imba1.mjs','.imba1',
				'.ts','.mjs','.cjs','.js'
			]
		}

		imbaoptions = {
			platform: o.platform
			css: 'external'
		}

		if esoptions.platform == 'browser'
			esoptions.resolveExtensions.unshift('.web.js')

		unless node?
			let defines = esoptions.define ||= {}
			let env = o.env or process.env.NODE_ENV or 'production'
			defines["process.env.NODE_ENV"] ||= "'{env}'"

		if o.bundle == false
			esoptions.bundle = false
			delete esoptions.external

		if o.splitting and esoptions.format != 'esm'
			# esoptions.splitting = false
			esoptions.format = 'esm'

	def setup
		# let promises = for entry in entryNodes
		#	entry.load!
		#
		# await Promise.all(promises)
		self

	def resolveAsset name
		try config.#assets[name]

	def plugin build
		let externs = options.external or []

		if options.imbaPath == 'global'
			build.onResolve(filter: /^imba(\/|$)/) do(args)
				# console.log 'onresolve imba'
				return {path: 'blank', namespace: 'ext'}

			build.onLoad(filter: /.*/, namespace: 'ext') do(args)
				return {contents: ''}

		build.onResolve(filter: /\?asset$/) do(args)
			let resolved = program.resolver.resolve(args,pathLookups)
			return resolved

		build.onResolve(filter: /^styles:/) do({path})
			return {path: path.slice(7), namespace: 'styles'}

		build.onResolve(filter: /^[\w\@]/) do(args)
			# maybe use the paths interface here instead?
			if args.importer.indexOf('.imba') > 0
				return program.resolver.resolve(args,pathLookups)
	
		build.onLoad({ filter: /\.imba1?$/}) do({path,namespace})
			let src = fs.lookup(path)
			let res = await src.imba.#compile(imbaoptions)
			let cached = res[#key]
			unless cached
				cached = res[#key] ||= {
					file: {loader: 'js', contents: SourceMapper.strip(res.js or "")}
					styles: {loader: 'css', contents: SourceMapper.strip(res.css or "")}
				}
			return cached[namespace]

		build.onLoad(filter: /.*/, namespace: 'asset') do({path})
			let file = fs.lookup(path)
			let out = await file.asset.#compile(format: 'esm')
			return {loader: 'js', contents: out.js}

		build.onLoad({ filter: /.*/, namespace: 'styles'}) do(args)
			let id = args.path.replace(/\.css$/,'')
			let entry = fs.lookup(id).imba
			let body = await entry.getStyles!

			return {
				loader: 'css'
				contents: body
				resolveDir: np.dirname(id)
			}

			unless entry
				console.log 'could not find styles!!',args.path
			return entry.css

	def build
		if built =? true
			let t = Date.now!
			result = await esb.build(esoptions)
			write(result.outputFiles)

		return self 

	def rebuild
		let t = Date.now!
		let rebuilt = await result.rebuild!
		result = rebuilt
		# console.log 'rebuilt (before write)',Date.now! - t
		write(result.outputFiles)
		bundler.rebuilt(self)

	def traverseInput entry, inputs, root = entry
		# console.log 'traverse',entry # ,inputs
		inputs.#nr ||= 1
		return if entry.nr
		entry.nr = (inputs.#nr += 1)
		entry.css = []

		for item in entry.imports
			let dep = inputs[item.path]
			traverseInput(dep,inputs,root)
			if item.path.match(/\.css$/) or item.path.match(/^styles:/)
				entry.css.push(item.path)
			else
				entry.css.push(...dep.css)

		entry.css = entry.css.filter do(item,i) entry.css.indexOf(item) == i
		return

	def write files
		let metafile = utils.pluck(files) do $1.path.indexOf(esoptions.metafile) >= 0 # match(/metafile\.json$/)
		let meta = JSON.parse(metafile.text)

		# when compiling for node we need to make sure that assets and stylesheets
		# are saved in public folders alongside all the browser files.
		# console.log meta

		for own src,value of meta.inputs

			# TODO start watching essentially all files instead?
			if !src.match(/^[\w\-]+\:/) and src.match(/\.(imba|css|svg)$/)
				pathLookups[src] = yes 
				# watch.add( absp(src) )
				# console.log 'start watching!',src
				fs.lookup(src).watch(bundle)

		time 'hashing'
		for file in files
			let id = fs.relative(file.path).replace(/^__dist__\//,'')
			let output = meta.outputs[id]
			let outfile = outfileMap[id] or id
			
			if output
				file.#output = output
				output.#file = file

			let public? = web? or !id.match(/\.([cm]?js|json)(\.map)?$/)
			let outdir = public? ? pubdir : libdir # webdir?
			file.path = fs.resolve(outdir,outfile)

			let prev = self.files and self.files.find do $1.path == file.path
			let hash = file.hash = (file.path.match(/\.([A-Z\d]{8})\.\w+$/) or [])[1]

			# get the actual file for this instead?

			let name = np.basename(file.path)

			if hash
				file.hashedName = name
			else
				hash = file.hash = utils.createHash(file.contents)
				file.hashedName = name.replace(/(?=\.\w+$)/,".{hash}")

			file.dirty = !prev or prev.hash != hash
			file.hashedPath = np.resolve(np.dirname(file.path),file.hashedName)
			# console.log 'outfile',!!output,[id,outfile,fs.relative(file.path),file.hashedPath] # file.path

		# console.log outfileMap

		timed 'hashing'

		unless files.some(do $1.dirty)
			return yes
		
		let o = options
		let styles = []

		for src in entryPoints
			
			let entry = meta.inputs[bundler.relp(src)]
			traverseInput(entry,meta.inputs,entry)
			styles.push(...entry.css)

		# meta.css = styles.filter do(item,i) styles.indexOf(item) == i

		# go through to extract the actual css chunks from output files
		# that is - before the correct ordering

		# 
		let svgs = Object.keys(meta.outputs).filter do $1.match(/\.svg$/)

		for own key,value of meta.outputs
			# let file = files.find do path.relative(cwd,$1.path) == key
			let file = value.#file


			if file and key.match(/\.css$/)
				let offset = 0
				let body = file.text
				let parts = []
				let debug = false # !!key.match(/server/)

				for own src,details of value.inputs
					let entry = meta.inputs[src]
					let bytes = details.bytesInOutput
					let header = "/* {src} */\n"

					if !minify?
						offset += header.length

					# details.start = body.substr(offset,30)
					let chunk = header + body.substr(offset,bytes) + '/* chunk:end */'
					offset += bytes
					offset += 1 if !minify?
					entry.output ||= chunk
					
					parts[entry.nr] = chunk

				if debug
					console.log 'reworked css stuff',value.inputs
					# ,parts.filter(do $1)

				# value.newoutput = parts.filter(do $1).join('\n')
				# file.contents = body
				file.contents = parts.filter(do $1).join('\n')


		inputs = meta.inputs
		outputs = meta.outputs
		self.meta = meta
		self.files = files
		return