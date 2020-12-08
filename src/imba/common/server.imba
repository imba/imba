# imba$imbaPath=global
const cluster = require('cluster')
const net = require('net')
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')

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


class Server
	def constructor
		clients = new Set
		servers = new Set
		cwd = process.cwd!
		unless manifest = loadBuildManifest([path.resolve(cwd,'build'),cwd])
			console.log "imba.server could not find manifest.json in {process.cwd!}"
		# if process.env.IMBA_MANIFEST
		#	try manifest = JSON.parse(fs.readFileSync(process.env.IMBA_MANIFEST,'utf-8'))

	def loadBuildManifest dirs
		# should just be included in the build directly? But not when it is not built
		let search = []
		for dir in dirs
			search.push path.resolve(dir,'manifest.json')
		try 
			for src in search
				if fs.existsSync(src)
					return JSON.parse(fs.readFileSync(src,'utf-8'))
		return null
				


	def send ...params
		# console.log 'sending to imba process!'
		process.send(...params)

	def assetForUrl url, body? = no
		return unless manifest..urls
		let pathname = url.split('?')[0]
		if let file = manifest.files[manifest.urls[pathname]]
			# console.log 'found file?',file
			let ext = path.extname(file.path).substr(1)

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

	def middleware req, res, next
		# console.log 'middleware for express?!?',req.url,this
		if req.url == '/__hmr__' # method == 'HMR'
			console.log 'blocking middleware'
			return
		next()

	def intercept req, res, next
		console.log 'get request',req.url,req.baseUrl,!!manifest

		# should only intercept if wanted
		if let asset = assetForUrl(req.url)

			res.writeHead(200, asset.headers)
			let reader = fs.createReadStream(asset.path)
			return reader.pipe(res)

		# req.headers.accept
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

		if !manifest and process.env.IMBA_MANIFEST
			try manifest = JSON.parse(fs.readFileSync(process.env.IMBA_MANIFEST,'utf-8'))

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
		#server ||= new Server

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
		
		

