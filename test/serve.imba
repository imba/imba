const http = require('http')
const path = require('path')
const fs = require('fs')
const port = 3000
const compiler = require('../dist/compiler.js')

# import path
# import fs
# import http

def requestHandler request, res
	console.log(request.url)
	let rel = __dirname + request.url
	let imbasrc = rel.replace(/(\.js|$)/,'.imba')

	if rel.match(/\.js/) and fs.existsSync(imbasrc) and request.url.indexOf('/',1) >= 0
		let source = fs.readFileSync(imbasrc,'utf8')
		let result = compiler.compile(source,{
			sourcePath: imbasrc,
			platform: 'browser'
		})

		res.setHeader("Content-Type", 'application/javascript')
		res.writeHead(200)
		return res.end(result.js)

	elif fs.existsSync(rel)
		res.end(fs.readFileSync(rel,'utf8'))
	else
		# path.relative(__dirname,request.url)
		res.end("Hello Node.js Server! {rel}")

const server = http.createServer(requestHandler)

server.listen(port) do |err|
	if err
		return console.log('something bad happened', err)
	console.log("server is listening on {port}")