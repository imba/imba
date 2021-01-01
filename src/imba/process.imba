# imba$imbaPath=global
import cluster from 'cluster'
import nfs from 'fs'
import np from 'path'
import {EventEmitter} from 'events'
import {manifest} from './manifest'
import {Document,Location} from './dom/core'

# import from http2 etc?
import http from 'http'
import https from 'https'
import {Http2ServerRequest} from 'http2'

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
	avif: 'image/avif'
}

const defaultHeaders = {
	svg: {'Content-Type': 'image/svg+xml'}
	html: {'Content-Type': 'text/html'}
	jpg: {'Content-Type': 'image/jpeg'}
	jpeg: {'Content-Type': 'image/jpeg'}
	js: {'Content-Type': 'text/javascript'}
	mjs: {'Content-Type': 'text/javascript'}
	json: {'Content-Type': 'application/json'}
	otf: {'Content-Type': 'font/otf'}
	ttf: {'Content-Type': 'font/ttf'}
	woff: {'Content-Type': 'font/woff'}
	woff2: {'Content-Type': 'font/woff2'}
	png: {'Content-Type': 'image/png'}
	css: {'Content-Type': 'text/css'}
	avif: {'Content-Type': 'image/avif'}
}

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
		autoreload = no
		state = {} # proxy for listening?


		if cluster.isWorker
			console.log 'created for worker!!!'
			# does this make us unable to automatically stop a process?
			proc.on('message') do(msg)
				emit('message',msg)
				emit(...msg.slice(1)) if msg[0] == 'emit'
				reload! if msg == 'reload'
		self

	def #live
		yes

	def send msg
		if proc.send isa Function
			proc.send(msg)

	def on name, cb
		watch! if name == 'change'
		super

	def watch
		if #watch =? yes
			manifest.on('change:main') do
				emit('change',manifest)

	def reload
		# only allow reloading once
		return self unless isReloading =? yes

		state.reloading = yes

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


class AssetResponder
	def constructor url, params = {}
		url = url
		path = np.resolve(manifest.assetsDir,url.slice(manifest.assetsUrl.length + 1))
		ext = np.extname(url)
		mimeType = mimes[ext.slice(1)] or 'text/plain'
		headers = {
			'Access-Control-Allow-Origin': '*'
			'cache-control': 'public'
		}
		Object.assign(headers,defaultHeaders[ext.slice(1)] or {})

	def respond req, res
		let asset = manifest.urls[url]
		let headers = headers
		let path = asset ? np.resolve(proc.cwd!,asset.path) : self.path
		let stream = nfs.createReadStream(path)
		res.writeHead(200, headers)
		return stream.pipe(res)

	def createReadStream
		nfs.createReadStream(path)

	def pipe response
		createReadStream!.pipe(response)

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
		assetResponders = {}

		# fetch and remove the original request listener
		let originalHandler = server._events.request
		srv.off('request',originalHandler)

		# check if this is an express app?
		originalHandler.#server = self

		manifest.on('invalidate') do(params)
			# console.log 'manifest.on invalidate from server',params
			broadcast('invalidate',params)

		# use different handler if we are on http2?

		# if we are in dev-mode, broadcast updated manifest to the clients
		manifest.on('change') do(changes,m)
			console.log 'manifest changed'
			broadcast('manifest',m.data.#raw)
		
		handler = do(req,res)
			let ishttp2 = req isa Http2ServerRequest
			let url = req.url
			let assetPrefix = '/__assets__/'

			if paused or closed
				res.statusCode=302
				res.setHeader('Location',req.url)

				unless ishttp2
					res.setHeader('Connection','close')

				if closed
					if ishttp2
						req.stream.session.close!
					return res.end!
				else
					return stalledResponses.push(res)
			
			if url == '/__hmr__'
				res.writeHead(200, {
					'Content-Type': 'text/event-stream'
					'Connection': 'keep-alive'
					'Cache-Control': 'no-cache'
				})
				clients.add(res)
				# send initial manifest to hmr connection
				broadcast('init',manifest.serializeForBrowser!,[res])
				req.on('close') do clients.delete(res)
				return true

			if url.indexOf(assetPrefix) == 0
				let asset = manifest.urls[url]
				let responder = assetResponders[url] ||= new AssetResponder(url,self)
				return responder.respond(req,res)

			# create full url
			let headers = req.headers
			let base
			if ishttp2
				base = headers[':scheme'] + '://' + headers[':authority']
			else
				let scheme = req.connection.encrypted ? 'https' : 'http'
				base = scheme + '://' + headers.host

			# console.log "get headers",base,req.url,headers,req.protocol
			
			let loc = new Location(req.url,base)

			# create a context - not a document?
			Document.create(location: loc) do
				return originalHandler(req,res)

		srv.on('request',handler)

		if cluster.isWorker
			process.#live!
			process.send('serve')

	def broadcast event, data = {}, clients = clients
		data = JSON.stringify(data)
		let msg = "data: {data}\n\n\n"
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

export def serve srv,...params
	# if srv isa http.Server
	# 	console.log 'http server!!'
	# elif srv isa https.Server
	# 	console.log 'https server!!'
	# else
	# 	console.log 'unknown server'

	return Server.wrap(srv,...params)
