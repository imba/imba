import fs from 'fs'
import path from 'path'
import http from 'http'

const server = http.createServer do(req,res)
	let html = String <html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title> 'Project'
			<style src='*'>
		<body>
			<script type="module" src='__ENTRYPOINT__'>

	res.end(html)

imba.serve server.listen(process.env.PORT || 3000)