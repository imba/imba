const http = require 'http'
const fs = require 'fs'
const path = require 'path'
const cluster = require 'cluster'

import Component from './component'

export default class Serve < Component
	def constructor program, params
		super()
		# this should only be for a specific program
		program = program
		options = program.config.serve or {}
		params = params
		log = program.log
		scripts = {}
		workers = []
		active = yes
		listening = no
		jobs = {}
	

	def start scripts
		# TODO allow specifying number of instances
		for script in scripts
			spawn(script)

	def spawn o, replace = null
		cluster.setupMaster({exec: o.exec})
		log.info 'starting',o
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
			log.info 'server started listening',address.port,!!replace
			if replace
				# if these still exists
				replace.send(['emit','reloaded'])
			# staller.pause!
			# now start cleaning up old versions?

		worker.on 'exit' do
			log.info 'server exited'

		worker.on 'message' do(message, handle)
			console.log 'message from worker',message

			if message == 'reload'
				worker.#reloading = yes
				worker.send(['emit','reloading'])
				spawn(o,worker)
				
			# if message == 'restart' and worker == main
			#	restart!