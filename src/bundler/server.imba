const http = require 'http'
const fs = require 'fs'
const path = require 'path'

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

export class Response

export class Server

	def constructor bundler
		bundler = bundler
		options = bundler.config.serve or {}
		clients = new Set

	get port
		options.port or 9003

	get contentBase
		options.contentBase or bundler.cwd

	get manifest
		bundler.manifest

	def start
		#server = http.createServer(handle.bind(self))
		#server.listen(port)
		self

	def broadcast event, msg
		for client of clients
			client.write("event: {event}\n")
			client.write("id: imba\n")
			client.write("data: {JSON.stringify(msg)}\n\n\n")
		self

	def updated writes
		let urls = writes.map(do $1.url).filter(do $1)
		broadcast('invalidate',urls)

	def handle req, res
		let url = new URL(req.url,'http://localhost')
		let dir = url.pathname
		let abs = path.resolve(contentBase,req.url.slice(1) or 'index.html')
		let ext = (path.extname(dir) or '').slice(1)

		let out = {
			status: 200
			headers: {}
			body: null
			type: ext or 'html'
		}

		# console.log 'handle this!!!!',url,abs
		# wait for bundler if it has unfinished business

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
					<script src="/dist/index.js">
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