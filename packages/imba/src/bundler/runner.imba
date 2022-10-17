import cluster from 'cluster'
import np from 'path'
import cp from 'child_process'
import Component from './component'
import {Logger} from '../utils/logger'

class Instance
	runner = null
	fork = null
	args = {}
	mode = 'cluster'
	name = 'worker'
	restarts = 0

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
			].filter do $1
		}

		let env = {
			IMBA_RESTARTS: restarts
			IMBA_SERVE: true
			IMBA_PATH: o.imbaPath
			IMBA_OUTDIR: o.outdir
			IMBA_WORKER_NR: options.number
			IMBA_CLUSTER: !bundle.fork?
			IMBA_LOGLEVEL: process.env.IMBA_LOGLEVEL or 'warning'
			PORT: process.env.PORT or o.port
		}

		for own k,v of env
			env[k] = '' if v === false

		if bundle.fork?
			args.env = Object.assign({},process.env,env)
			fork = cp.fork(np.resolve(path),args.args,args)
			fork.on('exit') do(code) process.exit(code)
			return fork

		
		cluster.setupMaster(args)

		let worker = cluster.fork(env)

		worker.nr = restarts++
		let prev = worker.#prev = current

		if prev
			# log.info "reloading"
			prev.#next = worker
			prev..send(['emit','reloading'])

		worker.on 'exit' do(code, signal)
			if signal
				log.info "killed by signal: %d",signal
			elif code != 0
				log.error "exited with error code: %red",code
			elif !worker.#next
				log.info "exited"
		
		worker.on 'listening' do(address)
			o.#listening = address
			log.success "listening on %address",address
			prev..send(['emit','reloaded'])
			# now we can kill the reloaded process?

		worker.on 'error' do
			log.info "%red","errorerd"

		# worker.on 'online' do log.info "%green","online"

		worker.on 'message' do(message, handle)
			if message == 'reload'
				console.log "RELOAD MESSAGE"
				reload!

		current = worker
	
	def broadcast event
		current..send(event)

	def reload
		start!
		self


export default class Runner < Component
	def constructor bundle, options
		super()
		o = options
		bundle = bundle
		workers = new Set

	def start
		let max = o.instances or 1
		let nr = 1
		let args = {
			windowsHide: yes
			args: o.extras
			execArgv: [
				o.inspect and '--inspect',
				(o.sourcemap or bundle.sourcemapped?) and '--enable-source-maps'
			].filter do $1
		}

		let name = o.name or 'script' or np.basename(bundle.result.main.source.path)

		while nr <= max
			let opts = {
				number: nr,
				name: max > 1 ? "{name} {nr}/{max}" : name
			}
			workers.add new Instance(self,opts)
			nr++

		for worker of workers
			worker.start!

		if o.watch
			#hash = bundle.result.hash

			bundle.on('built') do(result)
				# console.log "got manifest?"
				# let hash = result.manifest.hash
				
				if #hash =? result.hash
					reload!
				else
					broadcast(['emit','rebuild',result.manifest])
		return self

	def reload
		log.info "reloading %path",o.name
		for worker of workers
			worker.reload!
		self

	def broadcast ...params
		for worker of workers
			worker.broadcast(...params)
		self