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

	def constructor bundler,o
		super()
		#key = Symbol!
		bundler = bundler
		styles = {}
		options = o
		result = null
		built = no
		meta = {}
		name = options.name
		cwd = fs.cwd
		platform = o.platform or 'browser'
		cachePrefix = "{o.platform}"
		entryPoints = o.entryPoints
		entryNodes = []
		outfileMap = {}
		pathLookups = {}
		ns = o.ns or o.platform == 'node' ? 'node' : 'browser'

		let externals = []
		let package = bundler.package or {}
		for ext in o.external
			if ext == "dependencies"
				let deps = Object.keys(package.dependencies or {})
				for dep in deps
					unless o.external.indexOf("!{dep}") >= 0
						externals.push(dep)

			if ext == ".json"
				externals.push("*.json")
			externals.push(ext)

		if options.include
			entryPoints = options.include.slice(0)
			self

		elif options.entries
			entryPoints = options.entries.slice(0)
			console.log 'got entries!',entryPoints
			self

		elif options.exports
			let raw = options.exports
			entryPoints = []
			if typeof raw == 'string'
				raw = {main: raw}

			# console.log 'exports!!',raw
			for own key, value of raw
				let paths = value.indexOf('*') >= 0 ? fs.glob(value) : [fs.lookup(value)]
				
				for res in paths
					# glob paths should not be resolved in constructor but rather in a dynamic index
					let slots = res.extractStarPattern(value)
					let name = key.replace(/\*/g) do(m) slots.shift!

					let esentry = res.rel # res.imba ? res.imba.out[platform].rel : res.rel
					entryNodes.push(res)
					entryPoints.push(esentry)

					let out = esentry.replace(/\.(imba|[mc]?js)$/,'')
					outfileMap[out + '.bundle.js'] = name + '.js'   # out + '.bundle.js'
					outfileMap[out + '.bundle.css'] = name + '.css'

		esoptions = {
			entryPoints: entryPoints
			bundle: o.bundle === false ? false : true
			define: o.define
			platform: o.platform == 'node' ? 'node' : 'browser'
			format: o.format or 'esm'
			outfile: o.outfile
			outbase: o.outbase or fs.cwd
			outdir: o.outfile ? undefined : (o.outdir or fs.cwd)
			outExtension: {
				".js": ".{ns}.js"
				".css": ".{ns}.css"
			}
			globalName: o.globalName
			publicPath: o.publicPath or '__assets__'
			banner: o.banner
			footer: o.footer
			splitting: o.splitting
			minify: program.options.minify
			incremental: program.options.watch
			loader: o.loader or {}
			write: false
			metafile: "metafile.json"
			external: externals
			tsconfig: o.tsconfig
			plugins: (o.plugins or []).concat({name: 'imba', setup: plugin.bind(self)})
			pure: o.pure
			treeShaking: o.treeShaking
			resolveExtensions: [
				'.imba.mjs','.imba',
				'.imba1.mjs','.imba1',
				'.ts','.mjs','.cjs','.js'
			]
		}

		imbaoptions = {
			platform: o.platform
			imbaPath: o.imbaPath
			css: 'external'
		}

		if esoptions.platform == 'browser'
			esoptions.resolveExtensions.unshift('.web.imba','.web.js')
		else
			esoptions.resolveExtensions.unshift('.node.imba','.node.js')

		unless node?
			let defines = esoptions.define ||= {}
			let env = o.env or process.env.NODE_ENV or 'production'
			defines["process.env.NODE_ENV"] ||= "'{env}'"
			defines["ENV_DEBUG"] ||= "false"

		if o.bundle == false
			esoptions.bundle = false
			delete esoptions.external

		if o.splitting and esoptions.format != 'esm'
			esoptions.format = 'esm'

		# console.log 'start with optons',esoptions

	def setup
		self

	def plugin build
		let externs = options.external or []

		let imbaDir = program.imbaPath
		let isCSS = do(f) (/^styles:/).test(f) or (/\.css$/).test(f)

		build.onResolve(filter: /^imba(\/|$)/) do(args)

			if args.path == 'imba'
				# console.log 'resolve imba',imbaDir
				return {path: np.resolve(imbaDir,'index.imba') }
			
			# if we're compiling for node we should resolve using the
			# package json paths?
			console.log "IMBA RESOLVE",args.path,args.importer
			if args.path.match(/^imba\/(program|compiler|dist|runtime|src\/)/)
				return null

			# find this imbaDir relative to resolveDir?
			let real = "{imbaDir}/src/{args.path}.imba"
			# console.log 'real imba path',real,args.path
			return {path: real}

		build.onResolve(filter: /\?asset$/) do(args)
			let resolved = program.resolver.resolve(args,pathLookups)
			return resolved

		build.onResolve(filter: /^styles:/) do({path})
			return {path: path.slice(7), namespace: 'styles'}

		build.onResolve(filter: /^\//) do(args)
			if isCSS(args.importer)
				return {path: args.path, external: yes}

		build.onResolve(filter: /^[\w\@]/) do(args)
			if args.importer.indexOf('.imba') > 0
				# console.log 'resolve',args
				return program.resolver.resolve(args,pathLookups)
	
		build.onLoad({ filter: /\.imba1?$/}) do({path,namespace})
			let src = fs.lookup(path)
			let res = await src.compile(imbaoptions)
			let cached = res[#key]
			unless cached
				cached = res[#key] ||= {
					file: {loader: 'js', contents: SourceMapper.strip(res.js or "")}
					styles: {loader: 'css', contents: SourceMapper.strip(res.css or "")}
				}
			return cached[namespace]

		build.onLoad(filter: /.*/, namespace: 'asset') do({path})
			let file = fs.lookup(path)
			let out = await file.compile(format: 'esm')
			return {loader: 'js', contents: out.js}

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
		write(result.outputFiles)
		bundler.rebuilt(self)

	# only needed for circumventing ordering bug in esbuild
	def traverseInput entry, inputs, root = entry
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
		let metafile = utils.pluck(files) do $1.path.indexOf(esoptions.metafile) >= 0
		let meta = JSON.parse(metafile.text)

		for own src,value of meta.inputs
			if !src.match(/^[\w\-]+\:/) and src.match(/\.(imba|css|svg|js|ts)$/)
				pathLookups[src] = yes

		time 'hashing'

		for file in files
			let id = fs.relative(file.path).replace(/^__dist__\//,'')
			let output = meta.outputs[id]
			let outfile = outfileMap[id] or id
			
			if output
				file.#output = output
				output.#file = file

			let public? = web? or !id.match(/\.([cm]?js|json)(\.map)?$/)

			# let outdir = public? ? pubdir : libdir # webdir?
			# file.path = fs.resolve(outdir,outfile)

			let prev = self.files and self.files.find do $1.path == file.path
			let hash = file.hash = (file.path.match(/\.([A-Z\d]{8})\.\w+$/) or [])[1]

			let name = np.basename(file.path)

			if hash
				file.hashedName = name
			else
				hash = file.hash = utils.createHash(file.contents)
				file.hashedName = name.replace(/(?=\.\w+$)/,".{hash}")

			file.dirty = !prev or prev.hash != hash
			file.hashedPath = np.resolve(np.dirname(file.path),file.hashedName)

		# console.log "hashed", time('hashing')
		unless files.some(do $1.dirty)
			return yes
		
		let o = options
		let styles = []

		for src in entryPoints
			let entry = meta.inputs[bundler.relp(src)]
			traverseInput(entry,meta.inputs,entry)
			styles.push(...entry.css)

		# workaround to fix css ordering issue in esbuild
		for own key,value of meta.outputs
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

				file.contents = parts.filter(do $1).join('\n')

		inputs = meta.inputs
		outputs = meta.outputs
		self.meta = meta
		self.files = files
		return