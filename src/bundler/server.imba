const http = require 'http'
const fs = require 'fs'
const path = require 'path'
const cluster = require 'cluster'

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


export class Proxy
	def constructor server
		server = server
		log = server.log
		bundler = server.bundler

		workers = []
		staller = new Staller(server) 
		active = yes
		listening = no
	
	def pause
		staller.resume!
		# stop receiving from the existing workers
	
	def resume
		staller.pause!

	def start
		spawn!

	def restart
		staller.resume!
		main.send('close') if main
		spawn!

	def spawn
		cluster.setupMaster({exec: server.options.exec})
		log.info 'starting server',server.port
		let worker = cluster.fork(
			PORT: server.port
			MANIFEST: bundler.manifest
			IMBA_SERVE: true
			IMBA_MANIFEST: bundler.manifestpath
		)
		workers.push(worker)
		worker.on 'listening' do(address)
			log.info 'server started listening',address.port
			staller.pause!
			# now start cleaning up old versions?

		worker.on 'exit' do
			log.info 'server exited'

		worker.on 'message' do(message, handle)
			console.log 'message from worker',message
			if message == 'restart' and worker == main
				restart!

	get main
		workers[workers.length - 1]
	
	def send ...args
		main.send(...args)

	def broadcast event,data
		main.send(['broadcast',event,data]) if main

export class Server

	def constructor bundler
		bundler = bundler
		options = bundler.config.serve or {}
		clients = new Set
		workers = []
		state = {}

	get port
		bundler.options.port or process.env.PORT or options.port

	get contentBase
		options.contentBase or bundler.cwd

	get manifest
		bundler.manifest

	get origin
		options.origin or "http{options.https ? 's' : ''}://{options.host or 'localhost'}:{port}"

	get log
		bundler.log

	def start
		log.info "starting server on",origin

		if options.exec 
			staller = new Staller(self)
			proxy = new Proxy(self)
			staller.resume!
			return self

		#server = http.createServer(handle.bind(self))
		#server.listen(port) do
			log.success "server started on {origin}"
		self


	def broadcast event, msg
		for client of clients
			client.write("event: {event}\n")
			client.write("id: imba\n")
			client.write("data: {JSON.stringify(msg)}\n\n\n")
			

		if proxy
			proxy.broadcast(event,msg)
		self

	def updated writes, manifest, initial?
		let payload = for item in manifest.changes
			let entry = manifest.files[item]
			continue unless entry.url
			entry.url
		broadcast('invalidate',payload)

		if initial? and proxy
			proxy.start!
		if proxy
			proxy.send(['manifest',manifest])

	def handle req, res
		let url = new URL(req.url,'http://localhost')
		let dir = url.pathname
		let abs = path.resolve(contentBase,req.url.slice(1) or 'index.html')
		let ext = (path.extname(dir) or '').slice(1)

		log.info 'request',req.url

		let out = {
			status: 200
			headers: {}
			body: null
			type: ext or 'html'
		}

		if let src = (manifest.urls[req.url] or manifest.urls[url.pathname])
			let asset = manifest.files[src]
			if asset.#file
				out.body = Buffer.from(asset.#file.contents or asset.#file.text)

		if !out.body and fs.existsSync(abs)
			out.body = fs.readFileSync(abs,'utf-8')

		if !out.body and (dir == '/' or dir == '/index.html')
			let out = <html>
				<head>
					<title> "Dev server"
				<body>
					<script src="/bundle/index.js">
			out.body = String(out)

		if req.url == '/__hmr__'
			out.headers['Content-Type'] = 'text/event-stream'
			out.headers['Connection'] = 'keep-alive'
			out.headers['Cache-Control'] = 'no-cache'
			res.writeHead(200, out.headers)
			res.write('\n\n')
			clients.add(res)
			req.on('close') do clients.delete(res)
			return

		# history fallback - render unmatched routes as /
		if out.body == undefined and url != '/'
			req.url = '/'
			return handle(req,res)

		if out.type
			out.headers['Content-Type'] = mimes[out.type] or out.type
			res.writeHead(out.status or 200,out.headers)
			res.end(out.body)
		yes