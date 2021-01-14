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
let BUNDLE_COUNTER = 0


class Builder
	prop previous
	prop refs = {}
	prop inputs = {}
	prop outputs = new Set
	prop bundlers = {}


export default class Bundle < Component

	get node?
		platform == 'node'

	get web?
		!node?
	
	get o
		options

	get main?
		root == self

	get outdir
		o.outdir or fs.cwd

	get outbase
		o.outbase or fs.cwd

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
		id = options.id
		result = null
		built = no
		meta = {}
		name = options.name
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
			entryPoints: o.stdin ? undefined : entryPoints
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
			banner: "//__HEAD__" + (o.banner ? '\n' + o.banner : '')
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
		# log.debug 'init bundle',esoptions,o.outdir,program.imbaPath,program.cachedir
		# console.log "esbuild",esoptions

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
			if presets[typ]
				base.presets.push(presets[typ])
				Object.assign(base,presets[typ])

		return imbaconfig[key] = base # Object.create(base)

	def plugin build
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
				
		build.onResolve(filter: /.*/) do(args)
			# log.debug "resolve {args.path} from {args.importer}"
			return

		# Images imported from imba files should resolve as special assets
		# importing metadata about the images and more
		build.onResolve(filter: /(\.(svg|png|jpe?g|gif|tiff|webp)|\?as=img)$/) do(args)
			# only catch these when imported from an imba file?
			return unless isImba(args.importer) and args.namespace == 'file'
			let ext = np.extname(args.path).slice(1)
			let res = fs.resolver.resolve(args)
			let out = {path: res.#rel or res.path, namespace: 'img'}
			log.debug "resolved img {args.path} -> {out.path}"
			return out

		build.onLoad(namespace: 'img', filter: /.*/) do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js, resolveDir: file.absdir}
		

		build.onResolve(filter: /\?as=([\w\-\,\.]+)$/) do(args)
			let [path,q] = args.path.split('?')
			let formats = q.slice(3).split(',')
			let cfg = resolveConfigPreset(formats)
			let res = fs.resolver.resolve(path: path, resolveDir: args.resolveDir)
			let out = {path: res.#rel + '?' + q, namespace: 'entry'}
			# cfg.path = res.#rel
			pathMetadata[out.path] = {path: res.#rel, config: cfg}
			return out

		build.onLoad(namespace: 'entry', filter:/.*/) do({path})
			let id = "entry:{path}"
			let meta = pathMetadata[path]
			let cfg = meta.config
			# console.log 'onload custom entry',path,cfg.format,cfg.platform,cfg
			let file = fs.lookup(meta.path)
			
			# add this to something we want to resolve 
			if cfg.splitting
				# console.log "this item is splitting!!!"
				# not in web?!
				let js = """
				import \{asset\} from 'imba';
				export default asset(\{input: '{id}'\})
				"""
				let bundle = cfg.#bundler ||= new Bundle(root,Object.create(cfg))
				bundle.addEntrypoint(meta.path)
				builder.refs[id] = bundle
				return {loader: 'js', contents: js, resolveDir: np.dirname(path)}

			# return {loader: 'js', contents: ""}
			# now see if this is an image or what
			# should these rather be resolved at the very end after all bundles?
			console.log "lookup up bundle for id {id}"
			let bundler = root.#bundles[id] ||= new Bundle(root,Object.assign({entryPoints: [meta.path]},cfg))

			builder.refs[id] = bundler
			return {loader: 'js', contents: toAssetJS(input: id), resolveDir: file.absdir }

			let bundle = await bundler.rebuild!
			builder.refs[id] = bundle
			let input = bundle.meta.inputs[meta.path]

			# not for web?
			let data = {
				input: id
			}

			if web?
				# we dont include these when compiling to node because
				# we can pull this info from external manifest - to avoid
				# having to reload the server itself when assets change
				unless input and input.js
					console.log "INPUT OUTPUT NOT FOUND",path,input,bundle.meta.inputs
				data.url = input.js.url
				data.hash = input.js.hash
			
			# let body = 'export default ' + JSON.stringify(data) # .replace('$',id)
			return {loader: 'js', contents: toAssetJS(data), resolveDir: file.absdir }

		build.onResolve(filter: /^\//) do(args)
			return if args.path.indexOf('?') > 0
			console.log 'abs resolving absolute path',args,{path: args.path, external: yes}
			return {path: args.path, external: yes}

			if isCSS(args.importer)
				return {path: args.path, external: yes}

		build.onResolve(filter: /^imba(\/|$)/) do(args)
			if args.path == 'imba'
				let out = np.resolve(imbaDir,'index.imba')
				
				if node?
					return {path: out + '.js'}
				else
					return {path: out, namespace: 'file'}

			# if we're compiling for node we should resolve using the
			# package json paths?
			log.debug "IMBA RESOLVE",args.path,args.importer
			if args.path.match(/^imba\/(program|compiler|dist|runtime|src\/)/)
				return null

		# imba files import their stylesheets by including a plain
		# import '_styles_' line - which resolves to he path
		# of the importer itself, with a styles namespace
		build.onResolve(filter: /^_styles_$/) do({importer})
			return {path: importer, namespace: 'styles'}

		# resolve any non-relative path to see if it should
		# be external. If importer is an imba file, try to
		# also resolve it via the imbaconfig.paths rules.
		build.onResolve(filter: /^[\w\@]/) do(args)
			if externs.indexOf(args.path) >= 0
				return {external: true}

			if args.importer.indexOf('.imba') > 0
				# console.log 'resolving through imba',args.path
				return fs.resolver.resolve(args)
		
		# web entries are identified from urls like ./my/client.imba?asset-web
		build.onLoad(filter: /.*/, namespace: 'asset-web') do({path,namespace})
			let js = """
			import \{asset\} from 'imba';
			export default asset(\{input: 'asset-web:{path}'\})
			"""
			return {loader: 'js', contents: js, resolveDir: np.dirname(path)}

		# asset loader
		# a shared catch-all loader for all urls ending up in the asset namespce
		# where the paths may have additional details about
		build.onLoad(filter: /.*/, namespace: 'asset') do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js, resolveDir: file.absdir}

		# The main loader that compiles and returns imba files, and their stylesheets
		build.onLoad({ filter: /\.imba1?$/}) do({path,namespace})
			let src = fs.lookup(path)
		
			let t = Date.now!
			let res = await src.compile(imbaoptions,self)

			if namespace == 'styles'
				log.debug 'style took',Date.now! - t

			let cached = res[self] ||= {
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
		buildcache[self] ||= new Promise do(resolve)
			if (built =? true) or force
				esb = await startService!
				workers = await startWorkers!
				let t = Date.now!

				log.debug "build {entryPoints.join(',')} {o.format}|{o.platform} {nr}"
			
				try
					builder = new Builder(previous: builder)
					result = await esb.build(esoptions)
					
				catch e
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
							rebuild!

			return resolve(result)

	def rebuild {force = no} = {}
		return build(yes) unless built and esb and result and result.rebuild isa Function

		buildcache[self] ||= new Promise do(resolve)
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
					return resolve(result)

			let t = Date.now!
			let prev = result

			try
				builder = new Builder(previous: builder)
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

		# log.debug "paths",Object.keys(meta.inputs),Object.keys(meta.outputs)

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

		for own path,output of outs
			root.builder.outputs.add(output)

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
		let addOutputs = new Set

		for own path,dep of builder.refs
			let input = ins[path]
			let res = dep
			let rawpath = path.slice(path.indexOf(':') + 1).split('?')[0]

			if path and input and dep isa Bundle
				res = await dep.rebuild!

			let inp = res and res.meta and res.meta.inputs[rawpath]
			if inp
				# console.log "FOUND THE RAW PATH AS WELL!!!",rawpath
				input.asset = inp.js
				# console.log 'should add asset to the output',inp.js
				addOutputs.add(res.meta.outputs)

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
			let dependencies = new Set

			for own src,m of output.inputs
				if src.indexOf('entry:') == 0
					dependencies.add(ins[src])

				inputs.push [ins[src],m.bytesInOutput]
			
			output.dependencies = Array.from(dependencies)
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

			let header = []

			# web assets should not rely on an external manifest, so we loop through
			# the referenced assets / dependencies of this output and inject them
			# into a global asset map. We replace the first line (//BANNER) to make
			# sure sourcemaps are still valid (they are generated before we process outputs)
			if web?
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
			return asset if asset.#resolved or asset.hash
			asset.#resolved = yes

			if asset.type == 'js'
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

		for outs of addOutputs
			Object.assign(newouts,outs)
	
		# now update the paths in output
		outs = meta.outputs = newouts
		# log.debug "transformed",Date.now! - t
		return result

	def write result
		# after write we can wipe the buildcache
		#buildcache = {}
		let meta = result.meta
		let ins = meta.inputs
		let outs = meta.outputs
		let urls = meta.urls

		if meta.errors
			# emit errors - should be linked to the inputs from previous working manifest?
			return

		for out of builder.outputs
			console.log "output {out.path}"

		let manifest = result.manifest = {
			srcdir: outbase
			outdir: fs.resolve(o.tmpdir or o.outdir)
			inputs: ins
			outputs: outs
			urls: urls
		}

		let main = manifest.main = ins[o.stdin ? o.stdin.sourcefile : entryPoints[0]].js

		let writeFiles = {}
		let webEntries = []

		manifest.path = main.path + '.manifest'

		manifest.assets = Object.values(manifest.outputs)
		
		for item in manifest.assets
			if item.url
				manifest.urls[item.url] = item

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
				let file = #outfs.lookup(asset.path)
				await file.write(asset.#contents,asset.hash)

			# how can we see if manifest has changed at all? We really only want to write this when we have changes.
			let mpath = main and main.path + '.manifest'
			let mfile = #outfs.lookup(mpath)
			await mfile.writeSync json, manifest.hash
			
			self.manifest.update(json)

		try log.debug main.path,main.hash
		
		return result