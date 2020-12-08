import compiler from 'compiler'
import imba1 from 'compiler1'

import {parseAsset} from '../compiler/assets'

const esbuild = require 'esbuild'
const nodefs = require 'fs'
const path = require 'path'
const utils = require './utils'

export class Bundle
	get config
		bundler.config

	get node?
		platform == 'node'

	get web?
		!node?

	get puburl
		options.puburl or bundler.puburl or ''

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
		cwd = options.cwd
		
		platform = o.platform or 'browser'
		cachePrefix = "{o.platform}"
		entryPoints = o.entryPoints

		esoptions = {
			entryPoints: entryPoints
			target: o.target or ['es2019']
			bundle: o.bundle === false ? false : true
			define: o.define
			platform: o.platform == 'node' ? 'node' : 'browser'
			format: o.format or 'iife'
			outfile: o.outfile
			outdir: o.outfile ? '' : (o.outdir ? o.outdir : (node? ? bundler.libdir : bundler.pubdir))
			outbase: o.outbase or bundler.basedir
			globalName: o.globalName
			publicPath: o.publicPath or bundler.puburl
			banner: o.banner
			footer: o.footer
			splitting: o.splitting
			minify: !!o.minify
			incremental: bundler.incremental?
			loader: o.loader or {}
			write: false
			metafile: "metafile.json"
			external: o.external or undefined
			plugins: (o.plugins or []).concat({name: 'imba', setup: plugin.bind(self)})
			outExtension: o.outExtension
			# resolveExtensions: ['.imba.mjs','.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json']
			resolveExtensions: ['.imba','.imba1','.ts','.mjs','.cjs','.js','.json']
		}

		console.log esoptions
		
		# add default defines
		unless node?
			let defines = esoptions.define ||= {}
			let env = o.env or process.env.NODE_ENV or 'production'
			defines["process.env.NODE_ENV"] ||= "'{env}'"

		if o.bundle == false
			esoptions.bundle = false
			delete esoptions.external

		if o.splitting and esoptions.format != 'esm'
			esoptions.splitting = false

	def setup
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
			build.onResolve(filter: /^imba\//) do(args)
				return {path: 'blank', namespace: 'ext'}

			build.onLoad(filter: /.*/, namespace: 'ext') do(args)
				return {contents: ''}

		build.onResolve(filter: /\.imba\.(css)$/) do(args)
			let id = args.path
			# let resolved = path.resolve(args.resolveDir,id.replace(/\.css$/,''))
			return {path: args.path, namespace: 'styles'}

		build.onResolve(filter: /^@svg\//) do(args)
			return {path: args.path, namespace: 'asset'}

		(extdeps or extjson) and build.onResolve(filter: /.*/, namespace: 'file') do(args)
			let id = args.path
			let ns = args.namespace

			if extjson and id.match(/\.json$/)
				let abspath = path.resolve(args.resolveDir,id)
				let outpath = path.relative(esoptions.outdir,args.resolveDir)
				return {external: true, path: abspath}

			if extmap[id]
				return {external: true}
			return

		build.onLoad({ filter: /\.imba1?$/, namespace: 'file' }) do(args)
			let srcfile = fs.lookup(args.path)
			# console.log 'onload imba file',args.path,!!srcfile.#imba

			if srcfile.imba
				if let cached = srcfile.cache[#key]
					return cached.js

				let opts = {
					platform: platform || 'browser',
					format: 'esm',
					sourcePath: args.path,
					imbaPath: options.imbaPath or 'imba'
					styles: 'import' # always?
				}

				let code = await srcfile.imba.compile(opts)
				# console.log 'recompiled',srcfile.rel
				cached = srcfile.cache[#key] = {
					js: {contents: String(code)}
					# css: {
					# 	loader: 'css'
					# 	resolveDir: path.dirname(args.path)
					# 	contents: String(pre.css)
					# }
				}
				return cached.js

			let raw = await nodefs.promises.readFile(args.path, 'utf8')
			let key = "{cachePrefix}:{args.path}" # possibly more

			let t0 = Date.now()
			let iopts = {
				platform: platform || 'browser',
				format: 'esm',
				sourcePath: args.path,
				imbaPath: options.imbaPath or 'imba'
				sourceId: bundler.sourceIdForPath(args.path)
				config: config
				styles: 'extern'
				hmr: options.hmr
				bundle: options.bundle === false ? false : yes
				assets: config.#assets
			}

			let body = null

			if #cache[key] and #cache[key].input == raw
				
				return #cache[key].result

			let out = {
				errors: []
				warnings: []
			}

			# legacy handling
			if args.path.match(/\.imba1$/)

				iopts.filename = iopts.sourcePath
				iopts.inlineHelpers = 1
				out.contents = String(imba1.compile(raw,iopts))
			else
				let result = compiler.compile(raw,iopts)
				let id = result.sourceId
				body = result.js
				
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
					#cache[cssname] = {
						loader: 'css'
						contents: result.css
						resolveDir: path.dirname(args.path)
					}

					body += "\nimport '{cssname}';\n"

				out.contents = body


			#cache[key] = {
				input: raw,
				result: out
			}

			return out

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

		false && build.onLoad({ filter: /\.svg$/, namespace: 'file'}) do(args)
			console.log 'onload svg',args

			let content = await nodefs.promises.readFile(args.path,'utf8')
			return
			return {
				contents: content
				loader: 'text'
			}
			return
			# cache[args.path]
		
		

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

		# see if we have already built things before and nothing has changed?
		time 'hashing'
		for file in files
			# find the related entrypoint for this file
			# finding the related previously compiled file if rebuilding
			let outfile = bundler.relp(file.path)
			let output = meta.outputs[outfile]

			if output
				file.#output = output
				output.#file = file

			# assets should always go in the public folder? Maybe not json and text etc
			# need to figure out how to deal with that
			if node? and !file.path.match(/\.([cm]?js|css)(\.map)?$/)
				let rel = path.resolve(bundler.pubdir,path.relative(esoptions.outdir,file.path))
				file.path = rel
				if output
					delete meta.outputs[outfile]
					meta.outputs[outfile = bundler.relp(file.path)] = output

			let prev = self.files and self.files.find do $1.path == file.path
			let hash = file.hash = (file.path.match(/\.([A-Z\d]{8})\.\w+$/) or [])[1]
			let name = path.basename(file.path)

			if hash
				file.hashedName = name
			else
				hash = file.hash = utils.createHash(file.contents)
				file.hashedName = name.replace(/(?=\.\w+$)/,".{hash}")

			file.dirty = !prev or prev.hash != hash
			file.hashedPath = path.resolve(path.dirname(file.path),file.hashedName)

		timed 'hashing'

		unless files.some(do $1.dirty)
			return yes
		
		let o = options
		let styles = []

		for src in entryPoints
			let entry = meta.inputs[bundler.relp(src)]
			traverseInput(entry,meta.inputs,entry)
			styles.push(...entry.css)

		meta.css = styles.filter do(item,i) styles.indexOf(item) == i

		# go through to extract the actual css chunks from output files
		# that is - before the correct ordering
		let svgs = Object.keys(meta.outputs).filter do $1.match(/\.svg$/)

		for own key,value of meta.outputs
			# let file = files.find do path.relative(cwd,$1.path) == key
			let file = value.#file

			if file and key.match(/\.css$/)
				let offset = 0
				let body = file.text
				let parts = []

				for own src,details of value.inputs
					let entry = meta.inputs[src]
					let bytes = details.bytesInOutput
					let header = "/* {src} */\n"

					if !o.minify
						offset += header.length

					let chunk = header + body.substr(offset,bytes) + '/* chunk:end */'
					offset += bytes
					offset += 1 if !o.minify
					entry.output ||= chunk
					parts[entry.nr] = chunk

				file.contents = parts.filter(do $1).join('\n')

			elif file and key.match(/\.js$/)
				continue
				
				if svgs.length
					let names = svgs.map do path.basename($1)
					let urls = names.map do (puburl or '') + $1

					let append = ["globalThis[Symbol.for('#assets')] = globalThis[Symbol.for('#assets')] || \{\}"]
					let regex = new RegExp("({puburl or ''})(" + names.join("|") + ')(?=[\'"])','g')
					let js = file.text
					# just look through 
					file.contents = file.text.replace(regex) do(m,pre,name,qoute)
						let dest = svgs.find(do $1.indexOf(name) >= 0)
						let svg = meta.outputs[dest]
						let url = pre + name
						console.log 'found asset',m,name,svg,url
						if svg and svg.#file
							let raw = svg.#file.text
							# console.log raw
							append.push "globalThis[{url},{JSON.stringify(raw)})"
							return m
						return m
					
					file.contents = file.text + '\n' + append.join(';\n')
					console.log "find svg?",svgs,regex,append
				yes


		inputs = meta.inputs
		outputs = meta.outputs
		self.meta = meta
		self.files = files
		return