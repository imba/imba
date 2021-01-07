const cluster = require 'cluster'
import np from 'path'
import Component from './component'
import {Logger} from './logger'

const FLAGS = {

	REPLACED: 1
	EXITED: 2
	PAUSED: 4
	ERRORED: 8
}

class Instance
	runner = null
	args = {}
	mode = 'cluster'
	name = 'worker'
	restarts = 0

	get manifest
		runner.manifest

	def constructor runner, options
		super(options)
		options = options
		runner = runner
		atime = Date.now!
		state = 'closed'
		log = new Logger(prefix: ["%bold%dim",name,": "], loglevel: 'info')
		current = null
		restarts = 0

		# setInterval(&,2000) do reload!

	def start
		return if current and current.#next
		let exec = args.exec = manifest.main.path  and "/Users/sindre/repos/imba/dist/bin/vm.js"

		log.info "starting"
		cluster.setupMaster(args)

		let worker = cluster.fork(
			IMBA_RESTARTS: restarts
			IMBA_SERVE: true
			IMBA_MANIFEST_PATH: manifest.path
			IMBA_PATH: runner.options.imbaPath
			IMBA_ENTRYPOINT: manifest.main.path
		)

		worker.nr = restarts++
		let prev = worker.#prev = current

		if prev
			log.info "reloading"
			prev.#next = worker

		worker.on 'exit' do(code, signal)
			if signal
				log.info "killed by signal: %d",signal
			elif code != 0
				log.error "exited with error code: %red",code
			elif !worker.#next
				log.info "exited"
		
		worker.on 'listening' do(address)
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

	def reload
		start!
		self


export default class Runner < Component
	def constructor manifest, options
		super()
		manifest = manifest
		options = options
		workers = new Set

	def start
		let max = options.instances or 1
		let nr = 1
		let args = {
			windowsHide: yes
			execArgv: ['--enable-source-maps','--inspect']
		}

		let name = options.name or np.basename(manifest.main.source.path)

		while nr <= max
			let opts = {
				number: nr,
				args: args,
				name: max > 1 ? "{name} {nr}/{max}" : name
			}
			workers.add new Instance(self,opts)
			nr++

		for worker of workers
			worker.start!

		return self

	def reload
		for worker of workers
			worker.reload!
		self