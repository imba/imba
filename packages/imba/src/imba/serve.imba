# imba$stdlib=1
import cluster from 'cluster'
import nfs from 'fs'
import np from 'path'
import {EventEmitter} from 'events'
import {env} from './env'

import http from 'http'
import https from 'https'

# TODO share mimeType list with bundler to
# bundle supported file extensions
const defaultHeaders = {
	html: {'Content-Type': 'text/html; charset=utf-8'}
	txt: {'Content-Type': 'text/plain; charset=utf-8'}
	js: {'Content-Type': 'text/javascript; charset=utf-8'}
	cjs: {'Content-Type': 'text/javascript; charset=utf-8'}
	mjs: {'Content-Type': 'text/javascript; charset=utf-8'}
	json: {'Content-Type': 'application/json; charset=utf-8'}
	css: {'Content-Type': 'text/css; charset=utf-8'}
	map: {'Content-Type': 'application/json; charset=utf-8'}

	otf: {'Content-Type': 'font/otf'}
	ttf: {'Content-Type': 'font/ttf'}
	woff: {'Content-Type': 'font/woff'}
	woff2: {'Content-Type': 'font/woff2'}

	svg: {'Content-Type': 'image/svg+xml'}
	avif: {'Content-Type': 'image/avif'}
	gif: {'Content-Type': 'image/gif'}
	png: {'Content-Type': 'image/png'}
	apng: {'Content-Type': 'image/apng'}
	webp: {'Content-Type': 'image/webp'}
	jpg: {'Content-Type': 'image/jpeg'}
	jpeg: {'Content-Type': 'image/jpeg'}
	ico: {'Content-Type': 'image/x-icon'}
	bmp: {'Content-Type': 'image/bmp'}
	pdf: {'Content-Type': 'application/pdf'}

	webm: {'Content-Type': 'video/webm'}
	weba: {'Content-Type': 'audio/webm'}
	avi: {'Content-Type': 'video/x-msvideo'}
	mp3: {'Content-Type': 'audio/mpeg'}
	mp4: {'Content-Type': 'video/mp4'}
	m4a: {'Content-Type': 'audio/m4a'}
	mov: {'Content-Type': 'video/quicktime'}
	wmv: {'Content-Type': 'video/x-ms-wmv'}
	mpeg: {'Content-Type': 'video/mpeg'}
	wav: {'Content-Type': 'audio/wav'}
	ogg: {'Content-Type': 'audio/ogg'}
	ogv: {'Content-Type': 'video/ogg'}
	oga: {'Content-Type': 'audio/ogg'}
	opus: {'Content-Type': 'audio/opus'}
}

const hmrState = {
	id: Date.now()
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

	def sseEnd
		let promises = []
		for server of self
			for client of server.clients
				promises.push new Promise do(resolve)
					client.on('finish',resolve)
					client.end()
		return Promise.all(promises)

const servers = new Servers

const process = new class Process < EventEmitter
	def constructor
		super
		autoreload = no
		state = {}

		if global.IMBA_RUN
			if cluster.isWorker
				proc.on('message') do(msg)
					emit('message',msg)
					emit(...msg.slice(1)) if msg[0] == 'emit'
					# reload! if msg == 'reload'
			else
				proc.on('message') do(msg)
					emit(...msg.slice(1)) if msg[0] == 'emit'

		self

	def #setup
		return unless #setup? =? yes

		on('rebuild') do(e)
			let prev = global.IMBA_MANIFEST
			global.IMBA_MANIFEST = e
			servers.broadcast('rebuild',e)

		on('reloadHard') do(e)
			servers.broadcast('reloadHard',e)
			await servers.sseEnd()
			proc.exit(0)

		on('reloading') do(e)
			state.reloading = yes
			for server of servers
				server.pause!

		on('reloaded') do(e)
			state.reloaded = yes
			servers.broadcast('reloaded')
			await new Promise do setTimeout($1,100)

			let promises = for server of servers
				server.close!

			setTimeout(&,100) do proc.exit(0)
			await Promise.all(promises)
			proc.exit(0)
		yes

	def send msg
		if proc.send isa Function
			proc.send(msg)

	def on name, cb
		super

	def reload
		# only allow reloading once
		return self unless isReloading =? yes
		state.reloading = yes

		unless proc.env.IMBA_SERVE
			console.warn "not possible to gracefully reload servers not started via imba start"
			return

		send('reload')
		return

def deepImports src, links = [], depth = 0
	let asset = global.IMBA_MANIFEST[src]
	return links if links.indexOf(src) >= 0
	if asset..imports

		for item in asset..imports
			# if links.indexOf(item) >= 0 and depth > 10
			#	return links
			links.push(item)
			deepImports(item, links, depth + 1)
	return links

class AssetResponder

	def constructor server, url, asset = {}
		server = server
		url = url
		[pathname,query] = url.split('?')
		ext = np.extname(pathname)

		headers = {
			'Content-Type': 'text/plain'
			'Access-Control-Allow-Origin': '*'
			'cache-control': 'public, max-age=31536000'
		}
		Object.assign(headers,server.options.assetHeaders or {})
		Object.assign(headers,defaultHeaders[ext.slice(1)] or {})

		headers["max-age"] = 86400000

		if asset.imports and server.options.preload !== no
			headers['Link'] = deepImports(url).map(do "<{$1}>; rel=modulepreload; as=script").join(', ')

		path = server.localPathForUrl(url)

	def respond req, res
		nfs.access(path,nfs.constants.R_OK) do(err)
			if err
				res.writeHead(404,{})
				return res.end!

			try
				if server.options.setHeaders
						server.options.setHeaders(res,path)
				if global.BUN
					nfs.readFile(path) do(err,data)
						res.writeHead(200,headers)
						res.end(data)
				else
					let stream = nfs.createReadStream(path)
					res.writeHead(200, headers)
					return stream.pipe(res)
			catch e
				res.writeHead(503,{})
				return res.end!

	def createReadStream
		nfs.createReadStream(path)

	def pipe response
		createReadStream!.pipe(response)

class Server

	static def wrap server, o = {}
		new self(server,o)

	def localPathForUrl url
		let src = url.replace(/\?.*$/,'')
		return urlToLocalPathMap[src] ??= if true
			let path = np.resolve(env.publicPath,'.' + src)
			let res = nfs.existsSync(path) and path
			if !res and staticDir
				path = np.resolve(staticDir,'.' + src)
				res = nfs.existsSync(path) and path
			res

	def headersForAsset path
		let ext = np.extname(path)
		let headers = Object.assign({
			'Content-Type': 'text/plain'
			'Access-Control-Allow-Origin': '*'
			'cache-control': 'public'
		},defaultHeaders[ext.slice(1)] or {})

	get manifest
		global.IMBA_MANIFEST or {}

	def constructor srv,options = {}
		servers.add(self)
		id = Math.random!
		startedAt = Date.now!
		options = options
		closed = no
		paused = no
		server = srv
		clients = new Set
		stalledResponses = []
		assetResponders = {}
		urlToLocalPathMap = {}
		publicExistsMap = {}

		staticDir = global.IMBA_STATICDIR or ''

		if proc.env.IMBA_PATH
			# what if there is no imba path?
			devtoolsPath = np.resolve(proc.env.IMBA_PATH,'hmr.js')

		scheme = srv isa http.Server ? 'http' : 'https'

		# fetch and remove the original request listener
		let originalHandler = server._events.request
		let dom = global.#dom

		srv.off('request',originalHandler)

		# check if this is an express app?
		originalHandler.#server = self

		srv.on('listening') do
			# if not silent?
			let adr = server.address!
			let host = adr.address
			if host == '::' or host == '0.0.0.0'
				host = 'localhost'
			let url = "{scheme}://{host}:{adr.port}/"
			# unless proc.env.IMBA_CLUSTER
			unless proc.env.IMBA_CLUSTER
				console.log "listening on {url}"

		if global.IMBA_HMR
			global.IMBA_HMR_PATH = '/__hmr__.js'

		handler = do(req,res)
			let ishttp2 = req.constructor.name == 'Http2ServerRequest'
			let url = req.url

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

			if url == '/__imba__.mjs'
				res.writeHead(200, defaultHeaders.mjs)
				let path = np.resolve(proc.env.IMBA_PATH,'dist','imba.mjs')
				let stream = nfs.createReadStream(path)
				return stream.pipe(res)

			if global.IMBA_HMR
				if url == '/__hmr__.json'
					res.writeHead(200, defaultHeaders.json)
					return res.end(JSON.stringify(hmrState))

				elif url == '/__hmr__.js' and devtoolsPath
					# and if hmr?
					let stream = nfs.createReadStream(devtoolsPath)
					res.writeHead(200, defaultHeaders.js)
					return stream.pipe(res)

				if url == '/__hmr__'
					let headers = {
						'Content-Type': 'text/event-stream'
						'Cache-Control': 'no-cache'
					}
					unless ishttp2
						headers['Connection'] = 'keep-alive'

					res.writeHead(200,headers)
					clients.add(res)
					broadcast('init',global.IMBA_MANIFEST,[res])
					broadcast('state',hmrState,[res])
					
					req.on('close') do clients.delete(res)
					return true

			# create full url
			let headers = req.headers
			let base
			if ishttp2
				base = headers[':scheme'] + '://' + headers[':authority']
			else
				let scheme = req.connection.encrypted ? 'https' : 'http' #
				base = scheme + '://' + headers.host

			let asset = manifest[url]

			if asset
				let path = localPathForUrl(url)
				if path
					let responder = assetResponders[url] ||= new AssetResponder(self,url,asset)
					return responder.respond(req,res)

			if url.match(/\.[A-Z\d]{8}\./) or url.match(/\.\w{1,4}($|\?)/)
				if let path = localPathForUrl(url)
					try
						let headers = headersForAsset(path)
						if options.setHeaders
							options.setHeaders(res,path)
						if global.BUN
							return nfs.readFile(path) do(err,data)
								if err
									res.writeHead(500,{})
									res.write("Error getting the file: {err}")
								else
									res.writeHead(200,headers)
									res.end(data)
						else
							let stream = nfs.createReadStream(path)
							res.writeHead(200, headers)
							return stream.pipe(res)
					catch e
						res.writeHead(503,{})
						return res.end!

			# continue to the real server
			if dom
				let loc = new dom.Location(req.url,base)
				# create a context - not a document?
				dom.Document.create(location: loc) do
					return originalHandler(req,res)
			else
				return originalHandler(req,res)

		srv.on('request',handler)

		srv.on('close') do
			console.log "server is closing!"

		if global.IMBA_RUN
			if cluster.isWorker or proc.env.IMBA_WATCH
				process.#setup!
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
		self

	def resume
		if paused =? no
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
	return Server.wrap(srv,...params)
