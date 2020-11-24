import chokidar from 'chokidar'
import compiler from 'compiler'
# import esbuild from 'esbuild'
const esbuild = require 'esbuild'

let fs = require 'fs'

console.log 'hello there!',compiler.helpers,esbuild

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

class Bundle
	def constructor o
		options = o
		watcher = o.watch ? chokidar.watch([]) : null
		result = null
		built = no
		esoptions = {
			entryPoints: [o.infile]
			target: ['es2019']
			bundle: true
			format: o.format or 'iife'
			outfile: o.outfile
			minify: !!o.minify
			incremental: o.watch
			platform: o.platform
			plugins: [{name: 'imba', setup: setup.bind(self)}]
			resolveExtensions: ['.imba','.imba1','.ts','.mjs','.cjs','.js','.css','.json']
		}
		console.log 'esoptions',esoptions

	def setup build
		build.onLoad({ filter: /\.imba/ }) do(args)
			console.log 'onload!',args.path
			watcher.add(args.path) if watcher
			let raw = await fs.promises.readFile(args.path, 'utf8')
			let key = "{args.path}:{options.platform}"
			let t0 = Date.now()
			let body = compiler.compile(raw,{
				platform: options.platform || 'browser',
				format: 'esm',
				sourcePath: args.path,
				imbaPath: options.imbaPath or 'imba'
			})
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

export def build options
	if options isa Array
		options = compiler.helpers.parseArgs(options,schema)
	console.log 'build with config',options
	let bundle = new Bundle(options)
	bundle.build!
	# options.plugins = [{name: 'imba', setup: plugin.bind(entry)}];