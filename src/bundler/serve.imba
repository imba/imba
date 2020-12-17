const http = require 'http'
const fs = require 'fs'
const path = require 'path'
const cluster = require 'cluster'

import Component from './component'

export class Staller

	def constructor server
		server = server
		log = server.log
		active = yes
		listening = no
		spawn!	

	def spawn
		cluster.setupMaster({exec: process.argv[1]})
		worker = cluster.fork(PORT: server.port)
		worker.on 'listening' do(address)
			console.log 'staller is listening',address
			listening = yes
			unless active
				yes
	
	def send ...args
		worker.send(...args)

	def resume
		unless active
			active = yes
			send('start')

	def pause
		if active
			send('stop')
			active = no
			spawn!


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
	
	def pause
		self
		# staller.resume!
	
	def resume
		self
		# staller.pause!

	def start
		spawn!

	def restart
		main.send('close') if main
		spawn!

	def spawn replace = null
		cluster.setupMaster({exec: options.script})
		log.info 'starting server',options.port
		let restarts = replace ? (replace.#restarts + 1) : 0
		let worker = cluster.fork(
			PORT: options.port
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
				spawn(worker)
				
			# if message == 'restart' and worker == main
			#	restart!