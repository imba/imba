import {startService} from 'esbuild'
import {startWorkers} from './pooler'
import {pluck,createHash,diagnosticToESB} from './utils'

import {serializeData,deserializeData} from '../imba/utils'
import {Manifest} from '../imba/manifest'

import os from 'os'
import np from 'path'
import {Module} from 'module'

import FileSystem from './fs'
import Component from './component'
import {SourceMapper} from '../compiler/sourcemapper'

import Watcher from './watcher'

import SERVE_TEMPLATE from './templates/serve-http.txt'

const ASSETS_URL = '/__assets__/'

export default class Bundle < Component

	get node?
		platform == 'node'

	get web?
		!node?
	
	get o
		options

	get main?
		o.isMain

	get outdir
		o.outdir or fs.cwd

	get outbase
		o.outbase or fs.cwd

	get fs
		program.fs

	get config
		o.config or parent.config

	def constructor program,o
		super()
		#key = Symbol!
		#bundles = {}
		#watchedPaths = {}

		program = program
		styles = {}
		options = o
		id = options.id
		result = null
		built = no
		meta = {}
		name = options.name
		cwd = fs.cwd
		parent = o.parent
		platform = o.platform or 'browser'
		entryPoints = o.entryPoints
		pathLookups = {}
		children = new Set
		presult = {}

		if parent
			watcher = parent.watcher

		if o.watch or o.watcher
			watcher ||= o.watcher or new Watcher(fs)

		let externals = []
		let package = program.package or {}
		for ext in o.external
			if ext == "dependencies"
				let deps = Object.keys(package.dependencies or {})

				if o.execOnly
					deps.push( ...Object.keys(package.devDependencies or {}) )

				for dep in deps
					unless o.external.indexOf("!{dep}") >= 0
						externals.push(dep)

			if ext == ".json"
				externals.push("*.json")
			externals.push(ext)

		esoptions = {
			entryPoints: entryPoints
			bundle: o.bundle === false ? false : true
			define: o.define
			platform: o.platform == 'node' ? 'node' : 'browser'
			format: o.format or 'esm'
			outfile: o.outfile
			outbase: fs.cwd
			outdir: fs.cwd

			outExtension: {
				".js": ".__dist__.js"
				".css": ".__dist__.css"
			}
			globalName: o.globalName
			publicPath: o.publicPath or ASSETS_URL
			banner: o.banner or "//BANNER"
			footer: o.footer
			splitting: o.splitting
			sourcemap: o.sourcemap
			stdin: o.stdin
			minify: o.minify
			incremental: !!watcher
			loader: o.loader or {
				".png": "file",
				".svg": "file",
				".woff2": "file",
				".woff": "file",
				".ttf": "file",
				".otf": "file"
			}
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

		if !node? and false
			let defines = esoptions.define ||= {}
			let env = o.env or process.env.NODE_ENV or 'production'
			defines["process.env.NODE_ENV"] ||= "'{env}'"
			defines["ENV_DEBUG"] ||= "false"

		if o.bundle == false
			esoptions.bundle = false
			delete esoptions.external

		if o.splitting and esoptions.format != 'esm'
			esoptions.format = 'esm'

		if main?
			# not if main entrypoint is web?
			log.ts "created main bundle"
			manifest = new Manifest(data: {})

			if node?
				# esoptions.banner = "globalThis.IMBA_MANIFEST_PATH = '{manifest.path}';"
				# esoptions.banner = "require('{o.imbaPath}/index.js')._run_(module,__filename);"
				esoptions.banner = "//BANNER"	
		
		log.debug 'init bundle',esoptions
		# console.log "esbuild",esoptions
		

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

	def plugin build
		let externs = esoptions.external or []

		let imbaDir = program.imbaPath
		let isCSS = do(f) (/^styles:/).test(f) or (/\.css$/).test(f)
		let isImba = do(f) (/\.imba$/).test(f) and f.indexOf('styles:') != 0 # (/^styles:/).test(f) or 

		const namespaceMap = {
			svg: 'asset'
			link: 'web'
			script: 'web'
			style: 'web'
		}

		let toLoadResult = do(object,compilation)
			if compilation.errors
				console.log 'converting errors'

		build.onResolve(filter: /^\//) do(args)
			console.log 'abs resolving absolute path',args,{path: args.path, external: yes}
			return {path: args.path, external: yes}

			if isCSS(args.importer)
				return {path: args.path, external: yes}

		build.onResolve(filter: /^imba(\/|$)/) do(args)
			if args.path == 'imba'
				return
				let sub = 'index.imba'
				if node?
					sub = 'dist/node/imba.js'
					return {path: 'imba', external: yes}
					return {path: np.resolve(imbaDir,sub), external: yes}

				return {path: np.resolve(imbaDir,sub) }
			
			# if we're compiling for node we should resolve using the
			# package json paths?
			log.debug "IMBA RESOLVE",args.path,args.importer
			if args.path.match(/^imba\/(program|compiler|dist|runtime|src\/)/)
				return null

			# find this imbaDir relative to resolveDir?
			let real = "{imbaDir}/src/{args.path}.imba"
			# console.log 'real imba path',real,args.path
			return {path: real}

		build.onResolve(filter: /\.(svg|png|jpe?g|gif|tiff|webp)$/) do(args)
			# only catch these when imported from an imba file?
			return unless isImba(args.importer) and args.namespace == 'file'
			let ext = np.extname(args.path).slice(1)
			let res = fs.resolver.resolve(args,pathLookups)
			res.namespace = 'asset-img'
			return res

		build.onResolve(filter: /\?([\w\-]+)$/) do(args)
			# TODO demand ?asset- prefix
			let res = fs.resolver.resolve(args,pathLookups)
			let ns = res.namespace = namespaceMap[res.namespace] or res.namespace

			# console.log 'onResolve asset2',args,res

			if ns == 'serviceworker'
				res.namespace = 'entry'
				res.path = "{ns}:{res.path}"

			return res

		build.onResolve(filter: /^(serviceworker|worker)\:/) do(args)
			let res = fs.resolver.resolve(args,pathLookups)
			res.path = "{res.namespace}:{res.path}"
			res.namespace = 'entry'
			return res

		build.onResolve(filter: /^_styles_$/) do({importer})
			return {path: importer, namespace: 'styles'}

		build.onResolve(filter: /^[\w\@]/) do(args)
			# return if args.path.indexOf('imba') == 0'

			if externs.indexOf(args.path) >= 0
				return {external: true}

			if args.importer.indexOf('.imba') > 0
				# console.log 'resolving through imba',args.path,externs
				return fs.resolver.resolve(args,pathLookups)

		build.onLoad(filter: /.*/, namespace: 'asset-svg') do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js}

		build.onLoad(filter: /.*/, namespace: 'asset-img') do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js, resolveDir: file.absdir}
		
		build.onLoad(filter: /.*/, namespace: 'asset-web') do({path,namespace})
			let js = """
			import \{asset\} from 'imba';
			export default asset(\{input: 'asset-web:{path}'\})
			"""
			return {loader: 'js', contents: js, resolveDir: np.dirname(path)}

		build.onLoad(filter: /.*/, namespace: 'asset-worker') do(args)
			let id = "asset-worker:{args.path}"

			let opts = {
				platform: 'worker'
				format: 'esm'
				entryPoints: [args.path]
				outdir: o.outdir
				minify: o.minify
				parent: self
			}

			if config.defaults.worker
				opts = Object.assign({},config.defaults.worker,opts)

			# should be cached at the top-level bundle, and all builds
			# during a single full build should resolve to the same build

			let bundler = #bundles[id] ||= new Bundle(program,opts)
			let bundle = await bundler.rebuild!
			presult[id] = bundle.meta

			let input = bundle.meta.inputs[args.path]

			# not for web?
			let data = {
				input: id
			}

			if web?
				data.url = input.js.url
				data.hash = input.js.hash

			let body = 'export default ' + JSON.stringify(data) # .replace('$',id)
			return {loader: 'js', contents: body}

		build.onLoad(filter: /.*/, namespace: 'asset') do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js}

		build.onLoad(filter: /.*/, namespace: 'script') do(args)
			throw "namespace script not supported"
			return {loader: 'text', contents: args.path}

		build.onLoad(filter: /.*/, namespace: 'web') do(args)
			let body = 'export default "$"'.replace('$',args.path)
			return {loader: 'js', contents: body}

		build.onLoad(filter: /.*/, namespace: 'worker') do(args)
			let src = "worker:{args.path}"
			log.debug "onLoad worker",args.path,src

			let opts = {
				platform: 'worker'
				splitting: no
				format: 'esm'
				entryPoints: [args.path]
				outdir: options.outdir
				minify: o.minify
				parent: self
			}

			let bundler = #bundles[src] ||= new Bundle(program,opts)
			let bundle = await bundler.rebuild!
			presult[src] = bundle.meta
			
			let input = bundle.meta.inputs[args.path]
			return {loader: 'text', contents: input.js.url}
		
		build.onLoad(filter: /^(serviceworker)\:.*/, namespace: 'entry') do(args)
			let parts = args.path.split(':')
			let path = parts.pop!
			let type = parts.shift!

			let opts = {
				entryPoints: [path]
				outdir: options.outdir
				sourcemap: o.sourcemap and yes	
				parent: self
			}

			if config.defaults[type]
				opts = Object.assign({},config.defaults[type],opts)

			let bundler = #bundles[args.path] ||= new Bundle(program,opts)
			let bundle = await bundler.rebuild!

			presult["entry:{args.path}"] = bundle.meta
			
			let input = bundle.meta.inputs[path]
			return {loader: 'text', contents: input.js.url}
	
		build.onLoad({ filter: /\.imba1?$/}) do({path,namespace})
			# if namespace == 'styles'
			#	console.log "LOADING STYLE?",path

			let src = fs.lookup(path)

			let t = Date.now!
			let res = await src.compile(imbaoptions,self)
			if namespace == 'styles'
				log.debug 'style took',Date.now! - t

			let cached = res[#key] ||= {
				file: {
					loader: 'js',
					contents: SourceMapper.strip(res.js or "") + (res.css ? "\nimport '_styles_';" : "")
					errors: res.errors.map(do diagnosticToESB($1,file: src.abs, namespace: namespace))
					warnings: res.warnings.map(do diagnosticToESB($1,file: src.abs, namespace: namespace))
					resolveDir: src.absdir
				}
				styles: {
					loader: 'css'
					contents: SourceMapper.strip(res.css or "")
					resolveDir: src.absdir
				}
			}
			return cached[namespace]

	def build force = no
		if (built =? true) or force
			esb = await startService!
			workers = await startWorkers!
			let t = Date.now!
			try
				presult = {#prev: presult}
				result = await esb.build(esoptions)
			catch e
				# console.log "ERRORED WHEN BUILDING!!",e.errors
				result = e

			await transform(result)

			if main?
				await write(result)

			unless o.watch
				esb.stop!
				esb = null
				workers.stop!
				workers = null

			# only add this once
			if watcher and main? and (#watching =? true)
				watcher.start!
				watcher.on('touch') do
					# console.log "watcher touch",$1,#watchedPaths,#id
					clearTimeout(#rebuildTimeout)
					#rebuildTimeout = setTimeout(&,100) do
						clearTimeout(#rebuildTimeout)
						rebuild(watcher: watcher)

		return result

	def rebuild {force = no} = {}
		return build(yes) unless built and esb and result and result.rebuild isa Function

		# console.log 'start rebuild',force
		# let changes = fs.changelog.pull(self)
		# for the main one we need to look at all potential inputs
		if watcher and !force
			let changes = watcher.sync(self)
			let dirty = no
			for [path,flags] in changes
				if #watchedPaths[path] or flags != 1
					dirty = yes

			unless dirty
				return result

		let t = Date.now!
		let prev = result

		try
			presult = {#prev: presult}
			let rebuilt = await result.rebuild!
			result = rebuilt
		catch e
			result = e
		
		await transform(result,prev)
		
		if main?
			await write(result,prev)
			if result.errors
				log.error 'failed rebuilding in %ms',Date.now! - t
			else
				log.info 'finished rebuilding in %ms',Date.now! - t
		return result

	def write result
		let meta = result.meta
		let ins = meta.inputs
		let outs = meta.outputs
		let urls = meta.urls

		if meta.errors
			# emit errors - should be linked to the inputs from previous working manifest?
			return

		let manifest = result.manifest = {
			srcdir: outbase
			outdir: fs.resolve(o.tmpdir or o.outdir)
			inputs: {
				node: ins
				web: {}
				worker: {}
			}
			outputs: outs
			urls: urls
		}

		let main = manifest.main = ins[o.stdin ? o.stdin.sourcefile : entryPoints[0]].js

		let writeFiles = {}
		let webEntries = []

		manifest.path = main.path + '.manifest'

		for own path,input of ins
			if path.indexOf('web:') == 0
				webEntries.push(path.slice(4))
			elif path.indexOf('asset-web:') == 0
				webEntries.push(path.slice(10))
				webEntries[path.slice(10)] = input
		
		if webEntries.length
			let opts = {
				platform: 'browser'
				splitting: yes
				entryPoints: webEntries
				outdir: fs.cwd
				minify: o.minify
				sourcemap: o.sourcemap and yes
				parent: self
			}

			let bundler = #bundles.web ||= new Bundle(program,opts)
			let bundle = await bundler.rebuild!

			manifest.inputs.web = bundle.meta.inputs

			for own k,v of bundle.meta.inputs
				if webEntries[k]
					# console.log 'found asset input for this?'
					webEntries[k].asset = v.js

			for own k,v of bundle.meta.outputs
				outs[k] = v
				urls[v.url] = v if v.url

		# continue walking through to look for 

		manifest.assets = Object.values(manifest.outputs)

		# a sorted list of all the output hashes is a fast way to
		# see if anything in the bundle has changed or not
		manifest.hash = createHash(Object.values(outs).map(do $1.hash or $1.path).sort!.join('-'))
		
		#outfs ||= new FileSystem(o.outdir,program)

		log.ts "ready to write"

		if #hash =? manifest.hash
			let json = serializeData(manifest)
			log.info "building in %path",o.outdir
			log.debug "memory used: %bold",process.memoryUsage!.heapUsed / 1024 / 1024
			
			# console.log 'ready to write',manifest.assets.map do $1.path
			for asset in manifest.assets
				log.debug "try to write path {asset.path}"
				let file = #outfs.lookup(asset.path)
				await file.write(asset.#contents,asset.hash)

			# how can we see if manifest has changed at all? We really only want to write this when we have changes.
			let mpath = main and main.path + '.manifest'
			let mfile = #outfs.lookup(mpath)
			await mfile.writeSync json, manifest.hash
			
			self.manifest.update(json)

		try log.debug main.path,main.hash
		
		return result

	###
	Go through the generated files - create hashes for the file-contents and rewrite
	the paths and references for the bundle - ready to write to the file system.

	Normalize the files and 
	###
	def transform result, prev
		# console.log 'transforming',result
		let t = Date.now!
		if result isa Error
			console.log 'result is error!!',result
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
		let metafile = pluck(files) do $1.path.indexOf(esoptions.metafile) >= 0
		let meta = JSON.parse(metafile.text)

		log.debug "paths",Object.keys(meta.inputs),Object.keys(meta.outputs)

		meta = result.meta = {
			inputs: meta.inputs
			outputs: meta.outputs
			urls: {}
		}
		
		let ins = meta.inputs
		let outs = meta.outputs
		let urls = meta.urls

		let reloutdir = np.relative(fs.cwd,esoptions.outdir)

		for file in files
			let path = np.relative(fs.cwd,file.path)

			if outs[path]
				outs[path].#file = file
				outs[path].#contents = file.contents
				file.#output = outs[path]
			else
				console.log 'could not map the file to anything!!',file.path,path,reloutdir

		let tests = {
			js: ".__dist__.js"
			css: ".__dist__.css"
			map: ".__dist__.js.map"
		}

		for own path,input of ins
			input.#type = input._ = 'input'
			input.path = path
			input.imports = input.imports.map do ins[$1.path]
			watchPath(path)
			# what about sourcemaps?
			let outname = path.replace(/\.(imba1?|[cm]?jsx?|tsx?)$/,"")
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
			output.type = (np.extname(path) or '').slice(1)

			if web? or output.type == 'css'
				output.path = "public/__assets__/{path}"
				output.url = "/__assets__/{path}"

			let inputs = []
			for own src,m of output.inputs
				inputs.push [ins[src],m.bytesInOutput]
			
			output.inputs = inputs

			if output.type == 'css' and !output.#ordered
				let origPaths = inputs.map(do $1[0].path )
				let corrPaths = []

				if output.source
					walker.collectCSSInputs(output.source,corrPaths)

				# console.log "correct css files",corrPaths.map do $1.path
				# due to bugs in esbuild we need to reorder the css chunks according to inputs?
				let offset = 0
				let body = output.#file.text
				let chunks = []

				for [input,bytes] in inputs
					let header = "/* {input.path} */\n"

					# check if the order is correct first?
					
					if !o.minify
						offset += header.length
					
					let chunk = header + body.substr(offset,bytes) + '/* chunk:end */'
					let index = corrPaths.indexOf(input)

					offset += bytes
					offset += 1 if !o.minify

					# chunks[index] = chunk
					chunks[index] = chunk
					# chunks.push(chunk)
					# console.log 'got chunk',chunk
				
				let text = chunks.filter(do $1).join('\n')
				# console.log 'new text',text.length,body.length
				output.#ordered = yes
				output.#contents = text


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

			while true
				start = body.indexOf('/__assets__/',end)
				break if start == -1
				delim = body[start - 1]
				end = start + 10
				delim = ')' if delim == '('
				while body[end] != delim
					end++

				path = body.slice(start,end)
				let asset = urlOutputMap[path]
				# what if it is referencing itself?
				if asset
					await walker.resolveAsset(asset)
					if asset.url != path
						# need to pad the length of the import to fix relative asset urls
						body = body.slice(0,start) + asset.url + body.slice(end)
						# console.log 'resolved found asset',asset.path,asset.hash
			return body
		
		walker.resolveAsset = do(asset)
			return asset if asset.#resolved or asset.hash
			# console.log 'resolving file',asset.path
			asset.#resolved = yes

			if asset.type == 'js'
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
				let sub = o.hashing !== false ? ".{asset.hash}." : "."
				asset.originalPath = asset.path
				if asset.url
					asset.url = asset.url.replace('.__dist__.',sub)

				asset.path = asset.path.replace('.__dist__.',sub)
				# now replace link to sourcemap as well
				if asset.type == 'js' and asset.map
					let orig = np.basename(asset.originalPath) + '.map'
					let replaced = np.basename(asset.path) + '.map'
					# console.log 'update url to the replaced map'
					asset.#contents = asset.#contents.replace(orig,replaced)
			return asset


		let newouts = {}

		for own path,output of outs
			await walker.resolveAsset(output)

			if !node? and output.url
				urls[output.url] = output

			newouts[output.path] = output

		for own path,input of ins
			if presult[path]
				log.debug "Add presult outputs {path}" # ,presult[path]

				let real = path.slice(path.indexOf(':') + 1)
				let asset = presult[path].inputs[real]
				if asset and asset.js
					# console.log "FOUND ASSET!",real
					input.asset = asset.js

				Object.assign(newouts,presult[path].outputs)

		# now update the paths in output
		outs = meta.outputs = newouts
		log.debug "transformed",Date.now! - t
		return result