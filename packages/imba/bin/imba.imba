import np from 'path'
import nfs from 'fs'
import {performance} from 'perf_hooks'
import log from '../src/utils/logger'
import {program as cli} from 'commander'

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

const overrideAliases = {
	M: {minify: false}
	m: {minify: true}
	S: {sourcemap: false}
	s: {sourcemap: true}
	H: {hashing: false}
	h: {hashing: true}
	P: {pubdir: '.'}
}

const valueMap = {
	'true': true
	'false': false
	'null': null
	'undefined': undefined
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
			if val.indexOf(' ') >= 0
				val = val.split(/\,\s*|\s+/g)

			val = valueMap[val] or val
			
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
		options.hmr = yes

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
	return cli.help! unless o.args.length > 0
	
	let [path,q] = entry.split('?')
	
	path = np.resolve(path)

	let prog = o = parseOptions(o,extras)
	
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
			o.outdir = o.tmpdir = tmpdir.name
			# fake loader

	let file = o.fs.lookup(path)

	if q
		o.as = q.replace(/^as=/,'')
	elif file.ext == '.html'
		o.as = 'html'

	let params = resolvePresets(prog.config,{entryPoints: [file.rel]},o.as or 'node')

	unless o.command == 'build'
		o.port ||= await getport(port: getport.makeRange(3000, 3100))
	
	if o.command == 'serve' # or params.platform != 'node'
		let wrapper = resolvePresets(prog.config,{},'node')
		params = wrapper
		params.stdin = {
			define: {ENTRYPOINT: "./{file.rel}"}
			template: 'serve-http.imba'
			resolveDir: o.cwd
			sourcefile: 'serve.imba'
			loader: 'js'
		}

		if file.ext == '.html'
			params.stdin.template = 'serve-html.imba'
			params.format = 'cjs'

	if o.command == 'build' and file.ext == '.html'
		
		yes


	let bundle = new Bundler(o,params)
	let out = await bundle.build!

	if o.command == 'build'
		return

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

def common cmd
	cmd
		.option("-o, --outdir <dir>", "Directory to output files")
		.option("-w, --watch", "Continously build and watch project")
		.option("-v, --verbose", "verbosity (repeat to increase)",fmt.v,0)
		.option("-m, --minify", "Minify generated files")
		.option("-M, --no-minify", "Disable minifying")
		.option("-f, --force", "Disregard previously cached outputs")
		.option("-c, --client-only", "Generate client files only")
		.option("--sourcemap <value>", "", "inline")
		.option("-S, --no-sourcemap", "Omit sourcemaps")
		.option("-H, --no-hashing", "Disable hashing")
		.option("--pubdir <dir>", "Directory to output client-side files - relative to outdir")
		.option("-P, --no-pubdir", "Build client-side files straight into outdir")
		.option("--base <url>", "Base url for your generated site","/")
		.option("--asset-names <pattern>", "Paths for generated assets","__assets__/[dir]/[name]")
		.option("--html-names <pattern>", "Paths for generated html files","[dir]/[name]")
		.option("--clean", "Remove files from previous build")
		.option("--assets-dir <pattern>", "Directory to nest generated assets under","assets")
		.option("--mode <mode>", "Configuration mode","development")
		.option("--web","Build as public static page")
		.option("--lib","Build as library")
		.option("--ssr","Build server and client separately")
		# .option("--baseurl <url>", "Base url for your generated site","/")
		# .option("--lib", "")
		# .option("--ssr", "")


common(cli.command('run [script]', { isDefault: true }).description('Imba'))
	.option("-i, --instances [count]", "Number of instances to start",fmt.i,1)
	.option("--inspect", "Debug")
	.action(run)

common(cli.command('build <script>').description('Build an imba/js/html entrypoint and their dependencies'))
	.option("--platform <platform>", "Platform for entry","browser")
	.option("--as <preset>", "Configuration preset","node")
	.action(run)

# watch should be implied?
common(cli.command('serve <script>').description('Spawn a webserver for an imba/js/html entrypoint'))
	.option("-i, --instances [count]", "Number of instances to start",fmt.i,1)
	.action(run)

cli.command('create [project]','Create a new imba project from a template')

log.ts 'parse options'

binary.parse(argv)
