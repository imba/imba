# imba$imbaPath=global
import cluster from 'cluster'
import nfs from 'fs'
import np from 'path'
import {EventEmitter} from 'events'

# import {manifest} from './manifest'
# import {Document,Location} from './dom/core'
# import log from '../utils/logger'
import http from 'http'
import https from 'https'
import {Http2ServerRequest} from 'http2'

# TODO share mimeType list with bundler to
# bundle supported file extensions
const defaultHeaders = {
	html: {'Content-Type': 'text/html'}
	js: {'Content-Type': 'text/javascript'}
	mjs: {'Content-Type': 'text/javascript'}
	json: {'Content-Type': 'application/json'}
	css: {'Content-Type': 'text/css'}
		
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
	bmp: {'Content-Type': 'image/bmp'}
	
	webm: {'Content-Type': 'video/webm'}
	weba: {'Content-Type': 'audio/webm'}
	avi: {'Content-Type': 'video/x-msvideo'}
	mp3: {'Content-Type': 'audio/mpeg'}
	mp4: {'Content-Type': 'video/mp4'}
	m4a: {'Content-Type': 'audio/m4a'}
	mpeg: {'Content-Type': 'video/mpeg'}
	wav: {'Content-Type': 'audio/wav'}
	ogg: {'Content-Type': 'audio/ogg'}
	ogv: {'Content-Type': 'video/ogg'}
	oga: {'Content-Type': 'audio/ogg'}
	opus: {'Content-Type': 'audio/opus'}
	
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

const servers = new Servers

const process = new class Process < EventEmitter

	def constructor
		super
		autoreload = no
		state = {} # proxy for listening?
		# process is 

		if global.IMBA_RUN
			if cluster.isWorker
				proc.on('message') do(msg)
					emit('message',msg)
					emit(...msg.slice(1)) if msg[0] == 'emit'
					# reload! if msg == 'reload'
		self

	def #setup
		return unless #setup? =? yes

		on('rebuild') do(e)
			let prev = global.IMBA_MANIFEST
			global.IMBA_MANIFEST = e
			servers.broadcast('rebuild',e)

		on('reloading') do(e)
			console.log 'is reloading - from outside'
			state.reloading = yes
			for server of servers
				server.pause!

		on('reloaded') do(e)
			state.reloaded = yes
			console.log 'is reloaded - from outside'

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

		send('reload')
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
		[path,query] = url.split('?')
		ext = np.extname(path)

		headers = {
			'Content-Type': 'text/plain'
			'Access-Control-Allow-Origin': '*'
			'cache-control': 'public'
		}
		Object.assign(headers,defaultHeaders[ext.slice(1)] or {})

	def respond req, res
		let asset = manifest.urls[url]
		let headers = headers
		let path = asset ? manifest.resolve(asset) : manifest.resolveAssetPath('public' + self.path)

		#  np.resolve(proc.cwd!,asset.path)
		unless path
			console.log 'found no path for',asset,url
			res.writeHead(404, {})
			return res.end!

		if asset 
			if asset.ttl > 0
				headers['cache-control'] = "max-age={asset.ttl}"
		
			if asset.imports
				let link = []
				for item in asset.imports
					link.push("<{item.url}>; rel=modulepreload; as=script")
				headers['Link'] = link.join(', ')
		# include 
		
		nfs.access(path,nfs.constants.R_OK) do(err)
			if err
				console.log 'could not find path',path
				res.writeHead(404,{})
				return res.end!
			
			try
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
		urlToLocalPathMap[src] ||= np.resolve(publicPath,'.' + src)

	def headersForAsset path
		let ext = np.extname(path)
		let headers = Object.assign({
			'Content-Type': 'text/plain'
			'Access-Control-Allow-Origin': '*'
			'cache-control': 'public'
		},defaultHeaders[ext.slice(1)] or {})

	def respondToStatic req,res,url
		let path = localPathForUrl(url)
		let ext = np.extname(path)
		
		let headers = Object.assign({
			'Content-Type': 'text/plain'
			'Access-Control-Allow-Origin': '*'
			'cache-control': 'public'
		},defaultHeaders[ext.slice(1)] or {})

		nfs.access(path,nfs.constants.R_OK) do(err)
			if err
				console.log 'could not find path',path
				res.writeHead(404,{})
				return res.end!
			try
				let stream = nfs.createReadStream(path)
				res.writeHead(200, headers)
				return stream.pipe(res)
			catch e
				res.writeHead(503,{})
				return res.end!


	def constructor srv,options
		servers.add(self)
		id = Math.random!
		options = options
		closed = no
		paused = no
		server = srv
		clients = new Set
		stalledResponses = []
		assetResponders = {}
		urlToLocalPathMap = {}
		publicExistsMap = {}
		rootDir = try proc.env.IMBA_OUTDIR or global.IMBA_OUTDIR or np.dirname(proc.argv[1])
		publicPath = try options.publicPath or (np.resolve(rootDir,proc.env.IMBA_PUBDIR or global.IMBA_PUBDIR or '.'))
		
		if proc.env.IMBA_PATH
			devtoolsPath = np.resolve(proc.env.IMBA_PATH,'dist','hmr.js')

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
			console.log "listening on {url}"
			# log.info 'listening on %bold',url
			# Logger.main.warn 'listening on %bold',url
		
		handler = do(req,res)
			let ishttp2 = req.constructor.name == 'Http2ServerRequest'
			# let ishttp2 = false
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

			if global.IMBA_HMR
				if url == '/__hmr__.js' and devtoolsPath
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
					# broadcast('init','{}',[res])
					req.on('close') do clients.delete(res)
					return true


			# create full url
			let headers = req.headers
			let base
			# console.log 'protocol',req.protocol
			if ishttp2
				base = headers[':scheme'] + '://' + headers[':authority']
			else
				let scheme = req.connection.encrypted ? 'https' : 'http'
				base = scheme + '://' + headers.host


			# console.log "get headers",base,req.url,headers,req.protocol
			# should be other tests as well I guess
			if url.match(/\.[A-Z\d]{8}\./)
				
				let path = localPathForUrl(url)
				# console.log 'checking for url',url,path
				let exists = publicExistsMap[path] ??= nfs.existsSync(path)

				if exists
					try
						let headers = headersForAsset(path)
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
			console.log "server is closing!!!"

		if global.IMBA_RUN
			if cluster.isWorker
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
