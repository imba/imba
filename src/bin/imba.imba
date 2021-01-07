import {program as cli, InvalidOptionArgumentError,CommanderError} from 'commander'

import Program from '../bundler/program'
import Runner from '../bundler/runner'
import Bundler from '../bundler/bundle2'
import np from 'path'
import nfs from 'fs'
import {resolveConfig,resolvePackage} from '../bundler/utils'
import tmp from 'tmp'

import { findSourceMap, SourceMap, Module } from 'module'

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

def parseOptions options
	options = options.opts! if options.opts isa Function
	let cwd = options.cwd ||= process.cwd!
	options.imbaPath ||= np.resolve(__dirname,'..','..')

	let statFiles = [
		__filename
		np.resolve(__dirname,'..','compiler-worker.js')
		np.resolve(__dirname,'..','node','compiler.js')
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

	if options.clean
		options.mtime = Date.now!

	options.loglevel ||= 'warning'

	global.#IMBA_OPTIONS = options
	return options

def build entry, o
	o = parseOptions(o)
	console.log 'build with entry?',entry,o
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
	console.log 'done building!!'

def run entry, o
	o = parseOptions(o)
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
		sourcemap: 'inline'
		contenthash: false
		isMain: yes
	})
	tmp.setGracefulCleanup!

	let hash = prog.cache.normalizeKey("{o.minify}-{o.sourcemap}")
	let id = params.id = (prog.cache.getPathAlias(entry) + "1{hash}").slice(0,8)

	unless params.outdir
		let tmpdir = tmp.dirSync(unsafeCleanup: yes)
		params.tmpdir = tmpdir.name
		params.outdir = tmpdir.name

	params.outbase = prog.cwd

	let bundle = new Bundler(prog,params)
	let out = await bundle.build!
	
	if let exec = out..manifest..main
		let path = np.resolve(prog.cwd,exec.path)

		if o.watch
			o.name ||= entry
			let runner = new Runner(bundle.manifest,o)
			runner.start!
			bundle.manifest.on('change:main') do
				console.log 'manifest change:main!!'
				runner.reload!
		else
			let _resolveFilename = Module._resolveFilename

			# copy existing module extensions
			# this should move into the manifest / runner
			# how will it work with js files as well? We need to consider this
			Module._extensions['.imba'] = do(mod,filename)
				# console.log 'loading imbajs file!!',filename,path
				let rel = np.relative(prog.cwd,filename)
				if let src = bundle.manifest.inputs.node[rel]
					# console.log "found input!!!!",src.js, bundle.manifest.resolve(src.js)
					let rawpath = bundle.manifest.resolve(src.js)
					let raw = nfs.readFileSync(rawpath,'utf-8')
					return mod._compile(raw,filename)
				
				# fallback to other imba extension
				console.log 'cannot compile imba file!!!',mod,filename
				# let raw = nfs.readFileSync(path,'utf-8')
				# mod._compile(raw,filename)

			Module._extensions['.imbajs'] = do(mod,filename)
				let raw = nfs.readFileSync(path,'utf-8')
				mod._compile(raw,filename)
				# let raw = exex
				# mod._compile()

			Module._resolveFilename = do(name,from)
				if name == 'imba'
					let src = np.resolve(o.imbaPath,'dist','node','imba.js')
					return src
				console.log 'resolve filename',name,from and from.path
				let res =  _resolveFilename.apply(Module,arguments)
				return res

			if params.tmpdir or true
				# console.log 'path to manifest',bundle.manifest.path
				# require(file.abs)
				Module._load(file.abs, require.main, true)
			else
				Module._load(path, require.main, true)
	return

let binary = cli.storeOptionsAsProperties(false).version('2.0.0').name('imba')

def increase-verbosity dummy, prev
	prev + 1

cli.command('run <script>', { isDefault: true })
	.description('Run stuff')
	.option("-b, --build", "")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-d, --dev", "Minify generated files")
	.option("-i, --instances <count>", "Number of instances to start",fmt.i,1)
	.option("-c, --clean", "Disregard previosly cached compilations")
	.option("-v, --verbose", "verbosity (repeat to increase)",increase-verbosity,0)
	.option("--name [name]", "Give name to process")
	.option("--outdir <value>", "")
	.option("--loglevel [value]", "Set loglevel info|warning|error|debug|silent")
	.option("--sourcemap <value>", "", "info")
	.option("--inspect", "Debug stuff")
	.option("--no-sourcemap", "Omit sourcemaps")
	.option("--no-contenthash", "Disable hashing")
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
	.option("--no-contenthash", "Disable hashing")
	.action(build)

binary.parse(process.argv)
