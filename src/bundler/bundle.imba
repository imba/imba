import compiler from 'compiler'
import imba1 from 'compiler1'

const esbuild = require 'esbuild'
const fs = require 'fs'
const path = require 'path'
const utils = require './utils'

export class Bundle
	get config
		bundler.config

	get node?
		platform == 'node'

	get web?
		!node?

	def time name = 'default'
		let now = Date.now!
		let prev = #timestamps[name] or now
		let diff = now - prev
		#timestamps[name] = now		
		return diff
	
	def timed name = 'default'
		let str = "time {name}: {time(name)}"

	def constructor bundler,o
		#timestamps = {}
		bundler = bundler
		styles = {}
		manifest = {}
		options = o
		result = null
		built = no
		cache = bundler.#cache or {}
		meta = {}

		name = options.name
		cwd = options.cwd
		
		platform = o.platform or 'browser'
		cachePrefix = "{o.platform}"
		entryPoints = o.entryPoints

		esoptions = {
			entryPoints: entryPoints
			target: o.target or ['es2019']
			bundle: true
			define: o.define
			platform: o.platform == 'node' ? 'node' : 'browser'
			format: o.format or 'iife'
			outfile: o.outfile
			outdir: o.outfile ? '' : (node? ? bundler.libdir : bundler.pubdir)
			outbase: o.outbase or bundler.srcdir
			globalName: o.globalName
			publicPath: o.publicPath or bundler.puburl
			banner: o.banner
			footer: o.footer
			splitting: o.splitting
			minify: !!o.minify
			incremental: o.watch
			loader: o.loader or {}
			write: false
			metafile: "metafile.json"
			external: o.external or undefined
			plugins: (o.plugins or []).concat({name: 'imba', setup: plugin.bind(self)})
			outExtension: o.outExtension
			resolveExtensions: ['.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json']
		}

		# console.log esoptions
		
		# add default defines
		unless node?
			let defines = esoptions.define ||= {}
			let env = o.env or process.env.NODE_ENV or 'production'
			defines["process.env.NODE_ENV"] ||= "'{env}'"

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
				let outpath = path.relative(esoptions.outdir,args.resolveDir)
				return {external: true, path: abspath}

			if extmap[id]
				return {external: true}
			return

		build.onLoad({ filter: /\.imba1?$/, namespace: 'file' }) do(args)
			let raw = await fs.promises.readFile(args.path, 'utf8')
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
			let t = Date.now!
			result = await esbuild.build(esoptions)
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
		for own key,value of meta.outputs
			# let file = files.find do path.relative(cwd,$1.path) == key
			let file = value.#file
			# value.#file = file
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

				let chunk = header + body.substr(offset,bytes) + '/* chunk:end */'
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