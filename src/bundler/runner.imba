const cluster = require 'cluster'
import Component from './component'

const FLAGS = {

	REPLACED: 1
	EXITED: 2
	PAUSED: 4
	ERRORED: 8
}

export default class Runner < Component
	def constructor exec, options
		super()
		exec = exec
		options = options
		workers = new Set

	def start
		let max = options.instances or 1
		let nr = 1
		while nr <= max
			let opts = {number: nr, max: max}
			spawn(opts)
			nr++
		return self

	def reload
		console.log 'runner restart?!?'
		for worker of workers
			worker.send('reload')
		self

	def spawn o, replace = null
		cluster.setupMaster({
			exec: exec
			windowsHide: yes
			execArgv: ['--enable-source-maps']
		})

		unless replace
			log.info "spawn %path instance %ref",exec,o.number

		let restarts = replace ? (replace.#restarts + 1) : 0
		let worker = cluster.fork(
			PORT: o.port or process.env.PORT
			IMBA_RESTARTS: restarts
			IMBA_SERVE: true
		)
		worker.#restarts = restarts
		worker.#state = 'loading'
		worker.#listening = []

		worker.reload = do
			log.info "%ref start reloading",o.number
			worker.#reloading = yes
			worker.#state = 'reloading'
			worker.send(['emit','reloading'])
			spawn(o,worker)

		workers.add(worker)

		worker.on 'listening' do(address)
			# this could happen multiple times in a single worker?
			# should rather listen for imba.serve commands?
			worker.#listening.push(address)
			log.info "%ref listening on %d",o.number,address.port
			if replace
				replace.send(['emit','reloaded'])

		worker.on 'error' do
			log.info "%ref errorerd",o.number
			# workers.delete(worker)

		worker.on 'exit' do(code, signal)
			if signal
				log.info "%ref was killed by signal: %d",o.number,signal
			elif code != 0
				log.error "%ref exited with error code: %red",o.number,code
			else
				log.info "%ref exited",o.number

			workers.delete(worker)

		worker.on 'message' do(message, handle)
			if message == 'serve'
				log.info '%ref started serving',o.number

			if message == 'reload'
				worker.reload!
