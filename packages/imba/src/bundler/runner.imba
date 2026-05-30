import cluster from 'cluster'
import np from 'node:path'
import cp from 'child_process'
import Component from './component'
import {Logger} from '../utils/logger'

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
		}

		Object.assign(env,sharedEnv)

		for own k,v of env
			env[k] = '' if v === false

		if bundle.fork?
			args.env = Object.assign({},process.env,env)
			fork = cp.fork(np.resolve(path),args.args,args)

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

			if !worker.#next
				process.exit()

		worker.on 'listening' do(address)
			o.#listening = address
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
	fileToRun

	def constructor bundle, options
		super()
		o = options
		bundle = bundle
		workers = new Set
		fileToRun = np.resolve bundle.cwd, o.name

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
