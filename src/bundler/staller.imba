const http = require 'http'
const fs = require 'fs'
const path = require 'path'
const cluster = require 'cluster'

export class StallerWorker

	def constructor options
		port = process.env.PORT
		active = no
		queue = []

		server = http.createServer do(req,res)
			let headers = req.headers or {}
			let mode = headers['sec-fetch-mode']
			let dest = headers['sec-fetch-dest']
			let accept = (headers['accept'] or '').split(',')[0]

			# console.log 'stall response?',accept
			res.statusCode=302
			res.setHeader('Location',req.url)
			return res.end! unless active
			queue.push(res)

		server.keepAliveTimeout = 1

		process.on('message') do(msg)
			stop! if msg == 'stop'
			start! if msg == 'start'


	def start
		server.listen(port)
		active = yes
	
	def flush
		for res in queue
			res.end!
		queue = []
		self

	def stop
		active = no
		cluster.worker.disconnect!
		server.close do yes
		flush!
