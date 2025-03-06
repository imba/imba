import np from 'path'
import url from 'url'
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
import { spawn } from 'child_process'
import { getConfigFilePath, ensurePackagesInstalled, imbaConfigPath } from '../src/utils/vite'
import create from './create.imba'
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
	options.imbaConfig = await getConfigFilePath("root", {vite: options.vite})
	# only overwrite if vite is present in the config file
	options.vite = yes if options.imbaConfig.bundler == 'vite' and !options.esbuild

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

	if options.force
		options.mtime = Date.now!
	else
		let statFiles = [
			__filename
			np.resolve(__dirname,'..','workers.imba.js')
			np.resolve(__dirname,'..','dist','compiler.cjs')
		]
		# also check mtime of project?
		options.mtime = Math.max(...statFiles.map(do nfs.statSync($1).mtimeMs))

	options.loglevel ||= 'warning'

	options.cachedir = getCacheDir(options)
	global.#IMBA_OPTIONS = options
	options.#parsed = yes
	return options

def test(o, otherOptions)
	const vitest-path = np.join(process.cwd(), "node_modules/.bin", "vitest")
	await ensurePackagesInstalled(['vitest'], process.cwd!)

	let testConfigPath = await getConfigFilePath("test", {mode: "development", command: "test", vite: yes})
	try
		let userTestConfig = (await import(String(url.pathToFileURL(testConfigPath)))).default

		if userTestConfig.test.environment == 'jsdom'
			await ensurePackagesInstalled(['@testing-library/dom', '@testing-library/jest-dom', 'jsdom'], process.cwd())

	let configFile = testConfigPath

	# create a temporary file and put the config there
	configFile = np.join process.cwd(), "node_modules", "imba.vitest.config.mjs"
	let content = nfs.readFileSync(imbaConfigPath, 'utf-8')
	if testConfigPath
		content = content.replace '/** REPLACE_ME */', `
			let userTestConfig = (await import(String(url.pathToFileURL('{testConfigPath}')))).default;
		`
	nfs.writeFileSync(configFile, content)

	let params = ["--config", configFile, "--root", process.cwd()]

	params.unshift 'bench' if otherOptions..bench?

	if !o.args.includes('--dir')
		params.push "--dir", process.cwd()

	params.push(...o.args)
	const options =
		cwd: process.cwd()
		env: {
			...process.env
			FORCE_COLOR: yes
		}
		stdio: "inherit"
	const vitest = spawn(vitest-path, params, options)
	vitest.on('exit') do process.exit $1

def bench o
	test(o, {bench?: yes})

def run entry, o, extras
	if entry.._name == 'preview' or entry.._name == 'serve'
		# no args
		let t = o
		o = entry
		entry = t
		entry = entry[0] if entry..length

	unless o._name == 'preview' or o._name == 'serve' or o._name == 'build'
		return cli.help! if o.args.length == 0

	let prog = o = await parseOptions(o,extras)

	if o.vite and (o.command == 'preview' or o.command == 'serve' or o.command == 'build') and !entry
		if nfs.existsSync("index.html")
			entry = "index.html"
		else
			return console.log "Imba {o.command} without an argument expects an index.html file. But none was found in the root of the project."

	if (o.command == 'serve' or o.command == 'build') and !o.vite and !entry
		console.log "imba {o.command} error: missing required argument 'script'"
		process.exit 1

	let [path,q] = entry.split('?')

	path = np.resolve(path)

	o.cache = new Cache(o)
	o.fs = new FileSystem(o.cwd,o)
	if o.vite
		const packagesToCheck = ['vite']
		packagesToCheck.push 'vite-node' if o.command == 'run'
		await ensurePackagesInstalled(packagesToCheck, process.cwd())

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
	out = await bundle.build! unless o.vite

	if const p = o.writeBundlePathTo
		try nfs.writeFileSync(p, bundle.outdir)

	if o.vite
		let Vite = await import("vite")
		if o.command == 'preview'
			const previewServer = await Vite.preview
				preview:
					port: o.port
			return previewServer.printUrls!

		if o.command == 'serve'

			const config = await getConfigFilePath("client", {command: "serve", mode: "development", vite: yes})
			let plugins = config.plugins

			if !entry.endsWith ".html"
				const serve-entry = entry
				def servePlugin

					def configureServer(server)
						# (in callback) -> execute after internal vite middlewares
						do server.middlewares.use "/" do(req, res, next)

							res.end """
									<!DOCTYPE html>
									<html lang="en">
										<head>
											<meta charset="utf-8" />
											<meta name="viewport" content="width=device-width,initial-scale=1" />
											<title>Imba app</title>
											<script type="module" src="./{serve-entry}"></script>
										</head>
										<body></body>
									</html>
							"""

					return {
						name: "vite-plugin-imba-serve-plugin"
						configureServer: configureServer
					}
				plugins.push servePlugin()
				entry = undefined

			config.configFile = no
			viteServer = await Vite.createServer({
				...config,
				plugins: plugins,
				server: {
					...config.server,
					port: o.port,
					host: o.host,
				},
				build: {
					...config.build,
					rollupOptions: {...config.build.rollupOptions, input: entry}
				}
			})
			await viteServer.listen!

			return viteServer.printUrls!
		if o.command == 'build'
			# build client
			let entry-points
			const options = {command: "build", mode: "production", vite: yes}
			let clientConfig = await getConfigFilePath("client", options)

			if entry.endsWith("html") or o.web
				entry-points = entry
				await Vite.build({
					...clientConfig,
					build: {
						ssrManifest: yes, # not yet leveraged in SSR
						...clientConfig.build,
						outDir: o.outdir,
						rollupOptions: {
							...clientConfig.build.rollupOptions,
							input: entry-points
						}
					}
				})
				return

			else
				let serverConfig = await getConfigFilePath("server", options)

				const serverBuild = await Vite.build({
					...serverConfig,
					configFile: no,
					build: {
						...serverConfig.build,
						outDir: o.outdir,
						rollupOptions: {
							...serverConfig.build.rollupOptions,
							input: np.join(process.cwd(), entry),
						}
					}
				})

				entry-points = []
				for path in Object.keys(serverBuild.output[0].modules) when np.isAbsolute(path)
					const url = new URL("file://{path}")
					const params = new URLSearchParams(url.search)
					if params.has('url') and params.has('entry')
						params.delete('url')
						params.delete('entry')
						url.search = params.toString!
						entry-points.push url.toString!.replace("file://", '')

				return unless entry-points.length

			await Vite.build({
				...clientConfig,
				build: {
					...clientConfig.build,
					rollupOptions: {
						...clientConfig.build.rollupOptions,
						output: {
							...clientConfig.build.rollupOptions.output,
							dir: np.join(o.outdir, "public")
						}
						input: entry-points
					}
				}
			})
			return
	let run = do
		o.name ||= entry
		let runner = new Runner(bundle,o)
		if o.vite
			await runner.initVite!
		runner.start!

	if o.vite
		run()
	elif out..main and o.command != 'build'
		run()
	elif o.watch
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
		.option("--vite", "Use Vite as a bundler")
		.option("--esbuild", "Use the built-in bundler")
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

common(cli.command('preview').description('Locally preview production build (Vite only)'))
	.option("--port <port>", "Specify port")
	.action(run)

# watch should be implied?
common(cli.command('serve').description('Spawn a webserver for an imba/js/html entrypoint'))
	.option("-i, --instances [count]", "Number of instances to start",fmt.i,1)
	.option("--port <port>", "Specify port")
	.option("--host [host]", "Specify host (true for 0.0.0.0) more in https://vitejs.dev/config/server-options.html#server-host")
	.action(run)

cli
	.command('test').description('Run tests: This is a wrapper on top of vitest')
	.option("-h, --help", "Display help (Link to https://vitest.dev/)")
	.action(test)

cli
	.command('bench').description('Run benchmark tests: This is a wrapper on top of vitest bench')
	.option("-h, --help", "Display help (Link to https://vitest.dev/guide/features.html#benchmarking-experimental)")
	.action(bench)

cli
	.command('create [name]')
	.description('Create a new imba project')
	.option('-t, --template [template]', 'Specify a template instead of selecting one interactively')
	.option('-y, --yes', 'Say yes to any confirmation prompts')
	.option('--fast', 'Generate random project name, choose default response for all prompts, and only print out resulting directory name, useful for bash scripts')
	.action(do create($1, $2.opts!))

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
