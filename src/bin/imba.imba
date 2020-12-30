import {program as cli} from 'commander'
import Program from '../bundler/program'
import Server from '../bundler/serve'
import Bundler from '../bundler/bundle2'
import np from 'path'
import nfs from 'fs'
import {resolveConfig,resolvePackage} from '../bundler/utils'

import { findSourceMap, SourceMap, Module } from 'module'

const t0 = Date.now!

const fmt = {
	int: do(val) parseInt(val)
	i: do(val) val == 'max' ? 0 : parseInt(val)
}

def addDefaults options
	let cwd = options.cwd ||= process.cwd!
	options.imbaPath ||= np.resolve(__dirname,'..','..')
	options.mtime = nfs.statSync(__filename).mtimeMs
	# TODO also check mtime of the compiler
	options.config = resolveConfig(cwd,options.config or 'imbaconfig.json')
	options.package = resolvePackage(cwd)
	return options

def serve main, o
	o = addDefaults(o)
	o.main = main if main

	let prog = new Program(o.config,o)
	await prog.setup!

	# if we are watching - also compile and continue building
	if o.watch
		await prog.build!

	let server = new Server(prog)

	let scripts = []
	if main
		scripts.push({
			exec: main
			instances: o.instances
		})
	elif o.config.serve
		scripts.push(Object.assign({},o.config.serve,{
			instances: o.instances
		}))
	
	server.start(scripts)

def build o
	o = addDefaults(o)
	
	let prog = new Program(o.config,o)
	await prog.build!

def run entry, o

	o = addDefaults(o)
	let t = Date.now!
	# console.log 'running!',main,o.config.node

	let prog = new Program(o.config,o)
	let file = prog.fs.lookup(entry)
	
	await prog.setup!
	console.log 'program setup',Date.now! - t0

	let params = Object.assign({},o.config.node,{
		entryPoints: [entry]
		exports: null
		include: null
		minify: o.minify
		platform: 'node'
		outdir: 'dist/node'
		outbase: o.cwd
		sourcemap: true
		watch: o.watch
	})

	# add some environment stuff etc
	# maybe include the current commit or something?
	let hash = prog.cache.normalizeKey("{o.minify}-{o.sourcemap}").slice(0,4)
	let id = params.id = prog.cache.getPathAlias(entry) + "1{hash}"
	console.log "id for entry",id

	let bundle = new Bundler(prog,params)

	let out = await bundle.build!

	return

	# Error.prepareStackTrace = do(e)
	#	console.log "PREPARE STACK TRACE!"
	# console.log 'result from bundle build',out.outputFiles
	
	for entry in out.outputFiles
		# console.log entry.text
		let file = prog.fs.lookup(entry.path)
		await file.write(entry.contents)
		# nfs.writeFileSync(entry.path,entry.contents,'utf8')
	let first = out.outputFiles.find do $1.path.match(/\.js$/)

	let main = require.main
	# main.moduleCache && (main.moduleCache = {})
	let body = first.text

	# console.log 'find sourcemap?',Module._cache,main
	# return
	if true
		Module._load(first.path, main, true)
		return


	if false
		main.filename = process.argv[1] = file.abs # first.path # (filename ? nfs.realpathSync(filename) : '.')
		main.paths = Module._nodeModulePaths(file.absdir)
	else
		main.id = first.path
		main.filename = process.argv[1] = first.path # first.path # (filename ? nfs.realpathSync(filename) : '.')
		main.path = np.dirname(main.filename)
		main.paths = Module._nodeModulePaths(main.path)
		main.loaded = false
		main.children = []
		Module._load(main.id, main, true)

	# console.log "going to run!",first.text.length,reqmain.filename
	console.log 'ready in',Date.now! - t,body.length
	main._compile(body,np.basename(main.filename))

let binary = cli.version('2.0.0').name('imba')

cli.command('run <script>', { isDefault: true })
	.description('Run stuff')
	.option("-b, --build", "")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.action(run)

cli.command('serve [script]')
	.description('clone a repository into a newly created directory',{
		script: "something here"
	})
	.option("-b, --build", "")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-c, --clean", "Remove previously generated files")
	.option("-f, --force", "Disregard previosly cached compilations")
	.option("-i, --instances <count>", "Number of instances to start",fmt.i,1)
	.action(serve)

cli.command('build')
	.description('clone a repository into a newly created directory')
	.option("-c, --clean", "Remove previously generated files")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-f, --force", "Disregard previosly cached compilations")
	.option("-m, --minify", "Minify generated files")
	.action(build)

binary.parse(process.argv)
