# imba$imbaPath=global
import cluster from 'cluster'
import net from 'net'
import http from 'http'
import https from 'https'
import fs from 'fs'
import fsp from 'path'

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


class Asset
	def constructor desc
		desc = desc

	get url do desc.url
	get path do desc.path
	get hash do desc.hash
	get ext do #ext ||= fsp.extname(desc.path).substr(1)
	get body do #body ||= fs.readFileSync(desc.path,'utf8')

class Manifest
	def constructor cwd = process.cwd!
		cwd = cwd
		path = fsp.resolve(cwd,'imbabuild.json')
		data = load! or {}

	def load
		try JSON.parse(fs.readFileSync(path,'utf-8'))

	def watch
		self

	def assetByName name
		return unless data.assets
		if let asset = data.assets[name]
			return asset.#rich ||= new Asset(asset)

	def urlForAsset name
		if let asset = assetByName(name)
			return asset.url
		return null

	def assetForUrl url
		return unless data.urls
		let pathname = url.split('?')[0]
		if let file = data.files[data.urls[pathname]]
			let ext = fsp.extname(file.path).substr(1)

			let out = {
				path: file.path
				url: file.url
				headers: {
					'Content-Type': mimes[ext] or 'text/plain'
				}
			}

			if ext == 'js'
				out.headers['Service-Worker-Allowed'] = '/'
			return out

		return null

	def watch
		if #watch =? yes
			console.log 'watching manifest!',path
			fs.watch(path) do(curr,prev)
				let updated = load!
				console.log updated,'manifest changed'
				data = updated

				let changed = for item in data.changes
					let entry = data.files[item]
					continue unless entry.url
					entry.url
				console.log 'changes',changed

				if global.#imbaServer and changed.length
					global.#imbaServer.broadcast('invalidate',changed)

class Server
	def constructor
		clients = new Set
		servers = new Set
		cwd = process.cwd!
		# unless manifest = loadBuildManifest([fsp.resolve(cwd,'build'),cwd])
		#	console.log "imba.server could not find manifest.json in {process.cwd!}"
		# if process.env.IMBA_MANIFEST
		#	try manifest = JSON.parse(fs.readFileSync(process.env.IMBA_MANIFEST,'utf-8'))

	get manifest
		global.imba.manifest

	def send ...params
		# console.log 'sending to imba process!'
		process.send(...params)

	def assetForUrl url, body? = no
		return unless manifest..urls
		let pathname = url.split('?')[0]
		if let file = manifest.files[manifest.urls[pathname]]
			# console.log 'found file?',file
			let ext = fsp.extname(file.path).substr(1)

			let out = {
				path: file.path
				url: file.url
				headers: {
					'Content-Type': mimes[ext] or 'text/plain'
				}
			}

			if ext == 'js'
				out.headers['Service-Worker-Allowed'] = '/'

			return out

		return null

	def urlForAsset name
		console.log 'get url for asset',name,manifest
		if let asset = manifest.assets[name]
			console.log 'found asset'
			return asset.url
		return null

	def middleware req, res, next
		# console.log 'middleware for express?!?',req.url,this
		if req.url == '/__hmr__' # method == 'HMR'
			console.log 'blocking middleware'
			return
		next()

	def intercept req, res, next
		console.log 'get request',req.url,req.baseUrl,!!manifest

		if let asset = global.imba.assetForUrl(req.url)
			res.writeHead(200, asset.headers)
			let reader = fs.createReadStream(asset.path)
			return reader.pipe(res)

		if req.url == '/__hmr__'
			res.writeHead(200, {
				'Content-Type': 'text/event-stream'
				'Connection': 'keep-alive'
				'Cache-Control': 'no-cache'
			})

			clients.add(res)
			req.method = 'HMR'
			req.on('close') do clients.delete(res)
			return true

		next(req,res)



	def serve app
		console.log('started serving',process.env.IMBA_MANIFEST)
		return

		# if !manifest and process.env.IMBA_MANIFEST
		#	try manifest = JSON.parse(fs.readFileSync(process.env.IMBA_MANIFEST,'utf-8'))
		# identify if this is an express server
		servers.add(app)

		app.on 'request' do(req,res)
			console.log 'get request',req.url,req.baseUrl
			# may need to parse raw headers here rawHeaders
			let headers = req.headers or {}
			let mode = headers['sec-fetch-mode']
			let dest = headers['sec-fetch-dest']
			let accept = (headers['accept'] or '').split(',')[0]

			let {end,writeHead,write} = res

			# should only intercept if wanted
			if let asset = assetForUrl(req.url)
				# console.log 'found asset!',req.url
				req.url = null
				res.writeHead(200, asset.headers)
				let reader = fs.createReadStream(asset.path)
				return reader.pipe(res)

			# req.headers.accept
			if req.url == '/__hmr__'
				console.log 'handling hmr'

				res.writeHead(200, {
					'Content-Type': 'text/event-stream'
					'Connection': 'keep-alive'
					'Cache-Control': 'no-cache'
				})

				clients.add(res)
				req.method = 'HMR'
				req.on('close') do clients.delete(res)
				return true

			if false
				res.writeHead = do(code,extras)
					console.log 'writehead',code,extras
					writeHead.apply(res,arguments)

				# only works for express, no?
				res.end = do(data)
					console.log "end request?!?!",data,res.statusCode,res
					end.apply(res,arguments)
		
		return app

	def broadcast event, msg
		for client of clients
			client.write("event: {event}\n")
			client.write("id: imba\n")
			client.write("data: {JSON.stringify(msg)}\n\n\n")
		self

	def on msg, ...rest
		console.log 'process.on',msg,rest.length
		if msg == 'close'
			for server of servers
				console.log 'closing server',server
				server.close!
		elif msg == 'broadcast'
			broadcast(...rest)
		elif msg == 'manifest'
			manifest = rest[0]
		self



extend class ImbaContext
	get server
		global.#imbaServer ||= new Server

	get manifest
		global.#imbaManifest ||= new Manifest

	def urlForAsset name
		manifest.urlForAsset(name)

	def asset name
		manifest.assetByName(name)

	def assetForUrl url
		manifest.assetForUrl(url)

	def serve app, ...rest
		# console.log app
		# console.log app.stack
		console.log 'listen to app',app.handle
		let res

		let express? = app._router

		if express?
			let handle = app.handle
			app.handle = do(req,res,callback)
				server.intercept(req,res) do handle.call(app,req,res,callback)

		# if it is a regular http / https server? How can we then inject ourselves before 

		if app.listen isa Function				
			res = app.listen(...rest)
			server.servers.add(res)
		return res

# ImbaContext.prototype.server = server
# ImbaContext.prototype.middleware = handler.middleware.bind(handler)

if cluster.isWorker and process.env.IMBA_SERVE
	process.on('message') do(msg)
		if msg isa Array
			global.imba.server.on(...msg)
		else
			global.imba.server.on(msg)
		
		

