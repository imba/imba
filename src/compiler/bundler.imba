import chokidar from 'chokidar'
import compiler from 'compiler'
import imba1 from 'compiler1'
# import esbuild from 'esbuild'
const esbuild = require 'esbuild'
const fs = require 'fs'
const path = require 'path'
const readdirp = require 'readdirp'
import {resolveConfigFile} from './imbaconfig'

console.log 'hello there!!',compiler.helpers,esbuild

const schema = {
	alias: {
		o: 'outfile',
		h: 'help',
		s: 'stdio',
		p: 'print',
		m: 'sourceMap',
		t: 'tokenize',
		v: 'version',
		w: 'watch',
		d: 'debug'
	},
	
	schema: {
		infile: {type: 'string'},
		outfile: {type: 'string'},
		platform: {type: 'string'}, # node | browser | worker
		styles: {type: 'string'}, # extern | inline
		imbaPath: {type: 'string'}, # global | inline | import
		format: {type: 'string'}, # cjs | esm
	},
	
	group: ['source-map']
}

def resolvePaths obj,cwd
	if obj isa Array
		for item,i in obj
			obj[i] = resolvePaths(item,cwd)
	elif typeof obj == 'string'
		return obj.replace(/^\.\//,cwd + '/')
	elif typeof obj == 'object'
		for own k,v of obj
			let alt = k.replace(/^\.\//,cwd + '/')
			obj[alt] = resolvePaths(v,cwd)
			if alt != k
				delete obj[k]
	return obj

def expandPath src
	unless src.indexOf("*") >= 0
		return Promise.resolve([src])

	let options = {
		depth: 1
		fileFilter: '*.imba',
	}

	src = src.replace(/(\/\*\*)?(\/\*\.(\w+))?$/) do(m,deep,last,ext)
		if last
			options.fileFilter = last.slice(1)
		if deep
			options.depth = 5
		return ""
	# console.log "readdirp",src,options
	let files = await readdirp.promise(src,options)
	# console.log 'files from promise',files
	return files.map do $1.fullPath


class Bundle
	def constructor o, config
		config = config
		options = o
		watcher = o.watch ? chokidar.watch([]) : null
		result = null
		built = no
		esoptions = {
			entryPoints: o.entryPoints or [o.infile]
			target: o.target or ['es2019']
			bundle: true
			format: o.format or 'iife'
			outfile: o.outfile
			outdir: o.outdir
			minify: !!o.minify
			incremental: o.watch
			platform: o.platform
			external: o.external or undefined
			plugins: [{name: 'imba', setup: setup.bind(self)}]
			// outExtension: { '.js': '.imba' }
			resolveExtensions: ['.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json']
		}
		console.log 'esoptions',esoptions

	def setup build
		let ext = options.external
		# in certain modes we dont want to include 
		if ext and ext.indexOf("packages") >= 0
			console.log 'setting up with resolve exclusion'
			build.onResolve({ filter: /^[^\.]/ }) do(args)
				if (/^imba(\/|$)/).test(args.path) and ext.indexOf(args.path) == -1
					# imba should still be included
					console.log 'find imba?'
					return undefined
				# console.log 'check external',args.path
				if ext.indexOf("!{args.path}") == -1
					return {external: true}
				return undefined

				if any or externs.indexOf(args.path) >= 0
					console.log 'mark as external',args.path
					return {external: true}	
				return undefined

		build.onLoad({ filter: /\.imba1?/ }) do(args)
			console.log 'onload!',args.path

			watcher.add(args.path) if watcher
			let raw = await fs.promises.readFile(args.path, 'utf8')
			let key = "{args.path}:{options.platform}"
			let t0 = Date.now()
			let iopts = {
				platform: options.platform || 'browser',
				format: 'esm',
				sourcePath: args.path,
				imbaPath: options.imbaPath or 'imba'
				config: config
			}
			let body = null
			# legacy handling
			if args.path.match(/\.imba1/)
				iopts.target = iopts.sourcePath
				body = imba1.compile(raw,iopts)
			else
				body = compiler.compile(raw,iopts)

			return {
				contents: body.js
			}

	def build
		if built =? true
			console.log 'starting to build'
			result = await esbuild.build(esoptions)
			if watcher
				watcher.on('change') do
					console.log('rebuilding',options.infile)
					let rebuilt = await result.rebuild!
					console.log('rebuilt',options.infile)

		console.log 'did build!'
		return self

export def run options = {}
	let config = {}
	let bundles = []
	if options.cwd
		config = resolveConfigFile(options.cwd,path: path, fs: fs)
		# config = resolvePaths(config,config.cwd)
		# console.log "found config!!",config.entries
		for own entry,options of config.entries
			continue if options.skip
			let paths = await expandPath(entry)
			
			# possibly to multiple entry points there?
			options.entryPoints = paths
			console.log 'paths for this',options
			let bundle = new Bundle(options,config)
			bundles.push(bundle)
			bundle.build!
			# will eventually need to watch this dir as well, no?

	yes

export def build options
	if options isa Array
		options = compiler.helpers.parseArgs(options,schema)
	console.log 'build with config',options
	let bundle = new Bundle(options)
	bundle.build!
	# options.plugins = [{name: 'imba', setup: plugin.bind(entry)}];