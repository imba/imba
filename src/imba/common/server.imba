# imba$imbaPath=global
import cluster from 'cluster'
import fs from 'fs'
import fsp from 'path'
import {EventEmitter} from 'events'

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

ImbaContext.prototype.process = new class Process < EventEmitter

	def constructor
		super

		if cluster.isWorker
			process.on('message') do(msg)
				emit('message',msg)
				emit(...msg.slice(1)) if msg[0] == 'emit'
		self

	def send msg
		if process.send isa Function
			process.send(msg)

	def reload
		# only allow reloading once
		return self unless isReloading =? yes

		unless process.env.IMBA_SERVE
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
			process.exit(0)

		send('reload')


class Asset
	def constructor desc
		desc = desc

	get url do desc.url
	get path do desc.path
	get hash do desc.hash
	get ext do #ext ||= fsp.extname(desc.path).substr(1)
	get body do #body ||= fs.readFileSync(desc.path,'utf8')

	get headers
		{
			'Content-Type': mimes[ext] or 'text/plain'
			'Access-Control-Allow-Origin': '*'
			'cache-control': 'public'
		}

class Manifest < EventEmitter
	def constructor cwd = process.cwd!
		super()
		cwd = cwd
		path = fsp.resolve(cwd,'imbabuild.json')
		data = load! or {}

	get changes
		data.changes or []

	def load
		try JSON.parse(fs.readFileSync(path,'utf-8'))

	def assetByName name
		return unless data.assets and name
		if let asset = data.assets[name]
			return asset.#rich ||= new Asset(asset)

	def urlForAsset name
		if let asset = assetByName(name)
			return asset.url
		return null

	def assetForUrl url
		let pathname = url.split('?')[0]
		return assetByName(data and data.urls and data.urls[pathname])

	def watch
		if #watch =? yes
			fs.watch(path) do(curr,prev)
				let updated = load!
				data = updated

				emit('update',data.changes,self)

				let changedAssets = for item in data.changes
					let entry = data.files[item]
					continue unless entry.url
					entry.url

				if changedAssets.length
					emit('invalidate',changedAssets)

	# listen to updates etc
	def on event, cb
		watch!
		super

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
		manifest = global.imba.manifest
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

extend class ImbaContext
	get servers
		servers

	get manifest
		global.#imbaManifest ||= new Manifest

	def serve srv,...params
		return Server.wrap(srv,...params)

	def urlForAsset name
		manifest.urlForAsset(name)

	def asset name
		manifest.assetByName(name)

	def assetForUrl url
		manifest.assetForUrl(url)
