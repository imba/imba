import cluster from 'cluster'
import np from 'node:path'
import cp from 'child_process'
import nfs from 'node:fs'
import { pathToFileURL } from 'node:url'
import Component from './component'
import {Logger} from '../utils/logger'
import {builtinModules} from 'module'
import {createHash, slash} from './utils'
import mm from 'micromatch'
import {__served__} from '../imba/utils'
import { ensurePackagesInstalled, getConfigFilePath } from '../utils/vite'

class WorkerInstance
	runner = null
	fork = null
	args = {}
	mode = 'cluster'
	name = 'worker'
	restarts = 0
	procs = new Set

	get manifest
		runner.manifest or {}

	get bundle
		runner.bundle

	def constructor runner, options
		super(options)
		options = options
		runner = runner
		atime = Date.now!
		state = 'closed'
		log = new Logger(prefix: ["%bold%dim",name,": "])
		current = null
		sharedEnv = {}
		restarts = 0

	def create-dev-styles
		const urls = []
		const ids = []
		const moduleMap = {}
		for [id, mod] of runner.viteServer.moduleGraph.idToModuleMap
			const url = mod.url
			urls.push url
			ids.push id
			# debugger if url.endsWith(".css")
			moduleMap[url] =
				file: mod.file
				id: mod.id
				url: url
				type: mod.type
				importedModules: Array.from(mod.importedModules.keys()).map(do $1.id)
				importers: Array.from(mod.importers.keys()).map(do $1.id)
				code: (url.endsWith('.css') ? mod.ssrTransformResult.code : "")
		const DEV_CSS_PATH = "./.dev-ssr"
		nfs.mkdirSync(DEV_CSS_PATH) unless nfs.existsSync(DEV_CSS_PATH)
		let all-css = ""
		for own id, mod of moduleMap when mod.code
			all-css += mod.code.substring(mod.code.indexOf('"') + 1, mod.code.lastIndexOf('"')).replace(/\\n/g, '\n') + "\n"
		nfs.writeFileSync("{DEV_CSS_PATH}/all.css",all-css)

	def start
		return if current and current.#next

		let o = runner.o
		let path = bundle.result.main

		let args = {
			windowsHide: yes
			args: o.extras
			exec: path
			execArgv: [
				o.inspect and '--inspect',
				(o.sourcemap or bundle.sourcemapped?) and '--enable-source-maps'
				o.memlimit and `--max_old_space_size={o.memlimit}`
				...o.nodeflags
			].filter do $1
		}

		let env = {
			IMBA_RESTARTS: restarts
			IMBA_SERVE: true
			IMBA_PATH: o.imbaPath
			IMBA_OUTDIR: o.outdir
			IMBA_WORKER_NR: options.number
			IMBA_CLUSTER: !bundle.fork?
			IMBA_WATCH: (o.watch ? 1 : '')
			IMBA_LOGLEVEL: process.env.IMBA_LOGLEVEL or 'warning'
			PORT: process.env.PORT or o.port
			VITE: o.vite
		}

		Object.assign(env,sharedEnv)

		for own k,v of env
			env[k] = '' if v === false

		if bundle.fork?
			args.env = Object.assign({},process.env,env)
			fork = cp.fork(np.resolve(path),args.args,args)
			if o.vite
				fork.on 'message' do(message, handle)
					workerMessageHandler(message, handle, fork)

			# setup-vite fork
			process.on('SIGINT') do
				#reload = no
				#exit = yes
				if fork
					fork.kill('SIGINT')
				
				# force exit after 5s?
				setTimeout(&,5s) do
					process.exit(0)

			fork.on('exit') do(code)
				current = null

				if o.watch and !#exit
					if #reload
						#reload = no
						start!
				else
					process.exit(code)

			current = fork
			return fork

		# Doesnt make sense for this to happen every time?
		cluster.setupPrimary(args)

		let prev = current
		let worker = cluster.fork(env)
		worker.nr = restarts++
		worker.#prev = prev

		procs.add(worker)

		if prev
			# log.info "reloading"
			prev.#next = worker

			if prev.#listening
				markReplacing(prev)
			else
				log.info "send sigint to %d",prev.process..pid
				# make sure previous ones are marked
				prev.kill('SIGINT')

		else
			# If you try to kill with ctrl+c multiple times, force kill
			let sigints = 0
			process.on('SIGINT') do
				sigints++

				if sigints > 3
					process.exit(0)

		worker.on 'exit' do(code, signal)
			if signal
				log.info "killed %d by signal: %d",worker.process..pid,signal
			elif code == 43
				# process.exit to reload
				1
			elif code != 0
				log.error "exited %d with error code: %red",worker.process..pid,code
			elif !worker.#next
				log.info "exited"

			procs.delete(worker)

			if !worker.#next and !o.vite
				process.exit()

		worker.on 'listening' do(address)
			o.#listening = address
			unless o.vite
				log.success "listening %d on %address",worker.process.pid,address

			if worker.#listening =? yes
				if worker.#next
					log.debug "proc replaced before listening %d",worker.process.pid

				for proc of procs
					if proc.#replacing
						markReplaced(proc)

			return

		worker.on 'error' do(error)
			unless error.message == 'Channel closed'
				log.info "%red", "errored"

		# worker.on 'online' do log.info "%green","online"
		# worker.on 'message' do(message, handle)

		worker.on 'message' do(message, handle)
			# only if vite?!
			if o.vite
				workerMessageHandler(message, handle, worker)
			else
				if message[0] == 'imba:setenv'
					Object.assign(sharedEnv,message[1] or {})
				
				if message == 'imba:restart'
					if !worker.#next
						reload!

				if message == 'imba:listening'
					if worker.#listening =? yes
						log.info "imba:listening %d",worker.process.pid
						for proc of procs
							if proc.#replacing
								markReplaced(proc)
			return

		current = worker

	def logProcs
		for proc of procs
			log.info "process %d {!!proc.#listening} {!!proc.#replacing} {!!proc.#replaced}",proc.process.pid
		yes

	def markReplacing worker
		if worker.#replacing =? yes
			worker.send(['emit','reloading'])
			worker.send('imba:replacing')

	def markReplaced worker
		if worker.#replaced =? yes
			worker.send(['emit','reloaded'])
			worker.send('imba:replaced')

	def workerMessageHandler(message, handle, worker)
		if message.type == 'exit'
			await runner.viteServer.close!

		if message.type == 'fetch'
			let md
			try md = await runner.viteNodeServer.fetchModule(message.id) catch error
				console.error "Error fetching module {message.id}", error.name, error.message
				return process.exit 1

			if np.isAbsolute message.id
				const url = new URL("file://{message.id}")
				const params = new URLSearchParams(url.search)
				if params.has('url') and params.has('entry')
					try await create-dev-styles! catch error
						console.log "error creating DEV SSR styles", error

			worker..send JSON.stringify
				type: 'fetched'
				id: message.id
				md: md

		elif message.type == 'resolve'
			const id = message.payload.id
			const importer = message.payload.importer
			const output = await runner.viteNodeServer.resolveId(id, importer)
			const response = JSON.stringify
				type: 'resolved'
				output: output
				input: {id, importer}
			worker.send response

		if message == 'exit'
			process.exit!

		if message == 'reload'
			reload!

	def broadcast event
		current..send(event)

	def reload
		if bundle.fork?
			if current
				#reload = yes
				current.send(['emit','reloadHard'])
			else
				start!
		else
			start!
		self

export default class Runner < Component
	viteNodeServer
	viteServer
	fileToRun

	def constructor bundle, options
		super()
		o = options
		bundle = bundle
		workers = new Set
		fileToRun = np.resolve bundle.cwd, o.name

	def shouldRerun(id)
		return yes if id == fileToRun
		# __served__ contains modules that were served by Vite in the client
		# These would trigger HMR, so there is no need to live reload the server
		return false if __served__.has id
		const mod = viteServer.moduleGraph.getModuleById(id)
		return false unless mod
		let rerun = false
		mod.importers.forEach do(i)
			if !i.id
				return
			const heedsRerun = shouldRerun(i.id)
			if heedsRerun
				rerun = true
		rerun

	# TODO: static variables
	_rerunTimer
	restartsCount = 0
	watcher-debounce = 20
	def schedule-reload
		const currentCount = restartsCount
		clearTimeout _rerunTimer
		return if restartsCount !== currentCount
		_rerunTimer = setTimeout(&, watcher-debounce) do
			return if restartsCount !== currentCount
			viteServer.reloadModule(viteServer.moduleGraph.urlToModuleMap.get fileToRun)
			reload!

	def initVite
		await ensurePackagesInstalled(['vite', 'vite-node'], process.cwd())
		const builtins = new RegExp(builtinModules.join("|"), 'gi');
		let Vite = await import("vite")
		let ViteNode = await import("vite-node/server")
		const {viteNodeHmrPlugin} = await import("./viteNodeHmrPlugin.ts")
		const config = await getConfigFilePath("server", {command: "serve", mode: "development", vite: yes})
		# vite automatically picks up the config file if present. And thus we end up with duplicated plugins
		config.configFile = no
		viteServer = await Vite.createServer config
		viteNodeServer = new ViteNode.ViteNodeServer viteServer, {
			deps:
				moduleDirectories: ['node_modules']
			transformMode:
				ssr: [/.*/g]
		}

		# installSourcemapsSupport({
		# 	getSourceMap: do(source) viteNodeServer.getSourceMap(source)
		# })
		viteServer.watcher.on "change", do(id)
			id = slash(id)
			const needsRerun = shouldRerun(id)
			const file-path = np.relative(viteServer.config.root, id)
			const skip? = o.skipReloadingFor and mm.isMatch(file-path, o.skipReloadingFor)
			if needsRerun and !skip?
				schedule-reload()
		fileToRun = np.resolve bundle.cwd, o.name
		let body = nfs.readFileSync(np.resolve(__dirname, "./worker_template.js"), 'utf-8')
			.replace("__ROOT__", viteServer.config.root)
			.replace("__BASE__", viteServer.config.base)
			.replace("__FILE__", fileToRun)
			.replace("__WATCH__", o.watch)
		# start uncommend to upgrade vite-node-client
		# debugger
		# const output = await Vite.build
		# 	# configFile: no
		# 	optimizeDeps: {disabled: yes}
		# 	esbuild:
		# 		target: "node18"
		# 		platform: "node"
		# 	ssr:
		# 		target: "node"
		# 		# transformMode: { ssr: [new RegExp(builtinModules.join("|"), 'gi')] }
		# 	build:
		# 		minify: no
		# 		rollupOptions:
		# 			external: [...builtinModules, ...builtinModules.map(do "node:{$1}")]
		# 		target: "node18"
		# 		lib:
		# 			formats: ["es"]
		# 			entry: require.resolve("vite-node/client").replace(".cjs", ".mjs")
		# 			name: "vite-node-client"
		# 			fileName: "vite-node-client"
		# const license = nfs.readFileSync(np.join(require.resolve("vite-node/client"), "..", "..", "LICENSE"), "utf-8")
		# const content = "/* {license} */\n{output[0].output[0].code}"
		# nfs.writeFileSync(np.resolve(__dirname, np.join("..", 'vendor', 'vite-node-client.mjs')), content)
		# process.exit 1
		# end   uncommend to upgrade vite-node-client

		const hash = createHash(body)
		const fpath = np.join o.tmpdir, "bundle.{hash}.mjs"
		# in windows, the path would start with c: ...
		# and esm doesn't support it.
		const vnpath = pathToFileURL(np.join o.tmpdir, "vite-node-client.mjs")
		const vn-vendored = np.resolve __dirname, np.join("..", "vendor","vite-node-client.mjs")
		nfs.writeFileSync(vnpath, nfs.readFileSync(vn-vendored, 'utf-8')) unless nfs.existsSync(vnpath)
		body = body.replace("__VITE_NODE_CLIENT__", vnpath.href)
		nfs.writeFileSync(fpath, body)
		# this is need to initialize the plugins
		await viteServer.pluginContainer.buildStart({})

		bundle =
			fork?: !o.watch
			result:
				main: fpath
				hash: hash

	def start
		let max = o.instances or 1
		let nr = 1

		let name = o.name or 'script' # or np.basename(bundle.result.main.source.path)

		while nr <= max
			let opts = {
				number: nr,
				name: max > 1 ? "{name} {nr}/{max}" : name
			}
			workers.add new WorkerInstance(self,opts)
			nr++

		for worker of workers
			worker.start!

		if o.watch
			#hash = bundle.result.hash

			bundle..on('errored') do(errors)
				broadcast(['emit','errors',errors])

			bundle..on('repaired') do(errors)
				broadcast(['emit','repaired'])

			# running with vite, we use a thinner bundle
			bundle..on('built') do(result)
				# let hash = result.manifest.hash
				if #hash =? result.hash
					reload!
				else
					broadcast(['emit','rebuild',result.manifest])
		return self

	def reload
		console.log("\x1bc") if o.clear
		log.info "reloading %path",o.name
		for worker of workers
			worker.reload!
		self

	def broadcast ...params
		for worker of workers
			worker.broadcast(...params)
		self
