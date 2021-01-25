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
import tmp from 'tmp'
import getport from 'get-port'

const fmt = {
	int: do(val) parseInt(val)
	i: do(val) val == 'max' ? 0 : parseInt(val)
	v: do(dummy,prev) prev + 1
}

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

	if options.watch or options.dev
		options.loglevel ||= 'info'
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

	o = parseOptions(o,extras)

	o.cache = new Cache(o)
	o.fs = new FileSystem(o.cwd,o)

	let t = Date.now!
	let prog = new Program(o.config,o)

	let file = o.fs.lookup(path)

	let params = Object.assign({},o.config.node,{
		entryPoints: [file.rel]
		platform: 'node'
		watch: o.watch
		outdir: o.outdir
		sourcemap: o.sourcemap === false ? no : 'inline'
		hashing: false
		execOnly: yes
		config: o.config
		imbaPath: o.imbaPath
	})

	if file.ext == '.html'
		params.format = 'html'

	o.port ||= await getport(port: getport.makeRange(3000, 3100))
	
	if o.command == 'serve'
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
			bundle.manifest.on('change') do
				runner.broadcast(['emit','manifest:change',bundle.manifest.raw])

			bundle.manifest.on('change:main') do
				runner.reload!
	return


let binary = cli.storeOptionsAsProperties(false).version('2.0.0').name('imba')

cli.command('run <script>', { isDefault: true })
	.description('Imba')
	.option("-d, --dev", "Enable development mode")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-i, --instances [count]", "Number of instances to start",fmt.i,1)
	.option("-o, --outdir <dest>", "Directory to output files")
	.option("-v, --verbose", "verbosity (repeat to increase)",fmt.v,0)
	.option("-f, --force", "force overwriting and full compilation")
	.option("--clean", "Remove files from previous build")
	.option("--inspect", "Debug")
	.option("--sourcemap <value>", "", "inline")
	.option("-S, --no-sourcemap", "Omit sourcemaps")
	.option("--no-hashing", "Disable hashing")
	.action(run)

cli.command('build <script>')
	.description('clone a repository into a newly created directory')
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-v, --verbose", "Verbose logging",fmt.v,1)
	.option("-f, --force", "force overwriting and full compilation")
	.option("-o, --outdir <dest>", "Directory to output files","dist")
	.option("--clean", "Remove files from previous build")
	.option("--platform <platform>", "Platform for entry","browser")
	.option("--no-hashing", "Disable hashing")
	.action(run)

# watch should be implied?
cli.command('serve <script>')
	.description('Run stuff')
	.option("-b, --build", "")
	.option("-d, --dev", "Enable development mode")
	.option("-w, --watch", "Continously build and watch project while running")
	.option("-m, --minify", "Minify generated files")
	.option("-f, --force", "force overwriting and full compilation")
	.option("-i, --instances [count]", "Number of instances to start",fmt.i,1)
	.option("-o, --outdir <dest>", "Directory to output files")
	.option("-v, --verbose", "verbosity (repeat to increase)",fmt.v,1)
	.option("--sourcemap <value>", "", "inline")
	.option("--inspect", "Debug stuff")
	.option("--no-sourcemap", "Omit sourcemaps")
	.option("--no-hashing", "Disable hashing")
	.action(run)


log.ts 'parse options'
binary.parse(process.argv)
