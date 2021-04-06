import * as esbuild from 'esbuild'
import {startWorkers} from './pooler'
import {pluck,createHash,diagnosticToESB,injectStringBefore,builtInModules} from './utils'

import {serializeData,deserializeData} from '../imba/utils'
import {Manifest} from '../imba/manifest'

import os from 'os'
import np from 'path'
import nfs from 'fs'
import {Module} from 'module'

import FileSystem from './fs'
import Component from './component'
import {SourceMapper} from '../compiler/sourcemapper'

import Watcher from './watcher'

const ASSETS_URL = '/_ASSET_PREFIX_PATH_/'
let BUNDLE_COUNTER = 0


class Builder
	# prop previous
	prop startAt = Date.now!
	prop refs = {}
	prop inputs = {}
	prop outputs = new Set
	prop bundlers = {}
	prop meta = {}
	prop styles = {}

	get elapsed
		Date.now! - startAt

export default class Bundle < Component

	get node?
		platform == 'node'

	get web?
		!node?

	get dev?
		program.mode == 'development'

	get hmr?
		dev?

	# should generated files include hash of contents in filename?
	get hashing?
		(o.hashing !== false and program.hashing !== false)
	
	get o
		options

	get main?
		root == self

	get outdir
		o.outdir or fs.cwd

	get outbase
		o.outbase or fs.cwd

	get pubdir
		program.pubdir or 'public'
	
	get baseurl
		(program.baseurl or '/').replace(/\/$/,'')

	get fs
		program.fs

	get imbaconfig
		o.config or parent..imbaconfig

	get root
		parent ? parent.root : self

	get buildcache
		root.#buildcache

	# this allows us to uniquely use this as a unique key in any object
	# useful for things like metadata[bundle] = {...}
	def [Symbol.toPrimitive] hint
		#_id_ ||= Symbol!

	def constructor up,o
		super()
		#bundles = {}
		#watchedPaths = {}
		#buildcache = {}

		if up isa Bundle
			self.parent = up
			self.program = up.program
		else
			self.program = up

		nr = BUNDLE_COUNTER++
		styles = {}
		options = o
		result = null
		built = no
		meta = {}
		cwd = fs.cwd
		platform = o.platform or 'browser'
		entryPoints = o.entryPoints or []
		children = new Set
		builder = null

		if parent
			watcher = parent.watcher

		if o.watch or o.watcher
			watcher ||= o.watcher or new Watcher(fs)


		let externals = []
		let pkg = program.package or {}

		for ext in o.external
			continue if ext[0] == '!'

			if ext == "dependencies"
				let deps = Object.keys(pkg.dependencies or {})

				if o.execOnly # clarify this
					deps.push( ...Object.keys(pkg.devDependencies or {}) )

				externals.push(...deps)
			
			if ext == "builtins"
				externals.push(...Object.keys(builtInModules))

			if ext == ".json"
				externals.push("*.json")

			externals.push(ext)
		
		externals = externals.filter do(src)
			!o.external or o.external.indexOf("!{src}") == -1


		esoptions = {
			entryPoints: o.stdin ? undefined : entryPoints
			bundle: o.bundle === false ? false : true
			define: o.define
			platform: o.platform == 'node' ? 'node' : 'browser'
			format: o.format or 'esm'
			outfile: o.outfile
			outbase: fs.cwd
			outdir: fs.cwd
			outExtension: { ".js": ".__dist__.js", ".css": ".__dist__.css"}
			globalName: o.globalName
			publicPath: o.publicPath or ASSETS_URL
			banner: {
				js: "//__HEAD__" + (o.banner ? '\n' + o.banner : '')
			}
			footer: {js: o.footer or "//__FOOT__"}
			splitting: o.splitting
			sourcemap: (program.sourcemap === false ? no : (web? ? yes : 'inline'))
			stdin: o.stdin
			minify: program.minify
			incremental: !!watcher
			loader: o.loader or {
				".png": "file",
				".svg": "file",
				".woff2": "file",
				".woff": "file",
				".ttf": "file",
				".otf": "file",
				".html": "file"
			}
			write: false
			metafile: true
			external: externals
			tsconfig: o.tsconfig
			nodePaths: (o.nodePaths or []).slice(0) # (np.resolve(program.imbaPath,'polyfills'))
			plugins: (o.plugins or []).concat({name: 'imba', setup: plugin.bind(self)})
			pure: o.pure
			treeShaking: o.treeShaking
			resolveExtensions: ['.imba','.imba1','.ts','.mjs','.cjs','.js']
		}

		imbaoptions = {
			platform: o.platform
			css: 'external'
		}

		if o.sourcesContent !== undefined
			esoptions.sourcesContent = o.sourcesContent

		if o.platform == 'worker'
			# quick hack
			imbaoptions.platform = 'node'

		if o.format == 'css'
			esoptions.format = 'esm'
			esoptions.outExtension[".js"] = ".SKIP.js"

		if o.format == 'html'
			esoptions.format = 'esm'
			esoptions.minify = false
			esoptions.sourcemap = false

		let addExtensions = {
			webworker: ['.webworker.imba','.worker.imba']
			worker: ['.imba.web-pkg.js','.worker.imba']
			node: ['.node.imba']
			browser: ['.web.imba']
		}

		if addExtensions[o.platform]
			esoptions.resolveExtensions.unshift(...addExtensions[o.platform])

		if !node?
			let defines = esoptions.define ||= {}
			let env = o.env or process.env.NODE_ENV or 'production'
			defines["global"]="globalThis"
			defines["process.platform"]="'web'"
			defines["process.browser"]="true"
			esoptions.inject = [
				np.resolve(program.imbaPath,'polyfills','buffer','index.js'),
				np.resolve(program.imbaPath,'polyfills','__inject__.js')
			]
			defines["process.env.NODE_ENV"] ||= "'{env}'"
			defines["process.env"] ||= JSON.stringify(NODE_ENV: env)
			defines["ENV_DEBUG"] ||= "false"
			esoptions.nodePaths.push(np.resolve(program.imbaPath,'polyfills'))

		if o.bundle == false
			esoptions.bundle = false
			delete esoptions.external

		if o.splitting and esoptions.format != 'esm'
			log.error "code-splitting not allowed when format is not esm"
			# esoptions.format = 'esm'

		if main?
			# not if main entrypoint is web?
			log.ts "created main bundle"
			manifest = new Manifest(data: {})


	def addEntrypoint src
		entryPoints.push(src) unless entryPoints.indexOf(src)>= 0
		self

	def setup
		self

	def watchPath path
		unless #watchedPaths[path]
			#watchedPaths[path] = 1
			if parent
				parent.watchPath(path)
			elif watcher and path.indexOf(':') == -1
				watcher.add path.slice(0,path.lastIndexOf('/'))
		self

	def resolveConfigPreset types = []
		let key = Symbol.for(types.join('+'))
		if imbaconfig[key]
			return imbaconfig[key]

		let base = {presets: []}
		let presets = imbaconfig.defaults

		for typ in types
			let pre = presets[typ] or {}
			base.presets.push(pre)
			let curr = pre
			let add = [pre]
			# extends need to be smarter than this flat assign
			while curr.extends and add.length < 10
				add.unshift(curr = presets[curr.extends])
			for item in add
				Object.assign(base,item)

		return imbaconfig[key] = base # Object.create(base)

	def plugin esb
		let externs = esoptions.external or []

		let imbaDir = program.imbaPath
		let isCSS = do(f) (/^styles:/).test(f) or (/\.css$/).test(f)
		let isImba = do(f) (/\.imba$/).test(f) and f.indexOf('styles:') != 0 # (/^styles:/).test(f) or 

		let pathMetadata = {}

		let toAssetJS = do(object)
			let json = JSON.stringify(object)
			let js = """
			import \{asset\} from 'imba';
			export default asset({json})
			"""

		if o.resolve
			let regex = new RegExp("^({Object.keys(o.resolve).join('|')})$")

			esb.onResolve(filter: regex) do(args)
				let res = o.resolve[args.path]
				res = res and res[platform] or res
				return res

		# Images imported from imba files should resolve as special assets
		# importing metadata about the images and more
		esb.onResolve(filter: /(\.(svg|png|jpe?g|gif|tiff|webp)|\?as=img)$/) do(args)
			return unless isImba(args.importer) and args.namespace == 'file'
			
			if o.format == 'css'
				return {path: "_", namespace: 'imba-raw'}

			let ext = np.extname(args.path).slice(1)
			let res = fs.resolver.resolve(args)
			let out = {path: res.#rel or res.path, namespace: 'img'}
			# log.debug "resolved img {args.path} -> {out.path}"
			return out

		
		esb.onLoad(namespace: 'img', filter: /.*/) do({path})
			
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js, resolveDir: file.absdir}

		# resolve html file
		esb.onResolve(filter: /\.html$/) do(args)
			if isImba(args.importer) and args.namespace == 'file'				
				let cfg = resolveConfigPreset(['html'])
				let res = fs.resolver.resolve(path: args.path, resolveDir: args.resolveDir)
				let out = {path: res.#rel, namespace: 'entry'}
				pathMetadata[out.path] = {path: res.#rel, config: cfg}
				return out

		esb.onLoad(namespace: 'html', filter: /.*/) do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js, resolveDir: file.absdir}

		esb.onLoad(filter: /\.html$/, namespace: 'file') do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			builder.meta[file.rel] = out
			return {loader: 'js', contents: out.js, resolveDir: file.absdir}

		esb.onResolve(filter: /\?as=([\w\-\,\.]+)$/) do(args)
			let [path,q] = args.path.split('?')
			let formats = q.slice(3).split(',')
			let cfg = resolveConfigPreset(formats)
			let res = fs.resolver.resolve(path: path, resolveDir: args.resolveDir)
			let out = {path: res.#rel + '?' + q, namespace: 'entry'}
			pathMetadata[out.path] = {path: res.#rel, config: cfg}
			return out

		esb.onLoad(namespace: 'entry', filter:/.*/) do({path})
			# skip entrypoints if compiling for css only
			if o.format == 'css'
				return {path: "_", namespace: 'imba-raw'}

			let id = "entry:{path}"
			let meta = pathMetadata[path]
			let cfg = meta.config
			# console.log 'onload custom entry',path,cfg.format,cfg.platform,cfg,meta
			let file = fs.lookup(meta.path)

			# add this to something we want to resolve 
			if cfg.splitting
				let js = """
				import \{asset\} from 'imba';
				export default asset(\{input: '{id}'\})
				"""
				let bundle = cfg.#bundler ||= new Bundle(root,Object.create(cfg))
				bundle.addEntrypoint(meta.path)
				builder.refs[id] = bundle
				if o.format == 'html'
					return {loader: 'text', contents: id}

				
				return {loader: 'js', contents: js, resolveDir: np.dirname(path)}

			log.debug "lookup up bundle for id {id}"
			# adding it as a child of root is risky wrt correctly invalidating nested bundles
			let bundler = root.#bundles[id] ||= new Bundle(root,Object.assign({entryPoints: [meta.path]},cfg))
			builder.refs[id] = bundler

			unless cfg.format == 'css'
				bundler.rebuild! # we can asynchronously start the rebundler
			
			if o.format == 'html'
				return {loader: 'text', contents: id}

			return {loader: 'js', contents: toAssetJS(input: id), resolveDir: file.absdir }

		esb.onResolve(filter: /^\//) do(args)
			return if args.path.indexOf('?') > 0
			return {path: args.path, external: yes}

		esb.onResolve(filter: /^imba(\/|$)/) do(args)
			if args.path == 'imba'
				if o.format == 'css'
					return {path: args.path, external: yes}

				let out = np.resolve(imbaDir,'index.imba')
				return {path: out, namespace: 'file'}

			# try to resolve imba files here?
			let rel = args.path.slice(args.path.indexOf('/') + 1)
			let path = np.resolve(imbaDir,rel)

			let exts = ['','.imba']
			if rel == 'program' or rel == 'compiler'
				exts.unshift('.imba.js')

			for ext in exts
				if nfs.existsSync(path + ext)
					return {path: path + ext}

			return null

			# if we're compiling for node we should resolve using the
			# package json paths?
			# log.debug "IMBA RESOLVE",args.path,args.importer
			# if args.path.match(/^imba\/(program|compiler|dist|runtime|src\/)/)
			#	# console.log 'resolving compiler?!',args,o.platform,o.format,esoptions.platform
			#	return null

		# imba files import their stylesheets by including a plain
		# import '_styles_' line - which resolves to he path
		# of the importer itself, with a styles namespace
		esb.onResolve(filter: /^_styles_$/) do({importer})
			let path = fs.relative(importer)
			return {path: path, namespace: 'styles'}

		# resolve any non-relative path to see if it should
		# be external. If importer is an imba file, try to
		# also resolve it via the imbaconfig.paths rules.
		esb.onResolve(filter: /^[\w\@]/) do(args)
			if externs.indexOf(args.path) >= 0
				return {external: true}

			if args.importer.indexOf('.imba') > 0
				let out = fs.resolver.resolve(args)
				# could drop this until we have consistent paths support?
				return out

		esb.onLoad(filter: /.*/, namespace: 'imba-raw') do({path})
			return {loader: 'text', contents: ""}
	
		# asset loader
		# a shared catch-all loader for all urls ending up in the asset namespce
		# where the paths may have additional details about
		esb.onLoad(filter: /.*/, namespace: 'asset') do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js, resolveDir: file.absdir}

		esb.onLoad({ filter: /\.imba$/, namespace: 'styles'}) do({path,namespace})
			if builder.styles[path]
				return builder.styles[path]
			else
				{loader: 'css', contents: ""}

		# The main loader that compiles and returns imba files, and their stylesheets
		esb.onLoad({ filter: /\.imba1?$/}) do({path,namespace})
			let src = fs.lookup(path)
		
			let t = Date.now!
			let res = await src.compile(imbaoptions,self)

			if res.css
				builder.styles[src.rel] = {
					loader: 'css'
					contents: SourceMapper.strip(res.css or "")
					resolveDir: src.absdir
				}
			
			let incStyles = res.css or o.format == 'css'

			let cached = res[self] ||= {
				loader: 'js',
				contents: SourceMapper.strip(res.js or "") + (incStyles ? "\nimport '_styles_';" : "")
				errors: res.errors.map(do diagnosticToESB($1,file: src.abs, namespace: namespace))
				warnings: res.warnings.map(do diagnosticToESB($1,file: src.abs, namespace: namespace))
				resolveDir: src.absdir
			}

			return cached

	def build force = no
		buildcache[self] ||= new Promise do(resolve)
			if (built =? true) or force
				workers = await startWorkers!

				log.debug "build {entryPoints.join(',')} {o.format}|{o.platform} {nr}"

				if o.stdin and o.stdin.template
					let tpl = fs.lookup( np.resolve(o.imbaPath,'src','templates',o.stdin.template) )
					let compiled = await tpl.compile({platform: 'node'},self)
					delete o.stdin.template

					let js = compiled.js
					let defs = o.stdin.define or {}
					js = js.replace(/\__([A-Z\_]+)__/g) do(m,name) defs[name]
					o.stdin.contents = js
					delete o.stdin.define
			
				try
					builder = new Builder(previous: builder)
					result = await esbuild.build(esoptions)
					firstBuild = result
				catch e
					result = e

				await transform(result)

				if main?
					await write(result)

				unless watcher
					workers.stop!
					workers = null

				# only add this once
				if watcher and main? and (#watching =? true)
					watcher.start!
					watcher.on('touch') do
						log.debug "watcher touch",$1
						clearTimeout(#rebuildTimeout)
						#rebuildTimeout = setTimeout(&,100) do
							clearTimeout(#rebuildTimeout)
							log.debug 'try rebuild',!!buildcache[self],o.watch
							rebuild!
		
			#buildcache = {}
			return resolve(result)

	def rebuild {force = no} = {}
		unless built and result and result.rebuild isa Function
			return build(yes) 

		buildcache[self] ||= new Promise do(resolve)
			# console.log 'start rebuild',force
			# let changes = fs.changelog.pull(self)
			# for the main one we need to look at all potential inputs
			if main?
				log.debug "starting rebuild!",!!watcher,force

			if watcher and !force
				let changes = watcher.sync(self)
				let dirty = no
				for [path,flags] in changes
					if #watchedPaths[path] or flags != 1
						dirty = yes

				# console.log 'rebuild?!',entryPoints,changes,dirty,#watchedPaths

				if main?
					log.debug "changes demanding a resolve?",changes,dirty

				unless dirty
					#buildcache = {}
					return resolve(result)

			let prev = result

			try
				builder = new Builder(previous: builder)
				let rebuilt = await firstBuild.rebuild!
				result = rebuilt
			catch e
				result = e
			
			await transform(result,prev)
			
			if main?
				await write(result,prev)
			#buildcache = {}
			return resolve(result)

	###
	Go through the generated files - create hashes for the file-contents and rewrite
	the paths and references for the bundle - ready to write to the file system.

	Normalize the files and 
	###
	def transform result, prev
		# console.log 'transforming',result
		let t = Date.now!
		if result isa Error
			log.debug 'result is error!!',result
			for err in result.errors
				watchPath(err.location.file)

			result.rebuild = prev and prev.rebuild.bind(prev)
			result.meta = {
				inputs: {}
				outputs: {}
				urls: {}
				errors: result.errors
				warnings: result.warnings
			}

			return result
	

		let files = result.outputFiles or []
		let meta = result.metafile
		# pluck(files) do $1.path.indexOf(esoptions.metafile) >= 0
		# let meta = JSON.parse(metafile.text)

		# log.debug "paths",Object.keys(meta.inputs),Object.keys(meta.outputs)

		meta = result.meta = {
			format: o.format
			platform: o.platform
			inputs: meta.inputs
			outputs: meta.outputs
			errors: [].concat(result.errors or [])
			warnings: [].concat(result.warnings or [])
			urls: {}
		}
		
		let ins = meta.inputs
		let outs = meta.outputs
		let urls = meta.urls

		let reloutdir = fs.relative(esoptions.outdir)

		for file in files
			let path = fs.relative(file.path)

			if outs[path]
				outs[path].#file = file
				outs[path].#contents = file.contents
				file.#output = outs[path]
			else
				console.log 'could not map the file to anything!!',file.path,path,reloutdir,Object.keys(outs),fs.cwd,esoptions.outdir

		let tests = {
			js: ".__dist__.js"
			css: ".__dist__.css"
			map: ".__dist__.js.map"
		}

		for own path,output of outs
			root.builder.outputs.add(output)

		for own path,input of ins
			input.#type = input._ = 'input'
			input.path = path
			input.imports = input.imports.map do ins[$1.path]
			watchPath(path)
			# what about sourcemaps?
			let outname = path.replace(/\.(imba1?|[cm]?jsx?|tsx?|html)$/,"")
			let jsout 
			for own key,ext of tests

				let name = outname.replace(/\.\.\//g,"_.._/") + ext
				name = "{reloutdir}/{name}" if reloutdir

				# log.debug "looking for path {name}"

				if outs[name]
					# Hook into parent inputs here?
					input[key] = outs[name]
					outs[name].source = input
					if key == 'js'
						jsout = outs[name]
					elif jsout
						jsout[key] = outs[name]

		let urlOutputMap = {}
		let walker = {}
		let addOutputs = new Set

		for own path,dep of builder.refs
			let input = ins[path]
			let res = dep
			let rawpath = path.slice(path.indexOf(':') + 1).split('?')[0]

			if path and input and dep isa Bundle
				res = await dep.rebuild!

			let inp = res and res.meta and res.meta.inputs[rawpath]

			if dep isa Bundle
				Object.assign(#watchedPaths,dep.#watchedPaths)

			if inp
				# console.log "FOUND THE RAW PATH AS WELL!!!",rawpath
				input.asset = res.meta.format == 'css' ? inp.css : inp.js
				# console.log 'should add asset to the output',inp.js
				addOutputs.add(res.meta.outputs)

			if res and res.meta
				# just register on root - or push to parent?
				meta.errors.push(...res.meta.errors)
				meta.warnings.push(...res.meta.warnings)


		walker.collectCSSInputs = do(input, matched = [], visited = [])
			if visited.indexOf(input) >= 0
				return matched

			visited.push(input)

			if input.path.match(/(^styles:)|(\.css$)/)  # or input.path.match(/^styles:/)
				matched.push(input)
				
			for item in input.imports
				walker.collectCSSInputs(item,matched,visited)

			return matched
		
		for own path,output of outs
			output.#type = output._ = 'output'
			output.path = path

			# only when html is the entrypoint
			if output.source and output.source.path.match(/\.html$/) and output == output.source.js
				# console.log 'pubdir??',pubdir
				output.url = "{baseurl}/{path.replace('.js','.html')}"
				output.path = path = "{pubdir}/__assets__/{path.replace('.js','.html')}"
				# output.path = path.replace('.js','.html')
				# output.dir = 'public'

			elif web? or output.type == 'css' or path.match(/\.(png|svg|jpe?g|gif|webm|webp)$/)
				# output.dir = 'assets'
				output.path = "{pubdir}/__assets__/{path}"
				output.url = "{baseurl}/__assets__/{path}"

			output.type = (np.extname(path) or '').slice(1)

			let inputs = []
			let dependencies = new Set

			for own src,m of output.inputs
				if src.indexOf('entry:') == 0
					dependencies.add(ins[src])

				inputs.push [ins[src],m.bytesInOutput]
			
			output.dependencies = Array.from(dependencies)
			output.inputs = inputs

			# due to bugs in esbuild we need to reorder the css chunks
			if output.type == 'css' and !output.#ordered
				let origPaths = inputs.map(do $1[0].path )
				let corrPaths = []

				if output.source
					walker.collectCSSInputs(output.source,corrPaths)

				
				let offset = 0
				let body = output.#file.text
				let chunks = []

				for [input,bytes] in inputs
					let header = "/* {input.path} */\n"

					# check if the order is correct first?
					
					if !esoptions.minify
						offset += header.length
					
					let chunk = header + body.substr(offset,bytes) + '/* chunk:end */'
					let index = corrPaths.indexOf(input)

					offset += bytes
					offset += 1 if !esoptions.minify
					chunks[index] = chunk
				
				let text = chunks.filter(do $1).join('\n')
				# console.log 'new text',text.length,body.length
				output.#ordered = yes
				output.#contents = text

			# Workaround for esbuild bug that has been fixed
			if output.imports
				output.imports = output.imports.map do
					let chunk = $1.path.indexOf("/chunk.")
					$1.path = reloutdir + $1.path.slice(chunk) if chunk >= 0
					outs[$1.path]

			if let m = path.match(/\.([A-Z\d]{8})\.\w+$/)
				output.hash = m[1]
			elif m = path.match(/chunk\.([A-Z\d]{8})\.\w+\.(js|css)(\.map)?$/)
				output.hash = m[1]

			if output.url
				urlOutputMap[output.url] = output

		###
		Should probably use the original uint8 array rather than the text
		representation of body for performance reasons.
		###
		walker.replacePaths = do(body,output)
			let array = output.#contents
			let length = body.length
			let start = 0
			let idx = 0
			let end = 0
			let delim
			let breaks = {"'": 1, '"':1, '(':1, ')':1}
			let path
			let useRelativePaths = no

			while true
				start = body.indexOf(ASSETS_URL,end)
				break if start == -1
				delim = body[start - 1]
				end = start + 10
				delim = ')' if delim == '('
				while body[end] != delim
					end++

				path = body.slice(start,end)
				let origPath = path
				let rePath = origPath.replace(ASSETS_URL,'/__assets__/')
				let asset = urlOutputMap[path] or urlOutputMap[rePath]

				# what if it is referencing itself?
				if asset
					await walker.resolveAsset(asset)
					path = asset.url
				else
					# console.log 'asset not found',path,body.slice(start - 50,end)
					path = (baseurl + origPath.replace(ASSETS_URL,'/__assets__/'))
				
				if useRelativePaths
					let rel = np.relative(np.dirname(output.url),path)
					rel = './' + rel unless rel.match(/^\.\.?\//)
					path = rel

				if path != origPath
					# TODO adjust whitespace to make path same length
					let pad = origPath.length - path.length
					let post = body[end]
					
					if pad > 0
						post += " ".repeat(pad)

					body = body.slice(0,start) + path + post + body.slice(end + 1)

			let header = []

			# web assets should not rely on an external manifest, so we loop through
			# the referenced assets / dependencies of this output and inject them
			# into a global asset map. We replace the first line (//BANNER) to make
			# sure sourcemaps are still valid (they are generated before we process outputs)
			if o.format == 'html'
				try
					let mapping = {}
					let entryToUrlMap = {}

					for item in output.dependencies when item.asset
						let asset = await walker.resolveAsset(item.asset)
						entryToUrlMap[item.path] = asset.url


					body.replace(/(\w+_default\d*) = \"(.*)\"/g) do(m,name,path)
						mapping[name] = entryToUrlMap[path] or path

					let urls = body.match(/URLS = \[(.*)\]/)[1].split(/\,\s*/g).map do
						mapping[$1]

					if useRelativePaths
						# TODO fix relative paths
						yes

					let meta = builder.meta[output.source.path]
					
					if meta and meta.html
						let replaced = meta.html.replace(/ASSET_REF_(\d+)/g) do(m,nr)
							let url = urls[parseInt(nr)]
							return url
						# console.log 'html is',meta,replaced
						body = replaced
						if hmr?
							body = injectStringBefore(body,"<script src='/__hmr__.js'></script>",['<!--$head$-->','<!--$body$-->','<html',''])

			elif web?
				let mfname = "_$MF$_"
				for item in output.dependencies when item.asset
					let asset = await walker.resolveAsset(item.asset)
					let plain = {url: asset.url}
					header.push("{mfname}['{item.path}']={JSON.stringify(plain)};")
				
				if header.length
					header.unshift('var _$MF$_=(globalThis._MF_ = globalThis._MF_ || {});')
				body = header.join('') + body.slice(body.indexOf('\n'))


			return body
		
		walker.resolveAsset = do(asset)
			return asset if asset.#resolved
			asset.#resolved = yes

			if asset.hash
				asset.ttl = 31536000
				return asset

			if asset.type == 'js' or asset.type == 'html'
				log.debug "resolving assets in {asset.path}"
				asset.#text = asset.#file.text
				asset.#contents = await walker.replacePaths(asset.#text,asset)

			if asset.type == 'map'
				# console.log 'found map?!',asset,!!asset.source
				let js = asset.source..js
				if js
					await walker.resolveAsset(js)
					asset.hash = js.hash

			asset.hash ||= createHash(asset.#contents)

			if true
				# allow a fully custom pattern instead?
				let sub = hashing? ? ".{asset.hash}." : "."
				asset.originalPath = asset.path
				
				if sub != '.'
					asset.ttl = 31536000
				if asset.url
					asset.url = asset.url.replace('.__dist__.',sub)
					if sub == '.' and asset.hash and asset.type != 'map'
						yes
						# asset.url += '?v=' + asset.hash

				asset.path = asset.path.replace('.__dist__.',sub)
				# now replace link to sourcemap as well
				if asset.type == 'js' and asset.map
					let orig = np.basename(asset.originalPath) + '.map'
					let replaced = np.basename(asset.path) + '.map'
					asset.#contents = asset.#contents.replace(orig,replaced)
			return asset


		let newouts = {}

		for own path,output of outs
			continue if path.indexOf(".SKIP.") > 0
			await walker.resolveAsset(output)

			if !node? and output.url
				urls[output.url] = output

			newouts[output.path] = output

		for outs of addOutputs
			Object.assign(newouts,outs)
	
		# now update the paths in output
		outs = meta.outputs = newouts
		# log.debug "transformed",Date.now! - t
		return result

	def write result
		# after write we can wipe the buildcache
		#outfs ||= new FileSystem(o.outdir,program)
		
		let meta = result.meta
		let ins = meta.inputs
		let outs = meta.outputs
		let urls = meta.urls

		if meta.errors.length
			# emit errors - should be linked to the inputs from previous working manifest?
			log.error "failed with {meta.errors.length} errors",meta.errors
			emit('errored',meta.errors)
			return

		let manifest = result.manifest = {
			inputs: ins
			outputs: {}
			urls: urls
		}
		# console.log 'write',entryPoints,ins
		let main = manifest.main = ins[o.stdin ? o.stdin.sourcefile : entryPoints[0]].js
		let assets  = manifest.assets = Object.values(outs)

		let writeFiles = {}
		let webEntries = []

		manifest.path = main.path + '.manifest'
		
		for item in assets
			if item.url
				manifest.urls[item.url] = item

		# a sorted list of all the output hashes is a fast way to
		# see if anything in the bundle has changed or not
		

		log.ts "ready to write"
		let mfile = #outfs.lookup(manifest.path)
		manifest.srcdir = np.relative(mfile.abs,outbase)
		manifest.outdir = np.relative(mfile.abs,#outfs.cwd)

		if true
			# set output paths of html files - should not happen after resolving?
			let htmlFiles = assets.filter do $1.type == 'html'
			let htmlPaths = htmlFiles.map do $1.path.split('/')

			while htmlPaths[0] and htmlPaths[0].length > 1
				let start = htmlPaths[0][0]
				let shared = htmlPaths.every do $1[0] == start
				break unless shared

				for item in htmlPaths
					item.shift!
			
			for item,i in htmlFiles
				item.path = 'public/' + htmlPaths[i].join('/')

		for item in assets
			manifest.outputs[item.path] = item

		manifest.hash = createHash(assets.map(do $1.hash or $1.path).sort!.join('-'))

		if program.clean
			let rm = new Set
			# let op = self.manifest.outputs || {}
			let old = self.manifest.outputs || {}
			for own path,item of old
				unless outs[item.path]
					rm.add(#outfs.lookup(item.path))

			for file of rm
				await file.unlink!

		let loaderData = nfs.readFileSync(np.resolve(program.imbaPath,'loader.imba.js'),'utf-8')
		let loader = #outfs.lookup(main.path.replace(/(\.js)?$/,'.loader.js'))

		if #hash =? manifest.hash
			let json = serializeData(manifest)
			log.info "building in %path",o.outdir
			
			# console.log 'ready to write',manifest.assets.map do $1.path
			for asset in assets
				let path = asset.path
				let file = #outfs.lookup(path)
				await file.write(asset.#contents,asset.hash)

			if mfile
				await mfile.writeSync json, manifest.hash
			
			await loader.write(loaderData)

			self.manifest.path = mfile.abs
			self.manifest.update(json)

			



		try log.debug main.path,main.hash
		log.debug "memory used: %bold",process.memoryUsage!.heapUsed / 1024 / 1024

		log.info "finished in %ms - %heap",builder.elapsed
		return result