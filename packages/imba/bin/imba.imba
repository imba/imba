import np from 'path'
import nfs from 'fs'
import {performance} from 'perf_hooks'
import log from '../src/utils/logger'
import print-info from '../src/utils/print-info'
import imba-fmt from '../src/utils/fmt'
import {program as cli} from 'commander'
import FileSystem from '../src/bundler/fs'
import Runner from '../src/bundler/runner'
import Bundler from '../src/bundler/bundle'
import Cache from '../src/bundler/cache'
import {resolveConfig,resolveFile,resolvePackage,getCacheDir, resolvePath} from '../src/bundler/utils'
import {resolvePresets,merge as extendConfig} from '../src/bundler/config'
import * as dotenv from 'dotenv'

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
let nodeflags = []

const overrideAliases = {
	M: {minify: false}
	m: {minify: true}
	S: {sourcemap: false}
	s: {sourcemap: true}
}

const valueMap = {
	'true': true
	'false': false
	'null': null
	'undefined': undefined
}

const KnownNodeFlags = {
	'--trace-gc': yes
	'--trace-uncaught': yes
	'--prof': yes
}

let argvpre = argv.slice(0)

for item,i in argv
	continue unless item

	if KnownNodeFlags[item]
		nodeflags.push(item)
		argv[i] = null

	elif item.match(/^\-\-(\w+)(\.\w+)+$/)
		let val = argv[i+1]
		let path = item.slice(2).split('.')
		let cfg = overrides
		argv[i] = null
		while path[1]
			cfg = cfg[path[0]] ||= {}
			path.shift!

		let k = path[0]

		if k..match(/^[mMsS]+$/)
			for chr of k
				Object.assign(cfg,overrideAliases[chr])
		else
			if val.indexOf(' ') >= 0
				val = val.split(/\,\s*|\s+/g)

			val = valueMap[val] or val

			cfg[k] = val
			argv[i] = null
			argv[i+1] = null

argv = argv.filter do $1 !== null

def parseOptions options, extras = []

	return options if options.#parsed

	let command = options._name

	options = options.opts! if options.opts isa Function

	let dir = options.cwd ||= process.cwd!

	if options.args and options.args[0]
		let file = np.resolve options.args[0]
		dir = np.dirname file

	options.imbaPath ||= np.resolve(__dirname,'..')
	options.nodeflags = nodeflags.slice(0)
	options.command = command
	options.extras = extras
	options.config = await resolveConfig(options)

	options.package = resolvePackage(options.cwd) or {}
	options.dotenv = nfs.existsSync(np.resolve(options.cwd,'.env')) ? resolveFile('.env',options.cwd) : null
	options.nodeModulesPath = resolvePath('node_modules',options.cwd)

	if options.dotenv
		options.dotvars = dotenv.parse(options.dotenv.body)

	if options.esm
		options.as ??= 'esm'

	if options.verbose > 1
		options.loglevel ||= 'debug'

	elif options.verbose
		options.loglevel ||= 'info'

	if options.development
		options.minify ??= no
		options.sourcemap ??= yes
		options.watch ??= yes
		options.hmr = yes
		options.mode = 'development'

	if options.production
		options.minify ??= yes
		options.sourcemap ??= no
		options.hmr = no
		options.mode = 'production'

	if command == 'build'
		options.minify ??= yes
		options.mode ??= 'production'
		options.sourcemap ??= no
		options.loglevel ||= 'info'
		options.outdir ||= 'dist'

	if options.web and command != 'build'
		command = options.command = 'serve'

	if options.web and command != 'serve'
		# if we are serving - the entrypoint will be redirected to a server-script
		options.as ??= 'web'

	if command == 'serve'
		options.watch = yes
		options.hmr = yes

	if options.watch
		options.loglevel ||= 'info'
		if options.mode == 'development'
			options.hmr = yes

	if process.env.WEBCONTAINER
		options.fork = yes

	if options.force
		options.mtime = Date.now!
	else
		let statFiles = [
			__filename
			np.resolve(__dirname,'..','workers.imba.js')
			np.resolve(__dirname,'..','dist','compiler.cjs')
			np.resolve(__dirname,'..','scripts','bootstrap.compiler.js')
		]
		# also check mtime of project?
		options.mtime = Math.max(...statFiles.map(do nfs.statSync($1).mtimeMs))

	options.loglevel ||= 'warning'

	options.cachedir = getCacheDir(options)
	global.#IMBA_OPTIONS = options
	options.#parsed = yes
	return options

def run entry, o, extras
	if entry.._name == 'serve'
		# no args
		let t = o
		o = entry
		entry = t
		entry = entry[0] if entry..length

	unless o._name == 'serve' or o._name == 'build'
		return cli.help! if o.args.length == 0

	let prog = o = await parseOptions(o,extras)

	if (o.command == 'serve' or o.command == 'build') and !entry
		console.log "imba {o.command} error: missing required argument 'script'"
		process.exit 1

	let [path,q] = entry.split('?')

	path = np.resolve(path)

	o.cache = new Cache(o)
	o.fs = new FileSystem(o.cwd,o)

	# TODO support multiple entrypoints - especially for html

	extendConfig(prog.config.options,overrides)

	if !o.outdir
		if o.command == 'build'
			o.outdir = 'dist'
		else
			tmp.setGracefulCleanup!
			let tmpdir = tmp.dirSync(unsafeCleanup: yes)
			o.outdir = o.tmpdir = nfs.realpathSync(tmpdir.name)
			# fake loader

	let file = o.fs.lookup(path)

	if q
		o.as = q.replace(/^as=/,'')
	elif file.ext == '.html'
		o.as = 'html'

		unless o.command == 'build'
			o.as = 'node'
	
	let params = resolvePresets(prog.config,{entryPoints: [file.rel]},o.as or ['node',o.platform or 'node'])

	unless o.command == 'build'
		o.port ||= await getport(port: getport.makeRange(3000, 3100))

	let bundle = new Bundler(o,params)
	let out
	out = await bundle.build!

	if const p = o.writeBundlePathTo
		try nfs.writeFileSync(p, bundle.outdir)

	let run = do
		o.name ||= entry
		let runner = new Runner(bundle,o)
		runner.start!

	if out..main and o.command != 'build'
		run()
	elif o.watch and o.command != 'build'
		bundle.once('built',run)
	return

let binary = cli.storeOptionsAsProperties(false).version(imbapkg.version).name('imba')

def common cmd
	cmd
		.option("-o, --outdir <dir>", "Directory to output files")
		.option("-w, --watch", "Continously build and watch project")
		.option("--loglevel <level>", "Log level: debug|info|success|warning|error|silent")
		.option("-v, --verbose", "verbosity (repeat to increase)",fmt.v,0)
		.option("-s, --sourcemap", "Enable sourcemaps")
		.option("-S, --no-sourcemap", "Omit sourcemaps")
		.option("-m, --minify", "Minify generated files")
		.option("-M, --no-minify", "Disable minifying")
		.option("-f, --force", "Disregard previously cached outputs")
		.option("-k, --keep", "Keep existing files in output directory")
		.option("-d, --development","Use defaults for development")
		.option("-p, --production","Use defaults for production")
		.option("--br", "Compress assets with brotli")
		.option("--fork", "Disable cluster mode")
		.option("--skipReloadingFor <glob>", "Skip reloading server code for these globs (micromatch format)")
		.option("--bundle", "Try to bundle all external dependencies")
		.option("--base <url>", "Base url for your generated site","/")
		.option("--assets-dir <url>", "Base dir for assets","assets")
		.option("--web","Build entrypoints for the browser")
		.option("--esm","Output module files")
		.option("--writeBundlePathTo <url>", "Write bundle path to a file")

common(cli.command('run [script]', { isDefault: true }).description('Imba'))
	.option("-i, --instances [count]", "Number of instances to start",fmt.i,1)
	.option("--inspect", "Debug")
	.option("--memlimit <bytes>", "Set the memory limit of the process")
	.action(run)

common(cli.command('build [script]').description('Build an imba/js/html entrypoint and their dependencies'))
	.option("--platform <platform>", "Platform for entry","browser")
	.action(run)
	# .option("--as <preset>", "Configuration preset","node")

# watch should be implied?
common(cli.command('serve').description('Spawn a webserver for an imba/js/html entrypoint'))
	.option("-i, --instances [count]", "Number of instances to start",fmt.i,1)
	.option("--port <port>", "Specify port")
	.option("--host [host]", "Specify host (true for 0.0.0.0)")
	.action(run)

cli
	.command('info')
	.description('Print helpful information')
	.action(do print-info!)

cli
	.command('fmt [formatters...]')
	.description('Removes extra whitespace, debug logs, and commented logs from **/*.imba')
	.option('-f, --force', 'Format without checking git status')
	.action(do imba-fmt($1,$2.opts!))

log.ts 'parse options'

binary.parse(argv)
