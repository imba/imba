import np from 'path'
import nfs from 'fs'
import {performance} from 'perf_hooks'
import log from '../src/utils/logger'
import {program as cli, InvalidOptionArgumentError,CommanderError} from 'commander'

import Program from '../src/bundler/program'
import FileSystem from '../src/bundler/fs'
import Runner from '../src/bundler/runner'
import Bundler from '../src/bundler/bundle'
import Cache from '../src/bundler/cache'

import {resolveConfig,resolvePackage,getCacheDir} from '../src/bundler/utils'
import {resolvePresets,merge as extendConfig} from '../src/bundler/config'
import tmp from 'tmp'
import getport from 'get-port'

const fmt = {
	int: do(val) parseInt(val)
	i: do(val) val == 'max' ? 0 : parseInt(val)
	v: do(dummy,prev) prev + 1
}

let imbapkg = resolvePackage(np.resolve(__dirname,'..')) or {}

const overrides = {}
let argv = process.argv.slice(0)
# console.log 'ARGV',argv

const overrideAliases = {
	M: {minify: false}
	m: {minify: true}
	S: {sourcemap: false}
	s: {sourcemap: true}
	H: {hashing: false}
	h: {hashing: true}
}

for item,i in argv
	continue unless item
	if item.match(/^\-\-(\w+)(\.\w+)+$/)
		let val = argv[i+1]
		let path = item.slice(2).split('.')
		let cfg = overrides
		argv[i] = null
		while path[1]
			cfg = cfg[path[0]] ||= {}
			path.shift!
		
		let aliased = overrideAliases[path[0]]
		if aliased
			Object.assign(cfg,aliased)
		else
			cfg[path[0]] = val
			argv[i] = null
			argv[i+1] = null

argv = argv.filter do $1 !== null

def parseOptions options, extras = []
	if options.#parsed
		return options
	
	let command = options._name

	options = options.opts! if options.opts isa Function

	let cwd = options.cwd ||= process.cwd!
	options.imbaPath ||= np.resolve(__dirname,'..')
	options.command = command
	options.extras = extras
	
	options.config = resolveConfig(cwd,options.config or 'imbaconfig.json')
	options.package = resolvePackage(cwd) or {}

	if command == 'build'
		options.minify ??= yes
		options.loglevel ||= 'info'
		options.outdir  ||= 'dist'

	if options.verbose > 1
		options.loglevel ||= 'debug'

	elif options.verbose
		options.loglevel ||= 'info'

	if command == 'serve'
		options.watch = yes

	if options.watch
		options.loglevel ||= 'info'
		if options.mode == 'development'
			options.hmr = yes
	
	if options.force
		options.mtime = Date.now!
	else

		let statFiles = [
			__filename
			np.resolve(__dirname,'..','workers.imba.js')
			np.resolve(__dirname,'..','compiler.imba.js')
		]
		# also check mtime of project?
		options.mtime = Math.max(...statFiles.map(do nfs.statSync($1).mtimeMs))

	options.loglevel ||= 'warning'

	options.cachedir = getCacheDir(options)
	global.#IMBA_OPTIONS = options
	options.#parsed = yes
	return options

def run entry, o, extras
	let path = np.resolve(entry)
	let srcdir = np.dirname(path)
	let prog = o = parseOptions(o,extras)
	
	o.cache = new Cache(o)
	o.fs = new FileSystem(o.cwd,o)

	extendConfig(prog.config.options,overrides)
	# console.log prog.config.options,overrides

	let t = Date.now!
	# let prog = new Program(o.config,o)

	let file = o.fs.lookup(path)

	let paramsold = Object.assign({},o.config.node,{
		entryPoints: [file.rel]
		platform: 'node'
		outdir: o.outdir
		hashing: false
		execOnly: yes
	})

	# console.log 'params',o
	let baseparams = {
		entryPoints: [file.rel]
		outdir: o.outdir
		execOnly: yes
		hashing: false
	}

	let params = resolvePresets(prog.config,baseparams,o.as or 'node')
	# console.log 'params',params

	if file.ext == '.html'
		params.format = 'html'

	o.port ||= await getport(port: getport.makeRange(3000, 3100))
	
	if o.command == 'serve' or (params.format == 'html')
		delete params.entryPoints

		params.stdin = {
			define: {ENTRYPOINT: "./{file.rel}"}
			template: 'serve-http.imba'
			resolveDir: o.cwd
			sourcefile: 'serve.imba'
			loader: 'js'
		}

		if params.format == 'html'
			params.stdin.template = 'serve-html.imba'
			params.format = 'cjs'

	tmp.setGracefulCleanup!

	unless params.outdir
		let tmpdir = tmp.dirSync(unsafeCleanup: yes)
		params.outdir = params.tmpdir = tmpdir.name

	let bundle = new Bundler(o,params)
	let out = await bundle.build!

	return if o.buildOnly or o.command == 'build'

	# should we really need this here?
	if let exec = out..manifest..main
		if !o.watch and o.instances == 1
			o.execMode = 'fork'
		o.name ||= entry

		let runner = new Runner(bundle.manifest,o)

		runner.start!

		if o.watch
			bundle.on('errored') do
				runner.broadcast(['emit','manifest:error',$1])

			bundle.manifest.on('change') do
				runner.broadcast(['emit','manifest:change',bundle.manifest.raw])

			bundle.manifest.on('change:main') do
				runner.reload!
	return

let binary = cli.storeOptionsAsProperties(false).version(imbapkg.version).name('imba')

cli.command('run <script>', { isDefault: true })
	.description('Imba')
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-M, --no-minify", "Disable minifying")
	.option("-i, --instances [count]", "Number of instances to start",fmt.i,1)
	.option("-o, --outdir <dest>", "Directory to output files")
	.option("-v, --verbose", "verbosity (repeat to increase)",fmt.v,0)
	.option("-f, --force", "force overwriting and full compilation")
	.option("--mode <mode>", "Configuration mode","development")
	.option("--pubdir <dest>", "Directory for generated public files - relative to outdir","public")
	.option("--baseurl <url>", "Base url for your generated site","/")
	.option("--clean", "Remove files from previous build")
	.option("--inspect", "Debug")
	.option("--sourcemap <value>", "", "inline")
	.option("-S, --no-sourcemap", "Omit sourcemaps")
	.option("-H, --no-hashing", "Disable hashing")
	.action(run)

cli.command('build <script>')
	.description('Build an imba/js/html entrypoint and their dependencies')
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-M, --no-minify", "Disable minifying")
	.option("-v, --verbose", "Verbose logging",fmt.v,1)
	.option("-f, --force", "force overwriting and full compilation")
	.option("-o, --outdir <dest>", "Directory to output files","dist")
	.option("--mode <mode>", "Configuration mode","production")
	.option("--pubdir <dest>", "Directory for generated public files - relative to outdir","public")
	.option("--baseurl <url>", "Base url for your generated site","/")
	.option("--clean", "Remove files from previous build")
	.option("--platform <platform>", "Platform for entry","browser")
	.option("--as <preset>", "Configuration preset","node")
	.option("-H, --no-hashing", "Disable hashing")
	.option("--sourcemap <value>", "", "inline")
	.option("-S, --no-sourcemap", "Omit sourcemaps")
	.action(run)

# watch should be implied?
cli.command('serve <script>')
	.description('Spawn a webserver for an imba/js/html entrypoint')
	.option("-b, --build", "")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-M, --no-minify", "Disable minifying")
	.option("-f, --force", "force overwriting and full compilation")
	.option("-i, --instances [count]", "Number of instances to start",fmt.i,1)
	.option("-o, --outdir <dest>", "Directory to output files")
	.option("-v, --verbose", "verbosity (repeat to increase)",fmt.v,1)
	.option("--sourcemap <value>", "", "inline")
	.option("-S, --no-sourcemap", "Omit sourcemaps")
	.option("--mode <mode>", "Configuration mode","development")
	.option("--inspect", "Debug stuff")
	.option("--pubdir <dest>", "Directory for generated public files - relative to outdir","public")
	.option("--baseurl <url>", "Base url for your generated site","/")
	.option("-H, --no-hashing", "Disable hashing")
	.action(run)

cli.command('create [project]','Create a new imba project from a template')

log.ts 'parse options'

binary.parse(argv)
