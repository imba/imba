const http = require 'http'
const fs = require 'fs'
const path = require 'path'

export class Response

export class Server

	def constructor bundler
		bundler = bundler
		options = bundler.config.serve or {}
		clients = new Set

	get port
		9003

	get contentBase
		options.contentBase or bundler.cwd

	get manifest
		bundler.manifest

	def start
		console.log 'starting server'
		#server = http.createServer(handle.bind(self))
		#server.listen(port)

		# setInterval(&,5000) do broadcast(type: "ping")
		self

	def broadcast msg
		for client of clients
			console.log 'writing to client'
			client.write("data: {JSON.stringify(msg)}\n\n")
		self

	def updated writes
		
		let urls = writes.map(do $1.url).filter(do $1)
		console.log 'writes',urls
		broadcast(invalidate: urls)


	def handle req, res
		let url = new URL(req.url,'http://localhost')
		let dir = url.pathname
		let abs = path.resolve(contentBase,req.url.slice(1) or 'index.html')
		let hit = {}

		let out = {
			status: 200
			headers: {}
			body: null
		}

		console.log 'handle this!!!!',url,abs
		# wait for bundler if it has unfinished business

		if let src = (manifest.urls[req.url] or manifest.urls[url.pathname])
			# console.log 'found manifest?',src
			let asset = manifest.files[src]
			if asset.#file
				let body = Buffer.from(asset.#file.contents or asset.#file.text)
				res.writeHead(200)
				return res.end(body)

		if fs.existsSync(abs)
			let body = fs.readFileSync(abs,'utf-8')

			# if path.extname(abs) == '.html'
			# 	let script = <script innerHTML=reloader>
			# 	body = body.replace(/(?=<\/body>)/,String(script))
			# 	# console.log 'rewrite body',body
			res.writeHead(200)
			return res.end(body)

		if dir == '/' or dir == '/index.html'
			
			console.log 'serving index!'
			let out = <html>
				<head>
					<title> "Dev server"
				<body>
					<script src="/dist/index.js">
			res.writeHead(200)
			return res.end(String(out))

		if req.url == '/__hmr__'
			console.log 'setup serversent events'
			out.headers['Content-Type'] = 'text/event-stream'
			out.headers['Connection'] = 'keep-alive'
			out.headers['Cache-Control'] = 'no-cache'
			res.writeHead(200, out.headers)
			res.write("HELLO")
			clients.add(res)
			req.on('close') do
				console.log 'closed req'
				clients.delete(res)
			return

		unless url == '/'
			req.url = '/'
			return handle(req,res)
		yes