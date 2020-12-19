# imba$imbaPath=global
import cluster from 'cluster'
import fs from 'fs'
import fsp from 'path'
import {EventEmitter} from 'events'
import {manifest} from './manifest'

const proc = global.process

const mimes = {
	svg: 'image/svg+xml'
	html: 'text/html'
	jpg: 'image/jpeg'
	jpeg: 'image/jpeg'
	js: 'text/javascript'
	mjs: 'text/javascript'
	json: 'application/json'
	otf: 'font/otf'
	ttf: 'font/ttf'
	woff: 'font/woff'
	woff2: 'font/woff2'
	png: 'image/png'
	css: 'text/css'
}

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

const servers = new Servers


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
			console.log 'closing servers'
			let promises = for server of servers
				server.close!
			await Promise.all(promises)
			console.log 'actually closed!!'
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
		
		handler = do(req,res)
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
	console.log 'serving!'
	return Server.wrap(srv,...params)
