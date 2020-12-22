# imba$imbaPath=global
import cluster from 'cluster'
import fs from 'fs'
import fsp from 'path'
import {EventEmitter} from 'events'
import {manifest} from './manifest'
import {Document,Location} from './dom/core'

# import from http2 etc?
import http from 'http'
import https from 'https'
import {Http2ServerRequest} from 'http2'

const proc = global.process

class Servers < Set

	def call name,...params
		for server of self
			server[name](...params)

	def close o = {}	
		for server of self
			server.close(o)

	def reload o = {}	
		for server of self
			server.reload(o)
	
	def broadcast msg, ...rest
		for server of self
			server.broadcast(msg,...rest)

	def emit event, data
		for server of self
			server.emit(event,data)

export const servers = new Servers

export const process = new class Process < EventEmitter

	def constructor
		super

		if cluster.isWorker
			proc.on('message') do(msg)
				emit('message',msg)
				emit(...msg.slice(1)) if msg[0] == 'emit'
		self

	def send msg
		if proc.send isa Function
			proc.send(msg)

	def reload
		# only allow reloading once
		return self unless isReloading =? yes

		unless proc.env.IMBA_SERVE
			console.warn "not possible to gracefully reload servers not started via imba start"
			return

		# stall all current servers
		for server of servers
			server.pause!
	
		on('reloaded') do(e)
			# console.log 'closing servers'
			let promises = for server of servers
				server.close!
			await Promise.all(promises)
			# console.log 'actually closed!!'
			proc.exit(0)

		send('reload')


class Server

	static def wrap server
		new self(server)

	def constructor srv
		servers.add(self)
		id = Math.random!
		closed = no
		paused = no
		server = srv
		clients = new Set
		stalledResponses = []

		# fetch and remove the original request listener
		let originalHandler = server._events.request
		srv.off('request',originalHandler)

		# check if this is an express app?
		originalHandler.#server = self

		manifest.on('invalidate') do(params)
			# console.log 'manifest.on invalidate from server',params
			broadcast('invalidate',params)

		# use different handler if we are on http2?


		
		handler = do(req,res)
			let ishttp2 = req isa Http2ServerRequest

			if paused or closed
				res.statusCode=302
				res.setHeader('Connection','close')
				res.setHeader('Location',req.url)

				if closed
					return res.end!
				else
					return stalledResponses.push(res)
			
			if req.url == '/__hmr__'
				res.writeHead(200, {
					'Content-Type': 'text/event-stream'
					'Connection': 'keep-alive'
					'Cache-Control': 'no-cache'
				})
				clients.add(res)
				req.on('close') do clients.delete(res)
				return true

			if let asset = manifest.assetForUrl(req.url)
				res.writeHead(200, asset.headers)
				let reader = fs.createReadStream(asset.path)
				return reader.pipe(res)

			# create full url
			let headers = req.headers
			let base = if ishttp2
				headers[':scheme'] + '://' + headers[':authority']
			else
				headers.host
			
			let url = new Location(req.url,base)

			console.log 'request headers',url
			Document.create(location: url) do
				return originalHandler(req,res)

		srv.on('request',handler)

	def broadcast event, data = {}
		let msg = "data: {JSON.stringify(data)}\n\n\n"
		for client of clients
			client.write("event: {event}\n")
			client.write("id: imba\n")
			client.write(msg)
		return self

	def pause
		if paused =? yes
			broadcast('paused')
			console.log 'paused server'
		self

	def resume
		if paused =? no
			console.log 'resumed server'
			broadcast('resumed')
			flushStalledResponses!

	def flushStalledResponses
		for res in stalledResponses
			res.end!
		stalledResponses = []
	
	def close
		pause!

		new Promise do(resolve)
			closed = yes
			server.close(resolve)
			flushStalledResponses!

export def asset name
	manifest.assetByName(name)

export def serve srv,...params
	if srv isa http.Server
		console.log 'http server!!'
	elif srv isa https.Server
		console.log 'https server!!'
	else
		console.log 'unknown server'

	return Server.wrap(srv,...params)
