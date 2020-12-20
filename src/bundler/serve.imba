const http = require 'http'
const fs = require 'fs'
const path = require 'path'
const cluster = require 'cluster'

import Component from './component'

export default class Serve < Component
	def constructor program
		super()
		# this should only be for a specific program
		program = program
		options = program.config.serve or {}
		log = program.log
		scripts = {}
		workers = []
		active = yes
		listening = no
		jobs = {}
	

	def start scripts
		# TODO allow specifying number of instances
		for script in scripts
			let max = script.instances or 1
			let nr = 1
			while nr <= max
				let opts = Object.assign({number: nr, max: max},script)
				spawn(opts)
				nr++
		return self

	def spawn o, replace = null
		cluster.setupMaster({exec: o.exec})
		unless replace
			log.info "spawn %path instance %ref",o.exec,o.number

		let restarts = replace ? (replace.#restarts + 1) : 0
		let worker = cluster.fork(
			PORT: o.port or process.env.PORT
			IMBA_RESTARTS: restarts
			IMBA_SERVE: true
		)
		worker.#restarts = restarts

		workers.push(worker)

		worker.on 'listening' do(address)
			# this could happen multiple times in a single cluster?
			log.info "%ref listening on %d",o.number,address.port
			if replace
				replace.send(['emit','reloaded'])
			# staller.pause!
			# now start cleaning up old versions?

		worker.on 'exit' do
			log.info "%ref exited",o.number

		worker.on 'message' do(message, handle)
			# console.log 'message from worker',message

			if message == 'reload'
				log.info "%ref start reloading",o.number
				worker.#reloading = yes
				worker.send(['emit','reloading'])
				spawn(o,worker)
				
			# if message == 'restart' and worker == main
			#	restart!