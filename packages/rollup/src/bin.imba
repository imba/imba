import {parseArgs,printErrorInDocument} from './helpers'
var fs = require 'fs'
var path = require 'path'
var args = process.argv.slice(0)
var env = Object.assign({}, process.env)
var cwd = process.cwd()

var schema = {
	alias: {
		h: 'help',
		s: 'serve',
		p: 'print',
		v: 'version',
		w: 'watch',
		d: 'debug'
	},
	
	schema: {
		config: {type: 'string'},
		output: {type: 'string'},
		target: {type: 'string'},
		format: {type: 'string'},
	},
	group: ['source-map']
}
var options = parseArgs(process.argv.slice(0),schema)
var cfgPath = path.resolve(cwd,options.config || 'imbaconfig.json')
var dir = path.dirname(cfgPath)
var cfg = fs.existsSync(cfgPath) ? require(cfgPath) : {}

def relPath dir
	path.relative(cwd,dir)

def absPath dir
	path.resolve(cwd,dir)

def resolvePaths obj
	if obj isa Array
		for item,i in obj
			obj[i] = resolvePaths(item)
	elif typeof obj == 'string'
		return obj.replace(/^\.\//,dir + '/')
	elif typeof obj == 'object'
		for own k,v of obj
			obj[k] = resolvePaths(v)
	return obj

import resolve from 'resolve'
import rollup from 'rollup'
import resolve-plugin from '@rollup/plugin-node-resolve'
import commonjs-plugin from '@rollup/plugin-commonjs'
import alias-plugin from '@rollup/plugin-alias'
import json-plugin from '@rollup/plugin-json'
import replace-plugin from '@rollup/plugin-replace'
import serve-plugin from 'rollup-plugin-serve'
import hmr-plugin from 'rollup-plugin-livereload'

def resolveImba basedir
	try
		let src = path.dirname(resolve.sync('imba',{ basedir: basedir }) || '')
		if src
			let pkg = require(path.resolve(src,'package.json'))

			return {
				path: src
				version: pkg.version
			}
	catch e
		

var cwdlib = resolveImba(cwd)
var pkglib = resolveImba(__dirname)
# potentially look for global imba?

var lib = cwdlib or pkglib

if cwdlib && pkglib && cwdlib.version != pkglib.version
	console.log 'conflicting versions of imba',cwdlib,pkglib
	
unless lib
	console.log 'imba not found - install in project: npm install imba@pre'
	process.exit(0)

var bundles = []
var watch = options.watch
var serve = options.serve
var serving = no

var imbac = require(path.resolve(lib.path,'dist','compiler.js'))

def imbaPlugin options
	options = Object.assign({
		sourceMap: {},
		bare: true,
		extensions: ['.imba', '.imba2'],
		ENV_ROLLUP: true
		# ,imbaPath: lib.path
	}, options || {})

	var extensions = options.extensions
	delete options.extensions
	delete options.include
	delete options.exclude

	return {
		transform: do |code, id|
			var opts = Object.assign({},options,{sourcePath: id, filename: id})
			var output
			return null if extensions.indexOf(path.extname(id)) === -1

			try
				output = imbac.compile(code, opts)
			catch e
				if options.target == 'web' and serve
					let msg = e.excerpt(colors: no)
					let fn = printErrorInDocument.toString()
					fn = fn.replace("ERROR_FILE",id)
					fn = fn.replace("ERROR_SNIPPET",msg)
					return {code: '(' + fn + ')()', map: {}}
				else
					throw e

			return { code: output.js, map: output.sourcemap }
	}

class Bundle
	def constructor config
		self.config = config
		self.promise = new Promise do |resolve,reject|
			self.resolver = resolve
			self.rejector = reject
		self

	def start
		self.watcher = rollup.watch(self.config)
		self.watcher.on('event') do |e| self.onevent(e)
		return self.promise

	def onevent e
		if e.code == 'BUNDLE_START'
			console.log "bundles {relPath(e.input)} → {relPath(e.output[0])}"
		elif e.code == 'BUNDLE_END'
			console.log "created {relPath(e.input)} → {relPath(e.output[0])} in {e.duration}ms"
		elif e.code == 'ERROR'
			let file = e.error && e.error.filename or e.error.id
			console.log "errored {file ? relPath(file) : ''}"
			if e.error.excerpt
				console.log e.error.excerpt(colors: yes)
			else
				console.log e.error.message

			self.rejector(e)
		elif e.code == 'END'
			# console.log "created {relPath(e.input)} → {relPath(e.output[0])}"
			self.resolver(e)

unless cfg.entries isa Array
	let entries = []
	for own inpath,out of cfg.entries
		if out isa Array
			for part in out
				entries.push({input: inpath, output: part})
		else
			entries.push({input: inpath, output: out})
	
	cfg.entries = entries


for entry in cfg.entries
	entry = resolvePaths(entry)
	
	let alias = Object.assign({
		# imba: 
	},cfg.alias or {},entry.alias or {})

	let target = entry.target or 'web'
	let plugins = (entry.plugins ||= [])
	let resolver = resolve-plugin(extensions: ['.imba', '.mjs','.js','.cjs','.json'])
	plugins.unshift(commonjs-plugin())
	plugins.unshift(json-plugin())
	plugins.unshift(resolver)
	plugins.unshift(replace-plugin({'process.env.NODE_ENV': '"' + (process.env.NODE_ENV or 'production') + '"' }))
	
	if Object.keys(alias).length
		let parts = for own k,v of alias
			let replace = v.match(/^\.\.?\//) ? path.resolve(cwd, v) : v
			{ "find": k, "replacement": replace }
			
		let o = {
			entries: parts
			customResolver: resolver
		}
		plugins.unshift(alias-plugin(o))
	
	let iopts = Object.assign({target: target},entry.options or {})
	plugins.unshift(imba-plugin(iopts))

	if options.serve and target == 'web' and !serving
		serving = true
		let pubdir = path.dirname(entry.output.file)
		let serve-config = Object.assign({
			contentBase: pubdir,
			historyApiFallback: true
		},cfg.serve or {})
		let base = serve-config.contentBase
		let port = serve-config.port
		plugins.push(serve-plugin(serve-config))
		if options.hmr
			let hmr-config = {
				watch: base
				port: port ? (port + 1) : 35729
			}
			plugins.push(hmr-plugin(hmr-config))

	bundles.push(new Bundle(entry))

def run
	var bundlers = await Promise.all(bundles.map(do $1.start() ))

	unless watch
		process.exit(0)

run()