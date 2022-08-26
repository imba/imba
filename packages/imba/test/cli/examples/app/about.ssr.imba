import http from 'http'

global css @root $ssr:1

const server = http.createServer do(req,res)
	res.writeHead(200,{'Content-Type': 'text/html'})

	let html = <html>
		<head>
			<style src="*">
		<body>
			<script type="module" src="./about">

	res.end(String(html))

imba.serve server.listen(Number(process.env.PORT or 3009))
console.log "OK"