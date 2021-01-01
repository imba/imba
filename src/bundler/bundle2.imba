import {parseAsset} from '../compiler/assets'

import {startService} from 'esbuild'
import {startWorkers} from './pooler'
import {inspect} from 'util'
import {pluck,createHash} from './utils'

import {serializeData,deserializeData} from '../imba/utils'
import {Manifest} from '../imba/manifest'

const esbuild = require 'esbuild'
const nodefs = require 'fs'
const np = require 'path'

# const utils = require './utils'
import Component from './component'
import {SourceMapper} from '../compiler/sourcemapper'

import Watcher from './watcher'


export default class Bundle < Component
	get config
		bundler.config

	get node?
		platform == 'node'

	get web?
		!node?

	get minify?
		!!bundler.options.minify

	get watch?
		program.options.watch or options.watch

	get main?
		options.isMain

	get puburl
		options.puburl or bundler.puburl or ''

	get pubdir
		options.pubdir or bundler.pubdir or 'public'
	
	get libdir
		options.libdir or bundler.libdir or 'dist'

	get outdir
		options.outdir or fs.cwd

	get fs
		program.fs
	
	get program
		bundler.program

	def constructor bundler,o
		super()
		#key = Symbol!
		#bundles = {}
		#watchedPaths = {}

		bundler = bundler
		styles = {}
		options = o
		id = options.id
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
		children = new Set
		ns = o.id or o.ns or (o.platform == 'node' ? 'node' : 'browser')

		if o.watch
			watcher = new Watcher(fs)

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

		esoptions = {
			entryPoints: entryPoints
			bundle: o.bundle === false ? false : true
			define: o.define
			platform: o.platform == 'node' ? 'node' : 'browser'
			format: o.format or 'esm'
			outfile: o.outfile
			outbase: o.outbase
			outdir: o.outfile ? undefined : (o.outdir or fs.cwd)
			outExtension: {
				".js": ".__dist__.js"
				".css": ".__dist__.css"
			}
			globalName: o.globalName
			publicPath: o.publicPath or '/__assets__'
			banner: o.banner or "//BANNER"
			footer: o.footer
			splitting: o.splitting
			sourcemap: o.sourcemap
			minify: program.options.minify
			incremental: watch?
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

		if main?
			esoptions
			# manifest = fs.lookup("{o.outdir}/.manifest")
			# decide the output name aleady?
			# esoptions.banner = "globalThis.IMBA_MANIFEST_PATH='{manifest.abs}';"
			# esoptions.banner = "globalThis.IMBA_MANIFEST_PATH=__filename + '.manifest';"
			# include a path here as well!
			# log.info 'create manifset!!'
			manifest = new Manifest(data: {})
			esoptions.banner = "globalThis.IMBA_ENTRYPOINT=__filename;"

	def setup
		self

	def plugin build
		let externs = options.external or []

		let imbaDir = program.imbaPath
		let isCSS = do(f) (/^styles:/).test(f) or (/\.css$/).test(f)

		const namespaceMap = {
			svg: 'asset'
			link: 'web'
			script: 'web'
			style: 'web'
		}

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

		build.onResolve(filter: /\?(\w+)$/) do(args)
			let res = program.resolver.resolve(args,pathLookups)
			# console.log 'resolving?!',args.path,res
			res.namespace = namespaceMap[res.namespace] or res.namespace
			return res

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
			let res = await src.compile(imbaoptions,self)
			let cached = res[#key]
			unless cached
				cached = res[#key] ||= {
					file: {
						loader: 'js',
						contents: SourceMapper.strip(res.js or "")
						}
					styles: {
						loader: 'css'
						contents: SourceMapper.strip(res.css or "")
						resolveDir: src.absdir
					}
				}
			return cached[namespace]

		build.onLoad(filter: /.*/, namespace: 'asset') do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js}

		build.onLoad(filter: /.*/, namespace: 'script') do(args)
			return {loader: 'text', contents: args.path}

		build.onLoad(filter: /.*/, namespace: 'web') do(args)
			let body = 'export default "$"'.replace('$',args.path)
			return {loader: 'js', contents: body}

	def build force = no
		
		if (built =? true)
			esb = await startService!
			workers = await startWorkers!
			let t = Date.now!
			result = await esb.build(esoptions)
			await transform(result)
			unless watch?
				esb.stop!
				esb = null
				workers.stop!
				workers = null
			if watcher and main?
				watcher.on('touch') do
					# console.log "watcher touch",$1
					clearTimeout(#rebuildTimeout)
					#rebuildTimeout = setTimeout(&,50) do
						# what if we are currently building?
						clearTimeout(#rebuildTimeout)
						rebuild(watcher: watcher)
		return result

	def rebuild {force = no, watcher = null} = {}
		return build! unless built and esb

		# console.log 'start rebuild',force
		# let changes = fs.changelog.pull(self)
		# for the main one we need to look at all potential inputs
		if watcher
			let changes = watcher.sync(self)
			let dirty = no
			# console.log 'changes since last build',changes,Object.keys(result.meta.inputs)
			let inputs = result.meta.inputs
			for [path,flags] in changes
				if #watchedPaths[path] or inputs[path]
					dirty = yes
					# console.log "there is an input!!"
				elif flags != 1
					dirty = yes
					# console.log "file added or removed",path
			
			unless dirty
				return result

		let t = Date.now!
		let rebuilt = await result.rebuild!
		result = rebuilt
		await transform(result)
		if main?
			log.info 'finished rebuilding in %ms',Date.now! - t
		return result

	def write
		self

	###
	Go through the generated files - create hashes for the file-contents and rewrite
	the paths and references for the bundle - ready to write to the file system.
	###
	def transform result
		# console.log 'transforming',result

		let files = result.outputFiles
		let metafile = pluck(files) do $1.path.indexOf(esoptions.metafile) >= 0
		let meta = JSON.parse(metafile.text)

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
			css: ".__dist__.css"
			js: ".__dist__.js"
			map: ".__dist__.js.map"
		}

		for own path,input of ins			
			input.#type = input._ = 'input'
			input.path = path
			input.imports = input.imports.map do ins[$1.path]
			
			# what about sourcemaps?
			let outname = path.replace(/\.(imba|[cm]?jsx?|tsx?)$/,"")

			for own key,ext of tests
				let name = reloutdir + '/' + outname + ext
				if outs[name]
					input[key] = outs[name]
					outs[name].source = input

		let urlOutputMap = {}
		let walker = {}
		
		for own path,output of outs

			output.#type = output._ = 'output'
			output.path = path
			output.type = (np.extname(path) or '').slice(1)
			output.url = path.replace(reloutdir,esoptions.publicPath)

			let inputs = []
			for own src,m of output.inputs
				inputs.push [ins[src],m.bytesInOutput]
			
			output.inputs = inputs

			if output.imports
				output.imports = output.imports.map do
					let chunk = $1.path.indexOf("/chunk.")
					$1.path = reloutdir + $1.path.slice(chunk) if chunk >= 0
					outs[$1.path]

			if let m = path.match(/\.([A-Z\d]{8})\.\w+$/)
				output.hash = m[1]
			elif m = path.match(/chunk\.([A-Z\d]{8})\.\w+\.(js|css)$/)
				output.hash = m[1]

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

			asset.hash = createHash(asset.#contents)

			unless main?
				asset.url = asset.url.replace('.__dist__.',".{asset.hash}.")
				asset.originalPath = asset.path
				asset.path = asset.path.replace('.__dist__.',".{asset.hash}.")
			
			return asset

		let newouts = {}

		for own path,output of outs
			await walker.resolveAsset(output)

			unless node?
				urls[output.url] = output

			newouts[output.path] = output

		# console.log 'resolved files',Object.values(outs).map(do $1.path)

		# now update the paths in output
		outs = meta.outputs = newouts

		return result unless main?

		let manifest = result.manifest = {
			# path: mfile.abs
			assetsDir: np.resolve(fs.cwd,'dist','web')
			assetsUrl: '/__assets__'
			inputs: {
				node: ins
				web: {}
				worker: {}
			}
			outputs: outs
			urls: urls
		}

		let main = manifest.main = ins[entryPoints[0]].js

		let writeFiles = {}
		let webEntries = []

		for own path,input of ins
			if path.indexOf('web:') == 0
				webEntries.push(path.slice(4))
		
		if webEntries
			# let outdir = np.resolve(fs.cwd,'dist','web')
			let opts = {
				platform: 'browser'
				ns: id or 'browser'
				splitting: yes
				entryPoints: webEntries # should rather have a single entry?
				publicPath: manifest.assetsUrl # '/__assets__'
				outdir: manifest.assetsDir
				outbase: fs.cwd
			}

			let bundler = #bundles.web ||= new Bundle(program,opts)
			let bundle = await bundler.rebuild(watcher: watcher)

			manifest.inputs.web = bundle.meta.inputs

			for own k,v of bundle.meta.outputs
				outs[k] = v
				urls[v.url] = v if v.url

		manifest.assets = Object.values(manifest.outputs)

		let watchDirs = new Set

		let watchPaths = #watchedPaths ||= {}
		for own k,v of manifest.inputs
			for path in Object.keys(v)
				watchPaths[path] = 1
				unless path.indexOf(':') >= 0
					let pre = path.slice(0,path.lastIndexOf('/'))
					watchDirs.add(pre)

		if watcher
			watcher.add(...Array.from(watchDirs))
		# a sorted list of all the output hashes is a fast way to
		# see if anything in the bundle has changed or not
		manifest.hash = createHash(Object.values(outs).map(do $1.hash or $1.path).sort!.join('-'))

		# console.log 'watchDirs',Array.from(watchDirs)

		if #hash =? manifest.hash
			let json = serializeData(manifest)
			let manifestPath = main ? (main.path + '.manifest') : null
			let mfile = fs.lookup(manifestPath)

			for asset in manifest.assets
				let file = fs.lookup(asset.path)
				await file.write(asset.#contents,asset.hash)

			# how can we see if manifest has changed at all? We really only want to write this when we have changes.
			await mfile.writeSync json, manifest.hash
			self.manifest.update(json)

		# try log.info main.path,main.hash
		return result