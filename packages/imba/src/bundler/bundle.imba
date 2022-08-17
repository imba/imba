import * as esbuild from 'esbuild'
import {startWorkers} from './pooler'
import {pluck,createHash,diagnosticToESB,injectStringBefore,builtInModules,extendObject,replaceAll, normalizePath, relativePath, ImageRegex, FontRegex} from './utils'

import {StyleTheme} from '../compiler/styler'
import {serializeData,deserializeData} from '../imba/utils'
import {Manifest} from '../imba/manifest'

import os from 'os'
import np from 'path'
import nfs from 'fs'
import ncp from '../../vendor/ncp.js'
import {Module} from 'module'

import FileSystem from './fs'
import Component from './component'
import {SourceMapper} from '../compiler/sourcemapper'

import Watcher from './watcher'

const ASSETS_URL = '/_ASSET_PREFIX_PATH_/'
let BUNDLE_COUNTER = 0

const LOADER_SUFFIXES = {
	raw: 'text'
	text: 'text'
	copy: 'copy'
	dataurl: 'dataurl'
	binary: 'binary'
	file: 'file'
	url: 'file'
	base64: 'base64'
}

const LOADER_EXTENSIONS = {
	".png": "file",
	".bmp": "file",
	".apng": "file",
	".webp": "file",
	".heif": "file",
	".avif": "file",
	".svg": "file",
	".gif": "file",
	".jpg": "file",
	".jpeg": "file",
	".ico": "file",
	".woff2": "file",
	".woff": "file",
	".eot": "file",
	".ttf": "file",
	".otf": "file",
	".html": "text",
	".webm": "file",
	".weba": "file",
	".avi": "file",
	".mp3": "file",
	".mp4": "file",
	".m4a": "file",
	".mpeg": "file",
	".wav": "file",
	".ogg": "file",
	".ogv": "file",
	".oga": "file",
	".opus": "file"				
}


class Builder
	# prop previous - why not?
	prop startAt = Date.now!
	prop refs = {}
	prop inputs = {}
	prop outputs = new Set
	prop bundlers = {}
	prop meta = {}
	prop styles = {}
	prop entries = {}

	get elapsed
		Date.now! - startAt

export default class Bundle < Component

	prop hasGlobStylesheet

	get node?
		platform == 'node'

	get nodeworker?
		platform == 'nodeworker'
	
	get nodeish?
		node? or nodeworker?

	get web?
		!nodeish?

	get build?
		program.command == 'build'

	get serve?
		program.command == 'serve'

	get static?
		!!program.web or root.o.format == 'html'
	
	get webworker?
		platform == 'webworker' # or platform == 'web'
		
	get worker
		webworker? or nodeworker?
		
	get webish?
		web? or webworker?

	get dev?
		program.mode == 'development'

	get library?
		main? and !!program.lib

	get hmr?
		program.hmr == yes

	# should generated files include hash of contents in filename?
	get hashing?
		(o.hashing !== false and program.hashing !== false)
	
	get o
		options

	get main?
		root == self

	get outdir
		program.outdir or fs.cwd

	get outbase
		o.outbase or fs.cwd
	
	get assetNames
		program.assetNames or 'assets/[dir]/[name]'

	get assetsDir
		o.assetsDir or program.assetsDir or 'assets'
		
	get htmlNames
		program.htmlNames or '[dir]/[name]'

	get pubdir
		program.pubdir == false ? '.' : (program.pubdir or (static? ? '.' : 'public'))
	
	get srvdir
		program.srvdir == false ? '.' : (program.srvdir or '.')
	
	# optional prefix prepended to all asset url references
	get baseurl
		#baseurl ||= ((program.baseurl or program.base or '/base') + '/').replace(/\/+/g,'/')

	get fs
		program.fs

	get imbaconfig
		program.config # or parent..imbaconfig
		
	get theme
		imbaconfig.#theme ||= new StyleTheme(imbaconfig)

	get root
		parent ? parent.root : self

	get buildcache
		root.#buildcache

	# this allows us to uniquely use this as a unique key in any object
	# useful for things like metadata[bundle] = {...}
	def [Symbol.toPrimitive] hint
		#_id_ ||= Symbol!
		
	def pathForAsset src, asset, tpl = assetNames, shouldHash = hashing?
		# "[kind]/[dir]/[name]-[hash]"
		let o = {}
		o.ext = np.extname(src)
		o.kind = o.ext.slice(1)
		if o.ext == '.map'
			o.ext = '.js.map'
			o.kind = 'js'
			
		o.name = np.basename(src,o.ext)
		o.dir = np.dirname(src)
		
		o.hash = asset..hash or null
		
		if o.ext.match(FontRegex)
			o.kind = 'fonts'
		elif o.ext.match(ImageRegex)
			o.kind = 'img'
		elif o.ext == '.html'
			o.kind = ''
			tpl = htmlNames
			
		unless tpl.indexOf('[name]') >= 0
			# add warning
			tpl += '/[name]'
			
		if tpl.indexOf('[hash]') == -1 and shouldHash
			tpl = tpl.replace('[name]','[name]-[hash]')
			
		if tpl.indexOf('[hash]') == -1 and tpl.indexOf('[dir]') == -1
			# TODO warn about non-unique paths
			no

		let dest = tpl.replace(/\[(\w+)\]/g) do(m,k)
			typeof o[k] == 'string' ? o[k] : m
		
		dest = normalizePath(dest).replace(/^\//,'') + o.ext
		
		if o.hash
			dest = dest.replace("{o.hash}-{o.hash}",o.hash)
			# dest = dest.replace("{o.hash}-{o.hash}",o.hash)
		return dest


	def constructor up,o
		super()
		#bundles = {web: {}, node: {}}
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
		firstBuild = null
		workers = null
		built = no
		meta = {}
		cwd = fs.cwd
		platform = o.platform or 'browser'
		entryPoints = o.entryPoints or []
		children = new Set
		builder = null

		if parent
			watcher = parent.watcher
		elif program.watch
			watcher ||= new Watcher(fs)

		let externals = []
		let pkg = program.package or {}

		for ext in o.external
			continue if ext[0] == '!'

			if ext == "dependencies"
				let deps = Object.keys(pkg.dependencies or {})
				externals.push(...deps)
			
			if ext == "devDependencies"
				externals.push( ...Object.keys(pkg.devDependencies or {}) )
			
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
			platform: nodeish? ? 'node' : 'browser' # o.platform == 'node' ? 'node' : 'browser'
			format: o.format or 'esm'
			outfile: o.outfile
			# outbase: fs.cwd
			outdir: fs.cwd
			globalName: o.globalName
			publicPath: baseurl or '/'
			assetNames: "{assetsDir}/[name].[hash]"
			chunkNames: "{assetsDir}/[name].[hash]"
			entryNames: o.entryNames or "{assetsDir}/[name].[hash]"
			banner: {
				js: "//__HEAD__" + (o.banner ? '\n' + o.banner : '')
			}
			footer: {js: o.footer or "//__FOOT__"}
			splitting: o.splitting
			sourcemap: (program.sourcemap === false ? no : (web? ? yes : 'inline'))
			stdin: o.stdin
			minify: o.minify ?? program.minify
			incremental: !!watcher
			legalComments: 'inline'
			# charset: 'utf8'
			loader: Object.assign({},LOADER_EXTENSIONS,o.loader or {})
			write: false
			metafile: true
			external: externals
			tsconfig: o.tsconfig
			nodePaths: (o.nodePaths or []).slice(0) # (np.resolve(program.imbaPath,'polyfills'))
			plugins: (o.plugins or []).concat({name: 'imba', setup: plugin.bind(self)})
			pure: o.pure
			treeShaking: o.treeShaking
			resolveExtensions: ['.imba','.imba1','.ts','.mjs','.cjs','.js','.svg']
		}

		# esoptions.outdir = o.outdir

		esoptions.entryPoints..sort!

		if main? and !web?
			esoptions.entryNames = "[dir]/[name]"
			esoptions.banner.js += "\nglobalThis.IMBA_OUTDIR=__dirname;globalThis.IMBA_PUBDIR='{pubdir}';"
			esoptions.publicPath = baseurl or '/'

		if web? and o.ref
			esoptions.entryNames = "{assetsDir}/{o.ref}/[dir]/[name].[hash]"

		if o.esbuild
			extendObject(esoptions,o.esbuild,'esbuild')			

		imbaoptions = {
			platform: o.platform
			css: 'external'
			hmr: program.hmr or false
			mode: program.mode
		}

		if o.sourcesContent !== undefined
			esoptions.sourcesContent = o.sourcesContent

		if o.platform == 'worker'
			# quick hack
			imbaoptions.platform = 'node'
			
		if o.target
			esoptions.target = o.target

		# FIXME Are we using this still?
		if o.format == 'css'
			esoptions.format = 'esm'
			# esoptions.outExtension[".js"] = ".SKIP.js"

		if o.format == 'html'
			esoptions.format = 'esm'
			esoptions.minify = false
			esoptions.sourcemap = false
			esoptions.entryNames = '[dir]/[name]'
			esoptions.loader[".json"] = 'file'
			# throw "Hello"

		let addExtensions = {
			webworker: ['.webworker.imba','.worker.imba']
			serviceworker: ['.serviceworker.imba','.webworker.imba','.worker.imba']
			nodeworker: ['.nodeworker.imba','.worker.imba','.node.imba']
			worker: ['.imba.web-pkg.js','.worker.imba']
			node: ['.node.imba']
			browser: ['.web.imba']
		}

		if addExtensions[o.platform]
			esoptions.resolveExtensions.unshift(...addExtensions[o.platform])

		let defines = esoptions.define ||= {}
		defines["globalThis.DEBUG_IMBA"] ||= !esoptions.minify

		if !nodeish?
			let env = o.env or process.env.NODE_ENV or (esoptions.minify ? 'production' : 'development')
			defines["global"]="globalThis"
			defines["process.platform"]="'web'"
			defines["process.browser"]="true"

			# FIXME Buffer is no longer tree-shaken if not used
			esoptions.inject = [
				np.resolve(program.imbaPath,'polyfills','buffer','index.js')
				np.resolve(program.imbaPath,'polyfills','__inject__.js')
			]
			esoptions.inject = []
			# defines["process.env.NODE_ENV"] ||= "'{env}'"
			# defines["process.env"] ||= JSON.stringify(NODE_ENV: env)
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
		entryPoints.sort!
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
		let ref = types.join('-')
		let key = Symbol.for(ref)
		
		let cacher = imbaconfig # resolveConfigPreset
		if cacher[key]
			return cacher[key]

		let base = {presets: [], ref: ref}
		let presets = imbaconfig.options
		

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
		
		return cacher[key] = base # Object.create(base)

	def resolveEntrypoint path
		let cfg = resolveConfigPreset(['iife'])
		yes

	###
	The main setup for our esbuild plugin. It installs a bunch of far-reaching onResolve and onLoad
	handlers to support nested entrypoints, style extraction from imba files and much more.
	###
	def plugin esb
		let externs = esoptions.external or []

		let imbaDir = program.imbaPath
		let isCSS = do(f) (/^styles:/).test(f) or (/\.css$/).test(f)
		let isImba = do(f) (/\.imba$/).test(f) and f.indexOf('styles:') != 0 # (/^styles:/).test(f) or 

		let pathMetadata = {}

		let toAssetJS = do(object)
			let json = JSON.stringify(object)
			return """
				import \{asset\} from 'imba/src/imba/assets.imba';
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
			console.log 'resolve as image?!',args
			
			if o.format == 'css'
				return {path: "_", namespace: 'imba-raw'}
			
			let path = args.path.split('?')[0]
			let ext = np.extname(path).slice(1)
			let res = await esb.resolve(path,{resolveDir: args.resolveDir})

			let out = {
				path: fs.relative(res.path) or res.path,
				namespace: 'img'
			}
			return out
		

		
		
		# Importing html files will create a nested bundle with the html as an entrypoint
		main? and false and esb.onResolve(filter: /\.html$/) do(args)
			# TODO - support html file as entrypoint?
			console.log "resolving html",args,web?,webish?,o.format,main?

			# or we are on the server
			# if args.kind == 'entry-point' and true
			# 	let res = await esb.resolve(args.path,{resolveDir: args.resolveDir, kind: 'dynamic-import', importer: ''})
			# 	console.log 'resolve html as entrypoint',res
			# 	return {path: args.path, namespace: 'file', pluginData: {kind: args.kind}}

			if isImba(args.importer) and args.namespace == 'file' and !args.suffix and main?
				# html files imported from clients should likely just resolve as plain files?
				# if webish?
				#	return

				let cfg = resolveConfigPreset(['html'])
				let res = await esb.resolve(args.path,{resolveDir: args.resolveDir})
				let path = fs.relative(res.path)

				return {path: path + '?html', namespace: 'entry', pluginData: {
					path: path
					config: cfg
				}}

			return

		main? and esb.onResolve(filter: /\.html$/, namespace: 'file') do(args)
			# TODO - support html file as entrypoint?

			console.log "resolving html",args,web?,webish?,o.format,main?
			if args.kind == 'entry-point'
				let res = await esb.resolve(args.path,{resolveDir: args.resolveDir})
				return {
					path: res.path
					namespace: 'file'
					pluginData: {
						path: args.path
						kind: args.kind
					}
				}
			if args.kind == 'import-statement' or args.kind == 'entry-point'
				let res = await esb.resolve(args.path,{resolveDir: args.resolveDir})
				console.log 'resolved html',res
				return {
					path: fs.relative(res.path)
					namespace: 'js'
					pluginData: {
						kind: args.kind
					}
				}
			return

			# or we are on the server
			# if args.kind == 'entry-point' and true
			# 	let res = await esb.resolve(args.path,{resolveDir: args.resolveDir, kind: 'dynamic-import', importer: ''})
			# 	console.log 'resolve html as entrypoint',res
			# 	return {path: args.path, namespace: 'file', pluginData: {kind: args.kind}}

			if isImba(args.importer) and args.namespace == 'file' and !args.suffix and main?
				# html files imported from clients should likely just resolve as plain files?
				# if webish?
				#	return

				let cfg = resolveConfigPreset(['html'])
				let res = await esb.resolve(args.path,{resolveDir: args.resolveDir})
				let path = fs.relative(res.path)

				return {path: path + '?html', namespace: 'entry', pluginData: {
					path: path
					config: cfg
				}}

			return
		

		esb.onResolve(filter: /\?(as=)?([\w\-\,\.]+)$/) do(args)

			# only resolve certain types
			
			# reference to _all_ styles referenced via main entrypoint
			if args.path == '*?css'
				root.hasGlobStylesheet = yes
				# FIXME no longer used?
				return {path: "__styles__", namespace: 'entry'}
			
			if o.format == 'css'
				return {path: "_", namespace: 'imba-raw'}

			let [path,q] = args.path.split('?')
			let formats = q.replace(/^(as=)?/,'').split(',')

			if q.match(/^(url|dataurl|binary|text|base64|file|copy)/)
				return

			
			let resolved = await esb.resolve(path,{resolveDir: args.resolveDir})
			console.log 'resolved path?!?',resolved

			# if the path could not be resolved to an actual file on disk, skip it
			unless resolved
				return

			let wrkidx = formats.indexOf('worker')
			if wrkidx >= 0
				formats[wrkidx] = nodeish? ? 'nodeworker' : 'webworker'
				# q = formats.join(',')

			let cfg = resolveConfigPreset(formats)
			
			# let res = await esb.resolve(path,{resolveDir: args.resolveDir})
			let rel = fs.relative(resolved.path)

			return {path: rel +  '?' + formats.join(','), namespace: 'entry', pluginData: {
				config: cfg
				path: rel
			}}
			return out

		# be default, treat all absolute paths as external
		esb.onResolve(filter: /^\//) do(args)
			if args.kind == 'entry-point'
				return {path: args.path.split('?')[0], resovleDir: args.resolveDir}


			return if args.path.indexOf('?') > 0
			return {path: args.path, external: yes}

		
		esb.onResolve(filter: /^imba(\/|$)/) do(args)
			# TODO Let the esbuild resolver take over here
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

		# imba files import their stylesheets by including a plain
		# import '_styles_' line - which resolves to he path
		# of the importer itself, with a styles namespace
		esb.onResolve(filter: /^_styles_$/) do({importer})
			let path = fs.relative(importer)
			return {path: path, namespace: 'styles'}

		# resolve any non-relative path to see if it should
		# be external. If importer is an imba file, try to
		# also resolve it via the imbaconfig.paths rules.
		esb.onResolve(filter: /^[\w\@\#]/, namespace: 'file') do(args)
			console.log 'on resolve still',args
			if args.path.indexOf('node:') == 0
				return {external: true}
			
			if externs.indexOf(args.path) >= 0
				return {external: true}

			# FIXME is this needed anymore?
			if args.importer.indexOf('.imba') > 0
				let res = await esb.resolve(args.path,{resolveDir: args.resolveDir})
				# could drop this until we have consistent paths support?
				return res
			return null

		# there are other rules
		esb.onResolve(filter: /\.json$/) do(args)
			
			if args.importer..match(/\.html$/)
				console.log 'resolve json',args
				let res = await esb.resolve(args.path,{resolveDir: args.resolveDir})
				return {path: res.path, suffix: "?url"}

			if args.pluginData..resolver
				console.log "re-resolve for html!?",args
				throw 123
			return



		###
		img namespace returns a js file for the image which includes image size
		and a url to the actual image
		###
		esb.onLoad(namespace: 'img', filter: /.*/) do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js, resolveDir: file.absdir}

		###
		html namespace returns a js file that extracts imports and file references
		from the html. After esbuild is done we parse the resulting file, pull out
		the asset references and changed it back into html, with the correct urls
		to assets etc.
		###
		esb.onLoad(namespace: 'html', filter: /.*/) do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js, resolveDir: file.absdir, pluginData: {resolver: path}}

		esb.onLoad(namespace: 'js', filter: /.*/) do({path})
			let file = fs.lookup(path)
			console.log 'compile html file',path
			let out = await file.compile({format: 'esm'},self)
			builder.meta[file.rel] = out
			console.log 'compile html file',path,out.js
			return {loader: 'js', contents: out.js, resolveDir: file.absdir, pluginData: {
				importerFile: file.rel
			}}

		esb.onLoad(namespace: 'file', filter: /\.html$/) do(args)	
			console.log "load html file",args,o.format

			# when this is in a html
			if o.format == 'html'
				let file = fs.lookup(args.path)
				let out = await file.compile({format: 'esm'},self)
				builder.meta[file.rel] = out
				console.log 'load the HTML!',out.js
				return {loader: 'js', contents: out.js, resolveDir: file.absdir}
			return

		###
		for all regular files we just intercept onLoad and check for specific
		suffixes like ?raw, ?copy, ?url, ?binary.
		###
		esb.onLoad(namespace: 'file', filter: /.*/) do({path,suffix})
			if suffix
				let fmt = suffix.slice(1)
				let loader = LOADER_SUFFIXES[fmt]
				if loader
					let out = nfs.readFileSync(path)
					return {loader: loader, contents: out}

		esb.onLoad(namespace: 'entry', filter:/.*/) do({path,pluginData})

			if path == '__styles__'
				if o.format == 'html'
					return {loader: 'text', contents: '*?css'}

				return {loader: 'js', contents: toAssetJS('*?css'), resolveDir: fs.cwd }

			# skip entrypoints if compiling for css only
			if o.format == 'css'
				return {loader: 'text', contents: ""}

			
			let meta = pluginData # pathMetadata[path]
			let cfg = meta.config

			let id = "entry:{meta.path}?{cfg.ref}"
			let file = fs.lookup(meta.path)

			# add this to something we want to resolve 
			if cfg.splitting or (cfg.ref == 'html' and main?)
				# use multiple entrypoints when the ref is html as well?
				# I guess we could always use it from the server
				# wont work if we also include html from inside client?
				let names = "{assetsDir}/{cfg.ref}/[dir]/[name]"
				let bundle = cfg.#bundler ||= new Bundle(root,Object.assign(Object.create(cfg),entryNames: names))
				bundle.addEntrypoint(meta.path)
				root.builder.refs[id] = bundle
				builder.refs[id] = bundle

				# return {loader: 'text', contents: "" id}
				if o.format == 'html'
					return {loader: 'text', contents: id}
				# "export default ASSET('{id}')"
				return {loader: 'js', contents: toAssetJS(id), resolveDir: np.dirname(path)}

			log.debug "lookup up bundle for id {id}"
			# adding it as a child of root is risky wrt correctly invalidating nested bundles
			let names = "{assetsDir}/{cfg.ref}/[dir]/[name]" # what about hash?
			let bundler = root.#bundles[id] ||= new Bundle(root,Object.assign({entryPoints: [meta.path], entryNames: names},cfg))

			builder.refs[id] = bundler

			unless cfg.format == 'css'
				# if we are in the web world we actually want to wait for the bundler
				let building = bundler.rebuild! # we can asynchronously start the rebundler

				if web?
					log.debug "rebuilt immediately - and maybe link directly to the asset?!"
					let res = await building
					try
						let file = try res.outputFiles[0]
						let rootref = root.builder.entries[id]
						log.debug 'returned from iife',rootref
						if file and rootref
							return {loader: 'text', contents: rootref.url}
						

			
			if o.format == 'html'
				return {loader: 'text', contents: id}

			console.log "load asset!!"
			return {loader: 'js', contents: toAssetJS(id), resolveDir: file.absdir }
			
		esb.onLoad(filter: /\.css$/) do(args)
			let content = nfs.readFileSync(args.path,'utf-8')
			content += "/*! @path {fs.relative(args.path)} */"
			return {loader: 'css', contents: content}


		esb.onLoad(filter: /.*/, namespace: 'imba-raw') do({path})
			return {loader: 'text', contents: ""}
	
		# asset loader
		# a shared catch-all loader for all urls ending up in the asset namespce
		# where the paths may have additional details about
		esb.onLoad(filter: /.*/, namespace: 'asset') do({path})
			throw "not supported?"
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js, resolveDir: file.absdir}
		

		esb.onLoad({ filter: /\.imba$/, namespace: 'styles'}) do({path,namespace})
			if let res = builder.styles[path]
				return res
			else
				{loader: 'css', contents: ""}

		# The main loader that compiles and returns imba files, and their stylesheets
		esb.onLoad({ filter: /\.imba1?$/}) do({path,namespace})
			let src = fs.lookup(path)
		
			let t = Date.now!
			let res = await src.compile(imbaoptions,self)

			if res.css
				let style = theme.transformColors(SourceMapper.strip(res.css or ""),prefix: no)
				style += "/*! @path styles:{fs.relative(path)} */"

				builder.styles[src.rel] = {
					loader: 'css'
					contents: style
					resolveDir: src.absdir
				}
			
			let incStyles = res.css or o.format == 'css'
			log.info "has css?!?",src.rel,incStyles

			let cached = res[self] ||= {
				loader: 'js',
				contents: SourceMapper.strip(res.js or "") + (incStyles ? "\nimport '_styles_';" : "")
				errors: (res.errors or []).map(do diagnosticToESB($1,file: src.abs, namespace: namespace))
				warnings: (res.warnings or []).map(do diagnosticToESB($1,file: src.abs, namespace: namespace))
				resolveDir: src.absdir
			}

			return cached

	def build force = no
		buildcache[self] ||= new Promise do(resolve)
			if (built =? true) or force
				workers = await startWorkers!

				log.debug "build {entryPoints.join(',')} {o.format}|{o.platform} {nr}"

				if o.stdin and o.stdin.template
					let tpl = fs.lookup( np.resolve(program.imbaPath,'src','templates',o.stdin.template) )
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
				log.debug "error when rebuilding",e
				result = e
			
			await transform(result,prev)
			
			if main?
				await write(result,prev)
			#buildcache = {}
			return resolve(result)
	
	# called for all outputs
	def finalizeAsset asset, shouldHash = hashing?
		return asset if asset.#finalized
		asset.#finalized = yes

		asset.hash ||= createHash(asset.#contents)
	
		let path = asset.originalPath = asset.path
		console.log 'finalize asset',asset.originalPath

		if asset.type == 'html'
			# console.log asset
			yes
			# throw "FINALIZE"

		let url = baseurl + path # hmm?
		
		if asset.type == 'css' and nodeish?
			asset.virtual ??= yes

		if asset.public or asset.type == 'css'
			asset.public = yes
			asset.url = url
			
			if pubdir != '.'
				asset.path = "{pubdir}/{asset.path}"
		else
			asset.path = "{srvdir}/{asset.path}"

		

		# now replace link to sourcemap as well
		if (asset.type == 'js' or asset.type == 'css') and asset.map
			let replace = /\/([\/\*])# sourceMappingURL=[\/\w\.\-\%]+\.map/
			asset.map.path = asset.path + '.map'
			asset.map.url = asset.url + '.map'
			asset.map.#finalized = yes

		# console.log 'finalized asset',asset.url,url,path # ,assetNames,asset.hash
		return asset
	
	def collectStyleInputs(input, deep, matched = [], visited = [])
		if input isa Array
			for member in input
				collectStyleInputs(member,deep,matched,visited)
			return matched
			
		if visited.indexOf(input) >= 0
			return matched

		visited.push(input)

		if input.path.match(/(^styles:)|(\.css$)/)  # or input.path.match(/^styles:/)
			if matched.indexOf(input) == -1
				unless matched.find(do $1.path == input.path)
					matched.push(input)
			
		for item in input.imports
			continue if item.path.match(/\?as=css$/)
			collectStyleInputs(item,deep,matched,visited)
			
		if input.asset and deep
			collectStyleInputs(input.asset.source,deep,matched,visited)

		return matched

	def transformCompiledHTML js,meta
		let mapping = {}
		let entryToUrlMap = {}
		let entries = root.builder.entries
		console.log 'transform html',js
		# need to wait until the paths are done, no??
		js.replace(/(\w+_default\d*) = \"(.*)\"/g) do(m,name,path)
			# console.log 'get entry?!?',path,entries[path]
			if let entry = entries[path]
				return mapping[name] = entry.url or entry.path # to url
			mapping[name] = entryToUrlMap[path] or path

		let urls = js.match(/URLS = \[(.*)\]/)[1].split(/\,\s*/g).map do
			mapping[$1]
		
		if meta and meta.html
			let replaced = meta.html.replace(/ASSET_REF_(\d+)/g) do(m,nr)
				let url = urls[parseInt(nr)]
				return url
			# 
			return replaced
		return js

		#	if hmr?
		#		body = injectStringBefore(body,"<script src='/__hmr__.js'></script>",['<!--$head$-->','<!--$body$-->','<html',''])

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

		# For debugging purposes, write out the original esbuild manifests, as is

		meta = result.meta = {
			ref: o.ref
			format: o.format
			platform: o.platform
			inputs: meta.inputs
			outputs: meta.outputs
			errors: [].concat(result.errors or [])
			warnings: [].concat(result.warnings or [])
			urls: {}
		}

		if true
			let tmpsrc = np.resolve(fs.cwd,'dist')
			meta.entryPoints = esoptions.entryPoints
			try nfs.mkdirSync(tmpsrc)
			nfs.writeFileSync(np.resolve(tmpsrc,"manifest.{nr}.json"),JSON.stringify(meta,null,4))
		
		let ins = meta.inputs
		let outs = meta.outputs
		let urls = meta.urls

		let reloutdir = fs.relative(esoptions.outdir)

		# expects a 1-to-1 mapping between inputs and outputs -- there is none?
		for file in files
			let path = fs.relative(file.path)

			console.log "check for file {path}"

			if outs[path]
				outs[path].#file = file
				outs[path].#contents = file.contents
				file.#output = outs[path]
			else
				console.log 'could not map the file to anything!!',file.path,path,reloutdir,Object.keys(outs),fs.cwd,esoptions.outdir

		# console.log 'done here',Object.keys(ins),Object.keys(outs)
		for own path,output of meta.outputs
			# skip if this is not a relevant asset, like for css?
			root.builder.outputs.add(output)
			
			# link the source-maps to their sibling outputs
			if outs[path + '.map']
				output.map = outs[path + '.map']

			# for the outputs that are entrypoints, set a shared reference
			if output.entryPoint
				let inpath = output.entryPoint
				let input = ins[inpath]
				
				if input
					output.source = input
					let kind = path.split('.').pop!
					if kind == 'js' or kind == 'css'
						input[kind] = output

					if o.ref
						let id = "entry:{output.entryPoint}?{o.ref}"
						root.builder.entries[id] = {file: path, url: baseurl + path, #output: output }
						# console.log 'mapped entry',id

		# Add connections between inputs and outputs
		for own path,input of ins
			input.#type = input._ = 'input'
			input.path = path
			input.imports = input.imports.map do ins[$1.path]
			watchPath(path)

		let urlOutputMap = {}
		let walker = {}
		let addOutputs = new Set
		let styleInputs = new Set

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
				
		# Everything after this point (hashing etc) should be possible to do
		# in a separate step after after we know that all the nested outputs
		# have been generated?

		for own path,output of meta.outputs
			output.#type = output._ = 'output'
			output.path = path

			let kind = (np.extname(path) or '').slice(1)

			console.log 'forin output',path
			if kind == 'json' and Object.keys(output.inputs or {}).some(do $1.match(/\?url/))
				output.public = yes

			# only when html is the entrypoint
			if output.source and output.source.path.match(/\.html$/) and output == output.source.js
				log.debug "FOUND OUTPUT HTML!?",path,output.source.path,output.entryPoint
				# throw "found html {path}"

				urlOutputMap[path] = output
				output.public = yes
				# output.type = 'html'
				output.path = path = path.replace(/\.js/,'.html')

				let inpath = output.entryPoint or ''
				let src = inpath.replace(/^\w+\:/,'')
				let meta = builder.meta[src]
				if meta and false
					console.log "found meta",src,!!meta,builder.meta,output,output.source
					let body = transformCompiledHTML(output.#file.text,meta)
					console.log "transformed", body
					output.#contents = output.#text = body

			elif webish? or output.type == 'css' or path.match(FontRegex) or path.match(ImageRegex)
				urlOutputMap[path] = output
				output.public = yes
				output.url = "{baseurl}{path}"

			output.type ??= (np.extname(path) or '').slice(1)
			console.log "output type",output.type,output.path

			let inputs = []
			let dependencies = new Set
			let origInputs = output.inputs
			for own src,m of output.inputs
				if src.indexOf('entry:') == 0
					dependencies.add(ins[src])

				inputs.push [ins[src],m.bytesInOutput]
			
			output.dependencies = Array.from(dependencies)

			output.inputs = inputs

			# due to bugs in esbuild we need to reorder the css chunks
			# the individual css files will likely be ordered correctly with
			# latest esbuild, but we still want to extract the chunks
			if output.type == 'css' and !output.#ordered
				let body = output.#file.text
				let parts = body.split(/\/\*\! @path (.+?) \*\//g)
				let found = {}

				while parts.length
					let body = parts.shift! or ''
					let path = parts.shift!
					found[path] = body
				
				# setting the csschunk extracted from output on each
				# individual input file
				for [input,bytes] in inputs
					styleInputs.add(input)
					input.#csschunk = found[input.path]

				output.#ordered = yes
			
			if output.imports
				output.imports = output.imports.map do
					outs[$1.path]

			# no longer needed / relevant?
			if let m = path.match(/\.([A-Z\d]{8})\.\w+$/)
				output.hash = m[1]
			elif m = path.match(/\-([A-Z\d]{8})\.(\w{2,4})$/)
				output.hash = m[1]
			elif m = path.match(/chunk[\.\-]([A-Z\d]{8})\.\w+\.(js|css)(\.map)?$/)
				output.hash = m[1]

			if output.url
				urlOutputMap[output.url] = output

		###
		Should probably use the original uint8 array rather than the text
		representation of body for performance reasons.
		###
		walker.replacePaths = do(body,output)
			let start = 0
			let end = 0
			let delim
			let breaks = {"'": 1, '"':1, '(':1, ')':1}
			let path

			while true
				start = body.indexOf(ASSETS_URL,end)
				break if start == -1
				delim = body[start - 1]
				end = start + 10
				delim = ')' if delim == '('
				
				let path = body.substr(start,300).match(/^[^\r\n\'\"\)]+/)[0]
				end = start + path.length

				path = body.slice(start,end)
				let origPath = path
				let cleanPath = path.replace(/\/\/\.\/\//g,'/').replace(/\/\//g,'/').replace(ASSETS_URL,'')
				let rePath = origPath.replace(ASSETS_URL,baseurl).replace(/\/\/\.\/\//g,'/').replace(/\/\//g,'/')
				let asset = urlOutputMap[path] or urlOutputMap[cleanPath] or urlOutputMap[rePath]
				
				# console.log "rename asset",cleanPath,pathForAsset(cleanPath),pathForAsset(cleanPath,null,'__assets__/[dir]/[name]-[hash]')
				# what if it is referencing itself?
				if asset and !origPath.match(/\.(js|css)\.map$/)
					await walker.resolveAsset(asset)
					path = asset.url
				else
					path = baseurl + cleanPath # .replace(ASSETS_URL,baseurl)	

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
			if output.type == 'css'
				return body

			if o.format == 'html' and false
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

					let meta = builder.meta[output.source.path]
					
					if meta and meta.html
						let replaced = meta.html.replace(/ASSET_REF_(\d+)/g) do(m,nr)
							let url = urls[parseInt(nr)]
							return url
						body = replaced

						if hmr?
							body = injectStringBefore(body,"<script src='/__hmr__.js'></script>",['<!--$head$-->','<!--$body$-->','<html',''])

			elif node?

				# only if we actually include the exports?
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
				# return asset

			if asset.type == 'js' or asset.type == 'html' or asset.type == 'css'
				log.debug "resolving assets in {asset.path}"
				asset.#text ||= asset.#file.text
				asset.#contents = await walker.replacePaths(asset.#text,asset)

			if asset.type == 'map'
				# console.log 'found map?!',asset,!!asset.source
				let js = asset.source..js
				if js
					await walker.resolveAsset(js)
					asset.hash = js.hash
					
			finalizeAsset(asset)
			return asset

		for item of styleInputs
			item.#csschunk = await walker.replacePaths(item.#csschunk,{type: 'css'})


		# Walk through all the outputs from esbuild metafile and skip outputting
		# certain items, while resolving the rest of the outputs and (sometimes)
		# rewrite the final paths
		let newouts = {}

		for own path,output of meta.outputs
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

	def copyPublicFiles
		if build?
			let from = fs.resolve('public')
			let to = #outfs.resolve(pubdir)
			console.log 'copy from',from,to
			if nfs.existsSync(from)
				new Promise do(resolve) ncp(from,to,{},resolve)

	# Called at the top bundle after all nested entrypoints++ has been transformed
	# The inputs and outputs in the result are now deeply linked to inner bundled
	# entrypoints etc
	def write result
		# after write we can wipe the buildcache
		#outfs ||= new FileSystem(program.outdir,program)
		
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
			mappings: {}
			hash: null
			srcdir: null
			outdir: null
			path: null
			main: null
			assets: null
			css: null
			pubdir: pubdir
		}
	
		let main = manifest.main = ins[o.stdin ? o.stdin.sourcefile : entryPoints[0]]..js
		let assets  = manifest.assets = Object.values(outs)
		

		if hasGlobStylesheet
			
			let entries = entryPoints.map do ins[$1]
			# console.log 'import css from',entries,entryPoints
			let cssinputs = collectStyleInputs(entries,true)

			###
			Starting at the server-side entrypoint, crawl through all the dependencies,
			into nested entrypoints, and collect all the styles imported anywhere, in order.
			Finally we will stitch together a shared css file containing all css chunks in
			the whole project.
			###

			# walk the entrypoint for css
			# let cssinputs = collectStyleInputs(main.source,true)
			let htmlassets = assets.filter do $1.type == 'html'
			
			if cssinputs.length
				let body = ""
				for item in cssinputs
					if item.#csschunk
						body += item.#csschunk + '\n'

				
				# now write this file as a separate asset?
				let hash = createHash(body)
				let asset = {
					#type: 'output'
					_: 'output'
					type: 'css'
					public: yes
					path: "{assetsDir or '.'}/all.{hash}.css"
					hash: hash
					virtual: no
					#contents: body
				}

				asset.asset = asset
				
				# should take hashing parameter from the web/css target instead?
				finalizeAsset(asset)
				builder.entries['*?css'] = {
					url: asset.url
				}
				manifest.css = asset
				ins.__styles__ = asset
				assets.push(asset)

				# FIXME html assets do not necacarrily need to be hashed
				for html in assets when html.type == 'html'
					html.#contents = replaceAll(html.#contents,"href='__styles__'","href='{asset.url}'")

		# rewrite assets in html files
		for asset in assets
			if asset.type == 'html'
				console.log 'handle html asset!',asset
				let inpath = asset.entryPoint or ''
				let src = inpath.replace(/^\w+\:/,'')
				let meta = builder.meta[src]
				if meta
					console.log "found meta",src,!!meta,builder.meta,asset,asset.source
					let body = transformCompiledHTML(asset.#file.text,meta)
					console.log "transformed", body
					# asset.#contents = 
					asset.#text = asset.#contents = body

			# if this is a main body now
			if asset.type == 'js' and !asset.public
				console.log "asset with js!!",asset.#text
				# inject the initial manifest here
				let body = asset.#text.replace('//__HEAD__',"globalThis._MF_={JSON.stringify(builder.entries)}")
				asset.#text = asset.#contents = body

		manifest.path = 'manifest.json'

		for item in assets
			if item.url
				manifest.urls[item.url] = item

			

		# a sorted list of all the output hashes is a fast way to
		# see if anything in the bundle has changed or not
		log.ts "ready to write"
		let mfile = #outfs.lookup(manifest.path)
		let mfile2 = #outfs.lookup(manifest.path + '.json')
		# these are relative to the manifest file - should rather be relative
		# to the manifest dir?!
		manifest.srcdir = relativePath(mfile.absdir,outbase) or "."
		manifest.outdir = relativePath(mfile.absdir,#outfs.cwd) or "."

		# console.log "outdir!!",manifest.outdir,manifest.srcdir,mfile.abs,manifest.path,main.path


		mfile2.writeSync(JSON.stringify(builder.entries,null,2))


		if true and false
			###
			Support for html files are hacked in by exposing them as .js files to esbuild.
			###

			# set output paths of html files - should not happen after resolving?
			let htmlFiles = assets.filter do $1.type == 'html' and $1.entryPoint
			let htmlPaths = htmlFiles.map do $1.path.split('/')

			while htmlPaths[0] and htmlPaths[0].length > 1
				let start = htmlPaths[0][0]
				let shared = htmlPaths.every do $1[0] == start
				break unless shared

				for item in htmlPaths
					item.shift!
			
			for item,i in htmlFiles
				item.path = htmlPaths[i].join('/')
			
				console.log "changed html paths",htmlPaths

				if pubdir != '.'
					item.path = "{pubdir}/{item.path}"

		for item in assets
			manifest.outputs[item.path] = item

		manifest.hash = createHash(assets.map(do $1.hash or $1.path).sort!.join('-'))
		
		log.debug("manifest hash: {manifest.hash}")

		# if clean and first run only?

		if program.clean
			let rm = new Set
			# let op = self.manifest.outputs || {}
			let old = self.manifest.outputs || {}
			for own path,item of old
				unless outs[item.path]
					rm.add(#outfs.lookup(item.path))

			for file of rm
				await file.unlink!
		
		
		
		# run through the asset inputs to generate a cleaner manifest with references
		
		if false
			let structure = {}
			
			for asset in assets when asset.type == 'js' and asset.source
				let source = asset.source
				let inp = structure[source.path] ||= {
					src: source.path
					file: asset.path
					url: asset.url
					imports: []
				}
				for dep in asset.dependencies
					if dep.asset
						inp.imports.push(dep.asset.path)
					else
						console.log "could not find asset dependenc?!?",dep.path,dep._
			
			manifest.mappings = structure

		# update the build
		if #hash =? manifest.hash
			
			log.info "building in %path",program.outdir
			
			# console.log 'ready to write',manifest.assets.map do $1.path
			for asset in assets
				let path = asset.path
				let file = #outfs.lookup(path)
				if build? and static? and !asset.public
					continue

				if asset.virtual
					continue

				await file.write(asset.#contents,asset.hash)
			
			let json = serializeData(manifest)

			unless build? and static?
				if mfile
					await mfile.writeSync json, manifest.hash
				
				if nodeish?
					let loaderData = nfs.readFileSync(np.resolve(program.imbaPath,'loader.imba.js'),'utf-8')
					let loader = #outfs.lookup(main.path.replace(/(\.js)?$/,'.loader.js'))
					await loader.write(loaderData)

			await copyPublicFiles!
			self.manifest.path = mfile.abs
			self.manifest.update(json)



		try log.debug main.path,main.hash
		log.debug "memory used: %bold",process.memoryUsage!.heapUsed / 1024 / 1024

		if program.#listening
			log.info "built %bold in %ms - %heap (%address)",entryPoints[0],builder.elapsed,program.#listening
		else
			log.info "finished %bold in %ms - %heap",entryPoints[0],builder.elapsed
		return result