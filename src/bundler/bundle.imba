import compiler from 'compiler'
import imba1 from 'compiler1'

import {parseAsset} from '../compiler/assets'

const esbuild = require 'esbuild'
const nodefs = require 'fs'
const path = require 'path'
const utils = require './utils'
import Component from './component'

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

		let externals = []
		let package = bundler.package or {}
		for ext in o.external
			if ext == "dependencies"
				let deps = Object.keys(package.dependencies or {})
				externals.push(...deps)
			if ext == ".json"
				externals.push("*.json")
			externals.push(ext)
		
		let esentries = []
		for src,i in entryPoints
			let file = fs.lookup(src)
			if file and file.imba
				let real = file.imba.out[platform]
				entryPoints[i] = real.rel
		
		console.log 'real entries',esentries

		if options.exports
			let raw = options.exports
			entryPoints = entries = []
			if typeof raw == 'string'
				raw = {main: raw}

			# console.log 'exports!!',raw
			for own key, value of raw
				let paths = fs.nodes fs.glob(value)
				console.log 'found values',key,value
				for res in paths
					let slots = res.extractStarPattern(value)
					let name = key.replace(/\*/g) do(m) slots.shift!
					console.log res.rel,value,slots,name
					let esentry = res.rel # res.imba ? res.imba.out[platform].rel : res.rel
					entryNodes.push(res)
					entries.push(esentry)
					# we really need to ensure that this is being built, no?
					let out = esentry.replace(/\.(imba|[mc]?js)$/,'')
					outfileMap[out + '.bundle.js'] = name + '.js'   # out + '.bundle.js'
					outfileMap[out + '.bundle.css'] = name + '.css'
					# outfileMap[esentry.replace(/\.(imba|[mc]?js)$/,'.bundle.css')] = name + '.css'
			
			console.log 'entries',entries,outfileMap,cwd
			# entries.push("client2.imba")

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
			plugins: (o.plugins or []).concat({name: 'imba', setup: plugin.bind(self)})
			# outExtension: o.outExtension
			# resolveExtensions: ['.imba.mjs','.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json']
			resolveExtensions: [
				'.imba.mjs','.imba',
				'.imba1.mjs','.imba1',
				'.ts','.mjs','.cjs','.js'
			]
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
		let promises = for entry in entryNodes
			entry.load!
		
		await Promise.all(promises)
		self

	def resolveAsset name
		try config.#assets[name]

	def plugin build
		let externs = options.external or []
		let extdeps = externs.indexOf("dependencies") >= 0
		let extjson = externs.indexOf(".json") >= 0
		let extmap = {}
		if extdeps
			try
				for value in Object.keys(bundler.package..dependencies or [])
					extmap[value] = yes

		for key in externs when key[0] == '!'
			delete extmap[key.slice(1)]

		if options.imbaPath == 'global'
			build.onResolve(filter: /^imba(\/|$)/) do(args)
				# console.log 'onresolve imba'
				return {path: 'blank', namespace: 'ext'}

			build.onLoad(filter: /.*/, namespace: 'ext') do(args)
				return {contents: ''}

		false && build.onResolve(filter: /\.imba\.(css)$/) do(args)
			let id = args.path
			# let resolved = path.resolve(args.resolveDir,id.replace(/\.css$/,''))
			return {path: args.path, namespace: 'styles'}

		false and build.onResolve(filter: /.*/, namespace: 'file') do(args)
			# console.log 'onresolve all?'
			let id = args.path
			let ns = args.namespace

			if extjson and id.match(/\.json$/)
				let abspath = path.resolve(args.resolveDir,id)
				let outpath = path.relative(esoptions.outdir,args.resolveDir)
				return {external: true, path: abspath}

			if extmap[id]
				return {external: true}
			return

		build.onResolve(filter: /\.imba-css$/) do(args)
			console.log 'onresolve css',args # what if this is in a nested project?
			let id = args.path
			# let key = args.path.replace(//)
			# let resolved = path.resolve(args.resolveDir,id.replace(/\.css$/,''))
			return {path: args.path.replace(/-css$/,''), namespace: 'styles'}

		build.onResolve(filter: /\.zimba1?$/) do(args)
			console.log 'onresolve imba',args # what if this is in a nested project?
			let src = fs.lookup(args.path)
			await src.imba.load!
			let out = src.imba.out[platform]
			console.log 'resolved to',out.abs
			resolvedEntryMap[src.rel] = out.rel
			return {path: out.abs}
			# return {path: args.path, namespace: 'asset'}

		build.onLoad({ filter: /\.imba1?$/, namespace: 'file' }) do(args)
			
			let src = fs.lookup(args.path)
			await src.imba.load!
			let outfile = src.imba.out[platform]
			console.log 'onload imba',args.path # ,!!outfile.#body

			return {
				loader: 'js'
				contents: await outfile.read!
				# resolveDir: outfile.absdir
			}

		# nono?
		build.onLoad({ filter: /\.imba-css$/, namespace: 'file' }) do(args)
			console.log 'onload css',args
			let src = fs.lookup(args.path.replace(/\.css$/,''))
			await src.imba.load!
			# let outfile = src.imba.out[platform]

			return {
				loader: 'css'
				contents: await src.imba.out.css.read!
				resolveDir: outfile.absdir
			}

		build.onLoad({ filter: /.*/, namespace: 'styles'}) do(args)
			let id = args.path.replace(/\.css$/,'')
			let entry = fs.lookup(id).imba
			let body = await entry.getStyles!

			return {
				loader: 'css'
				contents: body
				resolveDir: path.dirname(id)
			}

			unless entry
				console.log 'could not find styles!!',args.path
			return entry.css

		build.onLoad({ filter: /@(assets|svg)\/.*/}) do(args)
			console.log 'onload asset'
			let id = args.path
			if #cache[id]
				return #cache[id]

			let name = id.replace('@svg/','')
			if let asset = resolveAsset(name)
				let body = await nodefs.promises.readFile(bundler.absp(asset.path),'utf8')
				let parsed = parseAsset({body: body},name)
				# console.log 'parsed asset',parsed

				let js = "
					export default {JSON.stringify(parsed)};
				"

				return #cache[id] = {contents: js,loader:'js'}
		

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

	def traverseInput entry, inputs, root = entry
		# console.log 'traverse',entry # ,inputs
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
		let metafile = utils.pluck(files) do $1.path.indexOf(esoptions.metafile) >= 0 # match(/metafile\.json$/)
		let meta = JSON.parse(metafile.text)

		# when compiling for node we need to make sure that assets and stylesheets
		# are saved in public folders alongside all the browser files.
		# console.log meta

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

			let name = path.basename(file.path)

			if hash
				file.hashedName = name
			else
				hash = file.hash = utils.createHash(file.contents)
				file.hashedName = name.replace(/(?=\.\w+$)/,".{hash}")

			file.dirty = !prev or prev.hash != hash
			file.hashedPath = path.resolve(path.dirname(file.path),file.hashedName)
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