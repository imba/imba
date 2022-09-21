import http from 'http'
import {App} from './routed'

global css @root $ssr:1
console.log "global dom",!!global.#dom
const server = http.createServer do(req,res)
	res.writeHead(200,{'Content-Type': 'text/html'})

	let html = <html>
		<head>
			<style src="*">
		<body>
			<App>
			# <script type="module" src="./about">

	res.end(String(html))

imba.serve server.listen(Number(process.env.PORT or 3009))
console.log "OK"