import np from 'path'
import nfs from 'fs'

import {program as cli, InvalidOptionArgumentError,CommanderError} from 'commander'

import Program from '../bundler/program'
import Runner from '../bundler/runner'
import Bundler from '../bundler/bundle'

import {resolveConfig,resolvePackage,getCacheDir} from '../bundler/utils'
import tmp from 'tmp'
import getport from 'get-port'

import SERVE_TEMPLATE from '../bundler/templates/serve-http.txt'

const t0 = Date.now!

const fmt = {
	int: do(val) parseInt(val)
	i: do(val) val == 'max' ? 0 : parseInt(val)
}

const logLevel = {
	debug: "Show everything"
	info: "Show info, warnings & errors"
	warning: "Show warnings & errors"
	error: "Show errors"
	silent: "Show nothing"

	#parse: do(val)
		unless this[val]
			let msg = "Must be one of {Object.keys(logLevel).join(',')}"
			# throw new InvalidOptionArgumentError("Must be one of {Object.keys(logLevel).join(',')}")
			throw new CommanderError(1, 'commander.optionArgumentRejected', message)
		return val
}

const schema = {
	sourcemap: {
		on: "Generate sourcemaps"
		inline: "Inline sourcemap in compiled files"
		external: "Generate .js.map files but omit //# sourceMappingURL= from .js files"
	}
}

def parseOptions options, extras = []
	if options.#parsed
		return options

	options = options.opts! if options.opts isa Function
	let cwd = options.cwd ||= process.cwd!
	options.imbaPath ||= np.resolve(__dirname,'..')

	options.extras = extras
	let statFiles = [
		__filename
		np.resolve(__dirname,'..','dist','compiler-worker.js')
		np.resolve(__dirname,'..','dist','node','compiler.js')
	]
	options.mtime = Math.max(...statFiles.map(do nfs.statSync($1).mtimeMs))
	# TODO also check mtime of the compiler
	options.config = resolveConfig(cwd,options.config or 'imbaconfig.json')
	options.package = resolvePackage(cwd)

	if options.loglevel and !logLevel[options.loglevel]
		console.log "--loglevel must be one of",Object.keys(logLevel)
		process.exit(0)

	if options.verbose
		options.loglevel ||= 'info'

	if options.watch or options.dev
		options.loglevel ||= 'info'
		options.hmr = yes

	if options.clean
		options.mtime = Date.now!

	options.loglevel ||= 'warning'

	options.cachedir = getCacheDir(options)
	global.#IMBA_OPTIONS = options
	options.#parsed = yes
	return options

def build entry, o
	o = parseOptions(o)
	# console.log 'build with entry?',entry,o
	let prog = new Program(o.config,o)
	# await prog.build!
	let params = Object.assign({},o.config.node,o,{
		entryPoints: [entry]
		isMain: yes
	})

	# params.outdir = ".cache/{id}"
	# params.outbase = prog.cwd
	let bundle = new Bundler(prog,params)
	let out = await bundle.build!

def run entry, o, extras
	o = parseOptions(o,extras)
	let t = Date.now!

	let prog = new Program(o.config,o)
	let file = prog.fs.lookup(entry)

	let params = Object.assign({},o.config.node,{
		entryPoints: [entry]
		exports: null
		include: null
		minify: o.minify
		platform: 'node'
		watch: o.watch
		outdir: o.outdir
		outbase: prog.cwd
		sourcemap: yes
		hashing: false
		execOnly: yes
		isMain: yes
		config: o.config
		imbaPath: o.imbaPath
	})

	o.port ||= await getport(port: getport.makeRange(3000, 3100))
	
	if o.autoserve
		delete params.entryPoints
		
		params.stdin = {
			contents: SERVE_TEMPLATE.replace('CLIENT_ENTRY','./' + file.name),
			resolveDir: file.absdir
			sourcefile: file.rel
			loader: 'js'
		}

	tmp.setGracefulCleanup!

	unless params.outdir
		let tmpdir = tmp.dirSync(unsafeCleanup: yes)
		params.outdir = params.tmpdir = tmpdir.name

	params.outbase = prog.cwd

	let bundle = new Bundler(prog,params)
	let out = await bundle.build!

	# should we really need this here?
	if let exec = out..manifest..main

		if !o.watch and o.instances == 1
			o.execMode = 'fork'
		o.name ||= entry

		let runner = new Runner(bundle.manifest,o)
		# console.log 'ready to run',bundle.manifest.main
		
		runner.start!

		if o.watch
			bundle.manifest.on('change:main') do
				runner.reload!
	return

def serve entry, o, extras
	o = o.opts!
	o.watch = yes
	o.autoserve = yes
	o = parseOptions(o,extras)
	run(entry,o,extras)

let binary = cli.storeOptionsAsProperties(false).version('2.0.0').name('imba')

def increase-verbosity dummy, prev
	prev + 1

cli.command('exec <script>', { isDefault: true })
	.description('Run stuff')
	.option("-b, --build", "")
	.option("-d, --dev", "Enable development mode")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-i, --instances [count]", "Number of instances to start",fmt.i,1)
	.option("-v, --verbose", "verbosity (repeat to increase)",increase-verbosity,0)
	.option("--name [name]", "Give name to process")
	.option("--outdir <value>", "")
	.option("--loglevel [value]", "Set loglevel info|warning|error|debug|silent")
	.option("--sourcemap <value>", "", "inline")
	.option("--inspect", "Debug stuff")
	.option("--no-sourcemap", "Omit sourcemaps")
	.option("--no-hashing", "Disable hashing")
	.option("--clean", "Disregard previosly cached compilations")
	.action(run)

cli.command('build [script]')
	.description('clone a repository into a newly created directory')
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-c, --clean", "Disregard previosly cached compilations")
	.option("-m, --minify", "Minify generated files")
	.option("-v, --verbose", "Verbose logging")
	.option("--outfile <value>", "Disregard previosly cached compilations")
	.option("--platform <platform>", "Disregard previosly cached compilations","browser")
	.option("--outdir <value>", "")
	.option("--pubdir <value>", "Directory for public items - default to")
	.option("--no-hashing", "Disable hashing")
	.action(build)

cli.command('serve <script>')
	.description('Run stuff')
	.option("-b, --build", "")
	.option("-d, --dev", "Enable development mode")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-i, --instances [count]", "Number of instances to start",fmt.i,1)
	.option("-v, --verbose", "verbosity (repeat to increase)",increase-verbosity,0)
	.option("--name [name]", "Give name to process")
	.option("--outdir <value>", "")
	.option("--loglevel [value]", "Set loglevel info|warning|error|debug|silent")
	.option("--sourcemap <value>", "", "inline")
	.option("--inspect", "Debug stuff")
	.option("--no-sourcemap", "Omit sourcemaps")
	.option("--no-hashing", "Disable hashing")
	.option("--clean", "Disregard previosly cached compilations")
	.action(serve)

binary.parse(process.argv)
