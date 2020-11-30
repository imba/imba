const http = require 'http'

export class Server

	def constructor bundler
		bundler = bundler

	get port
		9003

	get manifest
		bundler.manifest

	def start
		console.log 'starting server'
		#server = http.createServer(handle.bind(self))
		#server.listen(port)

	def handle req, res
		console.log 'handle this!!!!',req.url
		let url = req.url
		# wait for bundler if it has unfinished business

		if let src = manifest.urls[req.url]
			# console.log 'found manifest?',src
			let asset = manifest.files[src]
			if asset.#file
				let body = Buffer.from(asset.#file.contents or asset.#file.text)
				res.writeHead(200)
				return res.end(body)

		if url == '/' or url == '/index.html'
			console.log 'serving index!'
			let out = <html>
				<head>
					<title> "Dev server"
				<body>
					<script src="/dist/index.js">
			res.writeHead(200)
			return res.end(String(out))

		yes