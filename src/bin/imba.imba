import {program as cli} from 'commander'
import Program from '../bundler/program'
import Server from '../bundler/serve'
import Runner from '../bundler/runner'
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
		sourcemap: true
		watch: o.watch
		contenthash: false
		isMain: yes
	})

	# add some environment stuff etc
	# maybe include the current commit or something? That could make sense
	let hash = prog.cache.normalizeKey("{o.minify}-{o.sourcemap}").slice(0,4)
	let id = params.id = prog.cache.getPathAlias(entry) + "1{hash}"
	# params.outdir = "dist/{id}"
	params.id = id
	params.outbase = prog.cwd

	let bundle = new Bundler(prog,params)

	let out = await bundle.build!
	
	if let exec = out..manifest..main
		let path = np.resolve(prog.cwd,exec.path)

		if o.watch
			let runner = new Runner(path,o)
			runner.start!
			bundle.manifest.on('change:main') do
				# console.log 'manifest change for runner?!?'
				runner.reload!
		else
			Module._load(path, require.main, true)
	return

let binary = cli.version('2.0.0').name('imba')

cli.command('run <script>', { isDefault: true })
	.description('Run stuff')
	.option("-b, --build", "")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-d, --dev", "Minify generated files")
	.option("-i, --instances <count>", "Number of instances to start",fmt.i,1)
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
