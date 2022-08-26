import * as esbuild from 'esbuild'
import {startWorkers} from './pooler'
import {createHash,diagnosticToESB,builtInModules,extendObject,replaceAll, normalizePath, relativePath, ImageRegex, FontRegex} from './utils'

import {StyleTheme} from '../compiler/styler'

import os from 'os'
import np from 'path'
import nfs from 'fs'
import ncp from '../../vendor/ncp.js'
import URL from 'url'

import FileSystem from './fs'
import Component from './component'
import {SourceMapper} from '../compiler/sourcemapper'
import * as smc from 'sourcemap-codec'
import Watcher from './watcher'

let BUNDLE_COUNTER = 0

import {LOADER_SUFFIXES, LOADER_EXTENSIONS, SUFFIX_TEMPLATES, NODE_BUILTINS} from './config'

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

# TODO Check if outdir is inside of project-dir (closest package.json)
# - when it is we can safely keep things external
export default class Bundle < Component

	prop hasGlobStylesheet
	prop built? = no

	get o
		options

	get node? do platform == 'node'
	get nodeworker? do platform == 'nodeworker'
	get webworker? do platform == 'webworker'
	get worker? do webworker? or nodeworker?
	get nodeish? do node? or nodeworker?
	get web? do !nodeish?
	get webish? do web? or webworker?

	get esm? do !o.format or o.format == 'esm'
	get cjs? do o.format == 'cjs'
	get iife? do o.format == 'iife'
	get html? do o.format == 'html'
	

	get build?
		program.command == 'build'

	get watch?
		!!program.watch

	get serve?
		(program.command == 'serve') or (root.entryPoints[0].match(/\.html$/) and !build?)

	get run?
		!build?

	# Will bundle be run in fork mode (vs cluster)?
	get fork?
		!program.watch and program.instances == 1

	get standalone?
		!!program.bundle

	# are we building directly for web?
	get static?
		!!program.web or root.html?

	get minify?
		o.minify ?? program.minify

	get dev?
		program.mode == 'development'

	get production?
		!!minify?

	get hmr?
		program.hmr == yes or program.watch == yes

	get main?
		root == self

	get outdir
		program.outdir or fs.cwd

	get outbase
		o.outbase or fs.cwd

	get assetsDir
		o.assetsDir or program.assetsDir or 'assets'

	get pubdir
		build? and static? ? '.' : 'public'

	get distInsideRoot?
		#distInsideRoot ??= (/^(\.\/|\w)/).test(np.relative(fs.cwd,outdir))
		

	def urlForOutputPath path
		let url = np.relative(np.resolve(program.cwd,program.outdir),path)
		if baseurl
			url = baseurl + url
		return  url
	
	# optional prefix prepended to all asset url references
	get baseurl
		# TODO use base instead of baseurl
		#baseurl ||= ((program.baseurl or program.base or '') + '/').replace(/\/+/g,'/')

	get fs
		program.fs

	get outfs
		root.#outfs ||= new FileSystem(program.outdir,program)

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
		builder = null

		# log.prefix = ["%d ","bundler"]

		if parent
			watcher = parent.watcher
		elif program.watch
			watcher ||= new Watcher(fs)

		let externals = []
		let pkg = program.package or {}

		for ext in o.external
			# if ext[0] == '!'
			#	externals.push(ext)

			if ext == "dependencies"
				let deps = Object.keys(pkg.dependencies or {})
				externals.push(...deps)
				externals.push( ...Object.keys(pkg.devDependencies or {}) ) if run?

			if ext == "devDependencies"
				externals.push( ...Object.keys(pkg.devDependencies or {}) )
			
			if ext == "builtins"
				externals.push(...Object.keys(builtInModules))

			if ext == ".json"
				externals.push("*.json")

			externals.push(ext)
		
		externals = externals.filter do(src)
			!o.external or o.external.indexOf("!{src}") == -1

		self.externals = externals

		# console.log "bundle externals",externals
		esoptions = {
			entryPoints: entryPoints
			bundle: o.bundle === false ? false : true
			define: o.define
			platform: nodeish? ? 'node' : 'browser'
			format: o.format or 'esm'
			outfile: o.outfile
			outdir: program.outdir
			globalName: o.globalName
			publicPath: baseurl or '/'
			assetNames: "{assetsDir}/[name].[hash]"
			chunkNames: "{assetsDir}/chunks/[name].[hash]"
			entryNames: "{assetsDir}/[name].[hash]"
			conditions: ["imba"]
			banner: {js: "//__HEAD__" + (o.banner ? '\n' + o.banner : '')}
			footer: {js: o.footer or "//__FOOT__"}
			splitting: o.splitting
			sourcemap: (program.sourcemap === false ? no : (web? ? yes : yes))
			minifySyntax: true
			minifyWhitespace: minify? and o.format != 'html'
			minifyIdentifiers: minify? and o.format != 'html'
			incremental: !!watcher
			legalComments: 'inline'
			loader: Object.assign({},LOADER_EXTENSIONS,o.loader or {})
			write: false
			metafile: true
			external: externals
			tsconfig: o.tsconfig
			nodePaths: (o.nodePaths or []).slice(0) # (np.resolve(program.imbaPath,'polyfills'))
			plugins: (o.plugins or []).concat({name: 'imba', setup: plugin.bind(self)})
			pure: ['Symbol.for','Symbol']
			treeShaking: o.treeShaking or true
			keepNames: true
			supported: {
				"for-await": true
			}
			resolveExtensions: ['.imba','.imba1','.ts','.mjs','.cjs','.js','.svg']
		}

		esoptions.entryPoints..sort!

		# Don't include the sources content in production builds
		if esoptions.sourcemap and !dev?
			esoptions.sourcesContent = false
		
		if main? and !web?
			esoptions.entryNames = "[dir]/[name]"

		if dev?
			esoptions.charset = 'utf8'

		if main?
			# override the external resolution here
			esoptions.external = []

		if web? and o.ref and !worker?
			# esoptions.entryNames = "{assetsDir}/[dir]/[name].[hash]"
			esoptions.entryNames = "{assetsDir}/[name].[hash]"

		if o.ref and o.format != 'html' and o.ref != 'web'
			esoptions.outbase = fs.cwd

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

		if nodeish? and run? and o.target
			let curr = process.version.replace(/^v(?=\d)/,'node')
			esoptions.target = [curr]

		# FIXME Are we using this still?
		if o.format == 'css'
			esoptions.format = 'esm'

		if html?
			esoptions.format = 'esm'
			esoptions.minify = false
			esoptions.sourcemap = false
			esoptions.entryNames = '[dir]/[name]'
			esoptions.loader[".json"] = 'file'

		
		if worker?
			esoptions.outExtension = {".js": ".worker.js"}
		elif iife?
			esoptions.outExtension = {".js": ".iife.js"}
		elif esoptions.format == 'esm' and nodeish?
			esoptions.outExtension = {".js": ".mjs"}

		# console.log esoptions

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

		# TODO Clean up defines

		let defines = esoptions.define ||= {}
		defines["globalThis.DEBUG_IMBA"] ||= (!build? and !production?)

		if !nodeish?
			let env = o.env or process.env.NODE_ENV or (minify? ? 'production' : 'development')
			defines["global"]="globalThis"
			defines["process.platform"]="'web'"
			defines["process.browser"]="true"

			# FIXME Buffer is no longer tree-shaken if not used
			esoptions.inject = [
				np.resolve(program.imbaPath,'polyfills','buffer','index.js')
				np.resolve(program.imbaPath,'polyfills','__inject__.js')
			]
			esoptions.inject = []
			defines["ENV_DEBUG"] ||= "false"
			esoptions.nodePaths.push(np.resolve(program.imbaPath,'polyfills'))

		defines["globalThis.IMBA_HMR"] ||= String(hmr?)
		defines["globalThis.IMBA_DEV"] ||= String(hmr?)
		defines["globalThis.IMBA_RUN"] ||= String(run?)

		if o.bundle == false
			esoptions.bundle = false
			delete esoptions.external

		if o.splitting and esoptions.format != 'esm'
			log.error "code-splitting not allowed when format is not esm"

		if main?
			log.ts "created main bundle"
			manifest = {}

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
		let ref = types.join('&')
		let key = Symbol.for(ref)
		
		let cacher = imbaconfig
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

	def resolveTemplate name
		np.resolve(program.imbaPath,'src','templates',name)

	###
	The main setup for our esbuild plugin. It installs a bunch of far-reaching onResolve and onLoad
	handlers to support nested entrypoints, style extraction from imba files and much more.
	###
	def plugin esb
		let externs = self.externals or []
		let imbaDir = program.imbaPath
		let isImba = do(f) (/\.imba$/).test(f) and f.indexOf('styles:') != 0

		let toAssetJS = do(object)
			let json = JSON.stringify(object)
			return """
				import \{asset\} from 'imba/src/imba/assets.imba';
				export default asset({json})
				"""
		
		let esresolve = do(args)
			let res = await esb.resolve(args.path,resolveDir: args.resolveDir, namespace: '')
			return res

		if o.resolve
			let regex = new RegExp("^({Object.keys(o.resolve).join('|')})$")

			esb.onResolve(filter: regex) do(args)
				# console.log 'onresolving',args.path
				let res = o.resolve[args.path]
				res = res and res[platform] or res
				return res

		# TODO convert to a single resolve function? Or at least one per namespace
		# TODO Images imported from imba files should resolve as special assets
		# importing metadata about the images and more
		if main? and serve?
			esb.onResolve(namespace: 'file', filter: /.*/) do(args)
				
				if args.kind == 'entry-point'
					let kind = args.path.split('.').pop!
					# TODO Support serving a regular js script as well - could be handy
					let tpl = resolveTemplate("serve-{kind}.imba")
					let abs = await esb.resolve(args.path,resolveDir: args.resolveDir)

					return {path: tpl, namespace: 'file', pluginData: {
						__ENTRYPOINT__: abs.path
						resolveDir: args.resolveDir
					}}

				if args.path == '__ENTRYPOINT__'
					
					let abs = await esb.resolve(entryPoints[0],resolveDir: fs.cwd)
					return {
						path: args.pluginData..__ENTRYPOINT__ or abs.path # fs.abs(entryPoints[0])
						pluginData: {
							path: args.path
							asset: yes
							kind: args.kind
						}
					}
				return
		
		if main?
			esb.onResolve(filter: /\.html$/, namespace: 'file') do(args)
				# When we are targeting html files as entrypoint (building)
				# we compile it to js and then convert it back to html before
				# writing the final files
				if args.kind == 'entry-point'
					let res = await esresolve(args)

					return {
						path: res.path
						namespace: 'file'
						pluginData: {
							path: args.path
							kind: args.kind
							serve: !build?
						}
					}

				if args.kind == 'import-statement'
					let res = await esresolve(args)
					return {
						path: res.path
						pluginData: { asset: yes, path: args.path, kind: args.kind }
					}
				return

		# Special path referring to all styles referred from entrypoint
		esb.onResolve(filter: /^\*\?css$/) do(args)
			root.hasGlobStylesheet = yes
			return {path: "*?css", namespace: 'css'}

		# catch the potential entrypoints here
		esb.onResolve(filter: /\?(as=)?([\w\-\,\.\&]+)$/) do(args)
			# skip this when we are resolving via esb.resolve
			return if args.namespace == ''

			if o.format == 'css'
				return {path: "_", namespace: 'imba-raw'}

			let [path,q] = args.path.split('?')
			let formats = q.replace(/^as=/,'').split(/[&\-]/g)

			if q.match(/^(url|dataurl|binary|text|base64|file|copy|img|svg|styles)/)
				return

			let resolved
			# Could we do away with this entrypoint thing?
			if path == '__ENTRYPOINT__'
				resolved = {path: fs.resolve(entryPoints[0]), suffix: '?' + q}
			else
				resolved = await esresolve(args)


			if let tpl = SUFFIX_TEMPLATES[q]
				tpl = tpl[webish? ? 'web' : 'node']
				if tpl and !args.pluginData
					return {
						namespace: 'wrap',
						suffix: resolved.suffix
						path: resolved.path
						pluginData: tpl
					}

			# if the path could not be resolved to an actual file on disk, skip it
			unless resolved
				return

			# If you import something as script?worker it will choose between
			# nodeworker and webworker depending on the platform you are importing
			let cfg = resolveConfigPreset(formats)
			
			let rel = fs.relative(resolved.path)
			# Why not resolve as suffix?
			let outpath = rel + resolved.suffix
			
			return {
				path: outpath,
				namespace: 'entry',
				pluginData: { config: cfg, path: rel }
			}


		# be default, treat all absolute paths as external
		esb.onResolve(filter: /^sdfdsfs\//) do(args)
			# console.log "RESOLVE ABSOLUTE",args
			# if args.kind == 'entry-point'
			# 	return {path: args.path.split('?')[0], resolveDir: args.resolveDir}
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
			# let path = fs.relative(importer)
			return {path: importer, suffix: '?styles', namespace: 'file'}

		# Main resolver for imba plugin. Checks for a bunch of different
		# conditions and returns accordingly
		esb.onResolve(namespace: 'file', filter: /.*/) do(args)
			return null if args.pluginData == 'skip' or args.path.indexOf('data:') == 0
			let path = args.path
			let abs? = /^(\/|\w\:\/)/.test(path)
			let rel? = path[0] == '.'
			let pkg? = !abs? and !rel?
			let pkg = pkg? and path.match(/^(@[\w\.\-]+\/)?\w[\w\.\-]*/)[0] or null
			let external? = (externs.indexOf(path) >= 0) or (pkg? and externs.indexOf(pkg) >= 0)
		
			let q = (path.split('?')[1] or '')

			if q == 'style'
				return null

			# console.log 'on resolve still',args
			if path.indexOf('node:') == 0
				return {external: true}

			if NODE_BUILTINS.indexOf(path) >= 0 and !web?
				# let res = await esresolve(args)
				# console.log 'resolved node module',res
				# What if these actually resolved to something else?
				# console.log 'is node module!',path
				# not external if we are in browser?
				# what do we want to externalize by default?
				return {external: true, path: "node:{path}"}
			

			# should this be the default for all external modules?
			if pkg? and nodeish? and run? and !standalone?
				if externs.indexOf("!{path}") >= 0
					# console.log "don't externalize",path
					return null

				let reachable? = no
				
				let opts = {
					importer: args.importer
					resolveDir: args.resolveDir
					namespace: ''
					kind: esm? ? 'import-statement' : 'require-call'
					pluginData: 'skip'
				}
				let res = await esb.resolve(args.path,opts)
					
				if res.path
					let base = res.path.split('node_modules')[0]
					let inpath = np.relative(base,outdir)
					reachable? = yes if inpath.indexOf('../') != 0

				if external? and reachable?
					return {external: true}

				if external?
					return {external: true, path: res.path}
			
			if external?
				if program.bundle
					return null

				return {external: true}

			# if this is an absolute path let esbuild resolve
			if abs?
				return null

			if q == 'img'
				let resolved = await esresolve(args)
				return {path: resolved.path}

			let img? = /(\.(svg|png|jpe?g|gif|tiff|webp))$/.test(path)
			
			if isImba(args.importer) and img? and args.kind != 'url-token'
				let resolved = await esresolve(args)

				if resolved..path
					# need more tests for this
					return {path: resolved.path, suffix: '?js'}

			# FIXME Formalize this behaviour
			if path.match(/\.json(\?copy)?$/)
				let res = await esresolve(args)
				if args.importer..match(/\.html$/)
					return {path: res.path, suffix: "?url"}
				if web? and esoptions.splitting
					return {path: res.path + '.mjs', suffix: "?external"}

			return null

		###
		img namespace returns a js file for the image which includes image size
		and a url to the actual image
		###
		esb.onLoad(namespace: 'img', filter: /.*/) do({path})
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			return {loader: 'js', contents: out.js, resolveDir: file.absdir}

		esb.onLoad(namespace: 'wrap', filter: /.*/) do(args)
			let cfg = args.pluginData
			let tpl = nfs.readFileSync(resolveTemplate(cfg),'utf-8')
			let body = tpl.replace('__ENTRYPOINT__?',args.path + '?')
			body = body.replace('__ENTRYPOINT__',args.path + (args.suffix or ''))
			return {loader: 'js', contents: body, resolveDir: np.dirname(args.path)}

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

		# TODO Remove namespace
		esb.onLoad(namespace: 'js', filter: /.*/) do({path})
			# TODO drop the js namespace - use suffix instead?
			let file = fs.lookup(path)
			let out = await file.compile({format: 'esm'},self)
			builder.meta[file.rel] = out
			return {loader: 'js', contents: out.js, resolveDir: file.absdir, pluginData: {
				importerFile: file.rel
			}}

		esb.onLoad(namespace: 'file', filter: /\.html$/) do(args)	
			# console.log "load html file",args,o.format

			# when this is in a html
			if html? or args.pluginData..asset
				let file = fs.lookup(args.path)
				let out = await file.compile({format: 'esm'},self)
				builder.meta[file.rel] = out
				return {loader: 'js', contents: out.js, resolveDir: file.absdir, pluginData: {
					importerFile: file.rel
				}}
			return

		###
		for all regular files we just intercept onLoad and check for specific
		suffixes like ?raw, ?copy, ?url, ?binary.
		###
		esb.onLoad(namespace: 'file', filter: /.*/) do({path,suffix,pluginData})
			if suffix
				let fmt = suffix.slice(1)
				let loader = LOADER_SUFFIXES[fmt]

				if fmt == 'external'
					# TODO Document external
					if web? and path.match(/\.json\.m?js$/)
						let real = path.replace(/\.m?js$/,'')
						let out = nfs.readFileSync(real,'utf-8')
						# maybe transform?
						return {
							loader: 'copy',
							contents: "export default " + out,
							resolveDir: np.dirname(path)
						}

				if loader
					let out = nfs.readFileSync(path)
					return {loader: loader, contents: out}

				elif fmt == 'js'
					let file = fs.lookup(path)
					let out = await file.compile({format: 'esm'},self)
					return {loader: 'js', contents: out.js, resolveDir: file.absdir}
			return null

		esb.onLoad(namespace: 'css', filter: /^\*\?css/) do
			return {loader: 'text', contents: '*?css'} if html?
			return {loader: 'js', contents: toAssetJS('*?css'), resolveDir: fs.cwd }

		esb.onLoad(namespace: 'entry', filter:/.*/) do({path,pluginData})

			if path == '__styles__'
				if html?
					return {loader: 'text', contents: '*?css'}
				return {loader: 'js', contents: toAssetJS('*?css'), resolveDir: fs.cwd }

			# skip entrypoints if compiling for css only
			if o.format == 'css'
				return {loader: 'text', contents: ""}

			let meta = pluginData
			let cfg = meta.config

			let id = "entry:{meta.path}?{cfg.ref}"
			let file = fs.lookup(meta.path)

			# add this to something we want to resolve 
			if cfg.splitting or (cfg.ref == 'html' and main?)
				# use multiple entrypoints when the ref is html as well?
				# I guess we could always use it from the server
				# wont work if we also include html from inside client?
				let bundle = cfg.#bundler ||= new Bundle(root,Object.create(cfg))
				bundle.addEntrypoint(meta.path)
				root.builder.refs[id] = bundle
				builder.refs[id] = bundle

				# return {loader: 'text', contents: "" id}
				if html?
					return {loader: 'text', contents: id}

				return {loader: 'js', contents: toAssetJS(id), resolveDir: np.dirname(path)}

			log.debug "lookup up bundle for id {id}"
			let bundler = root.#bundles[id] ||= new Bundle(root,Object.assign({entryPoints: [meta.path]},cfg))

			builder.refs[id] = bundler

			unless cfg.format == 'css'
				# if we are in the web world we actually want to wait for the bundler
				let building = bundler.rebuild! # we can asynchronously start the rebundler

				if web?
					log.debug "rebuilt immediately - and maybe link directly to the asset?!"
					let res = await building
					try
						let asset = res.meta.entries[id]
						# or root.builder.entries[id]
						# let rootref = root.builder.entries[id]
						log.debug 'returned from iife',id
						if asset
							return {loader: 'text', contents: asset.url}
					catch e
						console.error e

			
			if html?
				return {loader: 'text', contents: id}

			return {loader: 'js', contents: toAssetJS(id), resolveDir: file.absdir }
			
		esb.onLoad(filter: /\.css$/) do(args)
			let content = nfs.readFileSync(args.path,'utf-8')
			content += "/*! @path {fs.relative(args.path)} */"
			return {loader: 'css', contents: content}


		esb.onLoad(namespace: 'imba-raw', filter: /.*/) do({path})
			return {loader: 'text', contents: ""}
	

		esb.onLoad({namespace: 'styles', filter: /\.imba$/}) do({path,namespace})
			if let res = builder.styles[path]
				return res
			else
				{loader: 'css', contents: ""}

		# The main loader that compiles and returns imba files, and their stylesheets
		esb.onLoad({ filter: /\.imba1?$/}) do({path,namespace,pluginData,suffix})
			let src = fs.lookup(path)

			if suffix == '?styles'
				let res = builder.styles[src.rel]
				# console.log "ONLOAD {path}",arguments[0],Object.keys(builder.styles)
				return res or {loader: 'css', contents: ""}

			let t = Date.now!
			let res = await src.compile(imbaoptions,self)

			if res.css
				let style = theme.transformColors(SourceMapper.strip(res.css or ""),prefix: no)
				style += "/*! @path {fs.relative(path)}?styles */"

				builder.styles[src.rel] = {
					loader: 'css'
					contents: style
					resolveDir: src.absdir
				}
			
			let incStyles = res.css or o.format == 'css'
			let inc = incStyles ? "\nimport './{src.name}?styles';" : ""
			inc = incStyles ? "\nimport '_styles_';" : ""

			let cached = res[self] ||= {
				loader: 'js',
				contents: SourceMapper.strip(res.js or "") + (inc)
				errors: (res.errors or []).map(do diagnosticToESB($1,file: src.abs, namespace: namespace))
				warnings: (res.warnings or []).map(do diagnosticToESB($1,file: src.abs, namespace: namespace))
				resolveDir: src.absdir,
				pluginData: pluginData
			}

			return cached

	def build force = no
		buildcache[self] ||= new Promise do(resolve)
			if (built =? true) or force

				if main?
					log.info "starting to build in %path",program.outdir
				
				workers = await startWorkers!

				log.debug "build {entryPoints.join(',')} {o.format}|{o.platform} {nr}"

				try
					builder = new Builder(previous: builder)
					result = await esbuild.build(esoptions)
					firstBuild = result
					lastResult = result
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
			if main?
				log.debug "starting rebuild!",!!watcher,force

			if watcher and !force
				let changes = watcher.sync(self)
				let dirty = no
				for [path,flags] in changes
					if #watchedPaths[path] or flags != 1
						dirty = yes

				# console.log 'rebuild?!',entryPoints,changes,dirty,#watchedPaths

				if main? and dirty
					log.debug "changes demanding a resolve?",changes

				unless dirty
					#buildcache = {}
					return resolve(result)

			let prev = lastResult
			let failed = no

			try
				builder = new Builder(previous: builder)
				let rebuilt = await firstBuild.rebuild!
				result = rebuilt
				lastResult = result
			catch e
				log.debug "error when rebuilding",e
				failed = yes
				result = e
			
			await transform(result,prev)
			
			if main?
				await write(result,prev)
			#buildcache = {}
			return resolve(result)

	def collectStyleInputs(input, deep, matched = [], visited = [])
		if input isa Array
			for member in input
				collectStyleInputs(member,deep,matched,visited)
			return matched
			
		if visited.indexOf(input) >= 0
			return matched

		visited.push(input)

		if input.path.match(/(^styles:)|(\.css$)|(\?styles?$)/)  # or input.path.match(/^styles:/)
			if matched.indexOf(input) == -1
				unless matched.find(do $1.path == input.path)
					matched.push(input)
			
		for item in input.imports
			continue if item.path.match(/\?css$/)
			collectStyleInputs(item,deep,matched,visited)
			
		if input.asset and deep
			collectStyleInputs(input.asset.source,deep,matched,visited)

		return matched

	def transformCompiledHTML asset,js,meta,manifest
		let mapping = {}
		let entryToUrlMap = {}
		let entries = manifest
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
			# include module-preload
			return replaced
		return js


	###
	Go through the generated files - create hashes for the file-contents and rewrite
	the paths and references for the bundle - ready to write to the file system.
	###
	def transform result, prev

		let t = Date.now!
		if result isa Error
			# log.info '',result
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
			entries: {}
			urls: {}
		}

		if process.env.DEBUG or false
			
			let tmpsrc = np.resolve(fs.cwd,'dist')
			meta.entryPoints = esoptions.entryPoints
			let json = {
				entryPoints: meta.entryPoints
				files: files.map do [$1.path,fs.relative($1.path)]
				outputs: Object.keys(meta.outputs)
				inputs: Object.keys(meta.inputs)
				full: meta
			}
			try nfs.mkdirSync(tmpsrc)
			nfs.writeFileSync(np.resolve(tmpsrc,"manifest.{nr}.json"),JSON.stringify(json,null,4))
		
		let ins = meta.inputs
		let outs = meta.outputs

		# let reloutdir = fs.relative(esoptions.outdir)

		# expects a 1-to-1 mapping between inputs and outputs -- there is none?
		for file in files
			let path = fs.relative(file.path)

			if outs[path]
				outs[path].fullpath = file.path
				outs[path].#file = file
				outs[path].#contents = file.contents
				outs[path]
				file.#output = outs[path]
			else
				console.log 'could not map the file to anything!!',file.path,path,Object.keys(outs),fs.cwd,esoptions.outdir

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
					if kind == 'mjs' or kind == 'js'
						input.output = input[kind] = output
						input.js ||= output

					if kind == 'css'
						input.css = output

					if o.ref
						let id = "entry:{output.entryPoint}?{o.ref}"
						output.entryId = id
						root.builder.entries[id] = builder.entries[id] = meta.entries[id] = output

				if main? and serve?
					output.main = yes

		# Add connections between inputs and outputs
		for own path,input of ins
			input.#type = input._ = 'input'
			input.path = path
			input.imports = input.imports.map do ins[$1.path]
			watchPath(path)

		let addOutputs = new Set
		let styleInputs = new Set

		for own path,dep of builder.refs
			let input = ins[path]
			let res = dep

			let rawpath = path.slice(path.indexOf(':') + 1).split('?')[0]

			if path and input and dep isa Bundle
				res = await dep.rebuild!

			let inp = res and res.meta and res.meta.inputs[rawpath]

			# find it via res.meta.entries instead?
			if dep isa Bundle
				Object.assign(#watchedPaths,dep.#watchedPaths)

			if inp
				input.asset = res.meta.format == 'css' ? inp.css : inp.js
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

			if kind == 'json' and Object.keys(output.inputs or {}).some(do $1.match(/\?url/))
				output.public = yes

			# only when html is the entrypoint
			if output.source and output.source.path.match(/\.html$/) and output == output.source.js and (!main? or build?)
				output.public = yes
				output.path = path = path.replace(/\.m?js/,'.html')

			elif webish? or output.type == 'css'
				output.public = yes

			if nodeish? and path.match(/\.css(\.map)?$/)
				output.virtual ??= yes

			if output.public
				output.url = urlForOutputPath(output.path)

			output.type ??= (np.extname(path) or '').slice(1)


			let inputs = []
			let dependencies = new Set
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
				# this step could easily be done at the very end?
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
			if let m = path.match(/\.([A-Z\d]{8})(\.\w+)?\.\w+(\.map)?$/)
				output.hash = m[1]

		# Walk through all the outputs from esbuild metafile and skip outputting
		# certain items, while resolving the rest of the outputs and (sometimes)
		# rewrite the final paths
		let newouts = {}

		for own path,output of meta.outputs
			newouts[output.path] = output

		for outs of addOutputs
			Object.assign(newouts,outs)

		# TODO Move the public path re-resolution happen here
	
		# now update the paths in output
		outs = meta.outputs = newouts
		return result

	def copyPublicFiles
		let from = fs.resolve('public')
		let to = outfs.resolve(pubdir)
		if nfs.existsSync(from)
			new Promise do(resolve) ncp(from,to,{},resolve)
	
	###
	Removes all files and folders inside the dist dir, without
	removing the dir itself. This is needed for cases where you
	have linked a folder to a branch with git worktree etc,
	which is useful for deploying to gh-pages
	###
	def cleanOutDir
		return self unless nfs.existsSync(program.outdir)
		let items = nfs.readdirSync(program.outdir)
		for item in items
			continue if item.match(/^\.git/)
			nfs.rmSync(np.resolve(program.outdir,item),{recursive: yes})
		self

	# Called at the top bundle after all nested entrypoints++ has been transformed
	# The inputs and outputs in the result are now deeply linked to inner bundled
	# entrypoints etc
	def write result
		# after write we can wipe the buildcache
		let relOutPath = np.relative(fs.cwd,outdir)
		let buildInside = (/^(\.\/|\w)/).test(relOutPath)
		let staticFilesPath = nfs.existsSync(fs.resolve('public')) and fs.resolve('public')
		
		let meta = result.meta
		let ins = meta.inputs
		let outs = meta.outputs
		let urls = meta.urls

		if meta.errors.length
			# emit errors - should be linked to the inputs from previous working manifest?
			log.error "failed with {meta.errors.length} errors"
			emit('errored',meta.errors)
			# if we are not watching we actually want to exit the process
			if !watch?
				process.exit(1)
			return

		# The new manifest - get rid of the old one
		let entryManifest = result.manifest = {}

		let manifest = {
			inputs: ins
			outputs: {}
			urls: urls
			mappings: {}
			hash: null
			path: null
			main: null
			assets: null
			pubdir: pubdir
		}
	
		let assets = manifest.assets = Object.values(outs)
		let main = null

		if serve?
			# main = Object.values(result.metafile.outputs)[0]
			main = assets.find do $1.main

		let mainEntry = try ins[entryPoints[0]].output
		main = mainEntry or main
		# result.manifest = entryManifest
		

		###
			Starting at the server-side entrypoint, crawl through all the dependencies,
			into nested entrypoints, and collect all the styles imported anywhere, in order.
			Finally we will stitch together a shared css file containing all css chunks in
			the whole project.
		###
		if hasGlobStylesheet
			let entries = entryPoints.map do ins[$1] or main..source
			# console.log 'import css from',entries,Object.keys(ins),Object.keys(outs),entryPoints,!!main,main
			let cssinputs = collectStyleInputs(entries,true)
			# TODO Reuse previous sheet if we know that nothing has changed
			if cssinputs.length
				let body = ""
				# generating a rudimentary sourcemap for the generated thing
				let smap = {
					version: 3
					sourceRoot: String(URL.pathToFileURL(fs.cwd))
					sources: []
					names: []
					raw: []
					mappings: ""
				}

				for item,i in cssinputs
					# console.log 'where is chunk from?',item
					let chunk = item.#csschunk
					
					if chunk
						let path = item.path.replace(/(^\w+\:)|(\?.+$)/g,'')
						
						unless smap.sources.indexOf(path) >= 0
							smap.sources.push(path)

						let seg = [0,smap.sources.indexOf(path),0,0]
						# smap.raw.push [ [0,smap.sources.indexOf(path),0,0] ]

						let lines = chunk.split('\n')
						for line in lines
							smap.raw.push([seg.slice(0)])
						body += chunk + '\n'
						# smap.raw.push([])

				let hash = createHash(body)
				let name = "index.{hash}.css"
				let path = np.resolve(fs.cwd,esoptions.outdir,assetsDir or '.',name)

				smap.file = name

				body += "\n/*# sourceMappingURL=./{name}.map */"

				let asset = {
					#type: 'output'
					_: 'output'
					type: 'css'
					public: yes
					path: path
					hash: hash
					fullpath: path
					virtual: no
					url: urlForOutputPath(path)
					entryId: '*?css'
					#contents: body
				}

				asset.asset = asset
				builder.entries['*?css'] = asset
				ins['*?css'] = asset
				assets.push(asset)

				if esoptions.sourcemap
					smap.mappings = smc.encode(smap.raw)
					delete smap.raw

					assets.push({
						path: asset.path + '.map'
						fullpath: asset.fullpath + '.map'
						hash: hash
						public: yes
						#contents: JSON.stringify(smap,null,2)
					})


		for asset in assets
			if asset.public and pubdir
				if asset.resolved =? yes
					let abs = np.resolve(fs.cwd,asset.path)
					let rel = np.relative(esoptions.outdir,abs)
					let newpath = np.resolve(esoptions.outdir,pubdir,rel)
					asset.fullpath = newpath
					asset.path = np.relative(fs.cwd,newpath)

		
		for asset in assets when asset.entryId
			entryManifest[asset.entryId] = {
				url: asset.url
				path: asset.fullpath
			}
		
		for asset in assets when asset.url and asset.imports
			continue if asset.type == 'map'
			let entry = entryManifest[asset.url] = {}
			let imports = asset.imports.map(do $1.url)

			if imports.length
				entry.imports = imports

		log.ts "resolved public paths"
		# rewrite assets in html files
		for asset in assets
			# console.log asset.path,asset.type,asset.fullpath
			# go through html files, convert them back to html and replace path references
			if asset.type == 'html'
				let inpath = asset.entryPoint or ''
				let src = inpath.replace(/^\w+\:/,'')
				if let meta = builder.meta[src]
					let body = transformCompiledHTML(asset,asset.#file.text,meta,entryManifest)
					asset.#text = asset.#contents = body

			if asset.type == 'js' or asset.type == 'mjs'
				let body = asset.#text or asset.#file.text
				let head = ""

				unless asset.hash
					asset.hash ||= createHash(body)
				
				if !asset.public
					# only if it is the main entrypoint?
					let parts = ["globalThis.IMBA_MANIFEST={JSON.stringify(entryManifest)}"]
					if staticFilesPath and program.tmpdir
						parts.push("globalThis.IMBA_STATICDIR='{staticFilesPath}'")
					head = parts.join(';')

				if asset.public and hmr?
					head = "(globalThis.IMBA_LOADED || (globalThis.IMBA_LOADED=\{\}))['{asset.url}']=true;"

				if head
					body = body.replace('//__HEAD__',head)

				# replace all sourcemapping urls to be relative
				let replace = /\/([\/\*])# sourceMappingURL=([\/\w\.\-\%]+\.map)/g
				let name = np.basename(asset.path)
				body = body.replace(replace) do(m,pre,path) "/{pre}# sourceMappingURL=./{name}.map"

				asset.#text = asset.#contents = body
		
		log.ts "injected head in assets"

		for asset in assets
			if asset.type == 'map' and asset.public and asset.#file
				let body = asset.#file.text
				let orig = asset.#file.path
				let sourceRoot = URL.pathToFileURL(np.dirname(orig))
				body =	'{"sourceRoot": "' + sourceRoot + '",' + body.slice(1)
				asset.#contents = body

		log.ts "rewrote sourcemaps"
		manifest.path = 'manifest.json'

		entryManifest.main = outfs.relative(main.fullpath)

		result.main = main.fullpath
		result.hash = main.hash

		# a sorted list of all the output hashes is a fast way to
		# see if anything in the bundle has changed or not
		log.ts "ready to write"
		let mfile = outfs.lookup('manifest.json')

		for item in assets
			manifest.outputs[item.path] = item

		let hash = createHash(assets.map(do $1.hash ).sort!.join('-'))

		# update the build
		if #hash =? hash
			# log.info "building in %path",program.outdir

			# we only clean the output directory on the first run, and if the
			# output dir exists inside of cwd - just as a safety mechanism
			if !built? and !program.keep and !program.tmpdir and buildInside
				cleanOutDir!
			
			# console.log 'ready to write',manifest.assets.map do $1.path
			for asset in assets
				let path = asset.path
				if build? and static? and !asset.public
					continue

				if asset.virtual
					continue

				let file = outfs.lookup(asset.fullpath)
				await file.write(asset.#contents,asset.hash)

			if staticFilesPath and !program.tmpdir
				await copyPublicFiles!

			# is this only really needed for hmr?
			await mfile.write(JSON.stringify(entryManifest,null,2),manifest.hash)

			if program.#listening
				log.info "built %bold in %ms - %heap (%address)",entryPoints[0],builder.elapsed,program.#listening
			else
				log.info "built %bold in %ms - %heap",entryPoints[0],builder.elapsed
			
			built? = yes
			emit('built',result)

		return result