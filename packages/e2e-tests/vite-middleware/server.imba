import path from "path"
import express from "express"
import compression from "compression"
import serveStatic from "serve-static"
import App from './src/App.imba'
import Home from './src/Home.imba'
import np from 'node:path'
import url from 'node:url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
let port = 3000
const args = process.argv.slice(2)
const portArgPos = args.indexOf("--port") + 1
if portArgPos > 0
	port = parseInt(args[portArgPos], 10)

def createServer(root = process.cwd())
	const resolve = do(p) path.resolve(root, p)
	const app = express()
	await imba.setupVite app, import.meta.env.MODE, do(dist)
		app.use compression()
		app.use serveStatic(dist, index: false)
	app.use "/home", do(req, res)
		console.log "served", imba.__served__
		unless req.accepts(['image/*', 'html']) == 'html'
			return res.sendStatus(404)
		let html = <html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title> "Imba App"
				<style src="*">
				# <script type="module" src="src/main.js">
				<script type="module" src="src/Home.imba">
			<body>
				<Home>
		res.status(200).set("Content-Type": "text/html").end String html
	app.use "/", do(req, res)
		unless req.accepts(['image/*', 'html']) == 'html'
			return res.sendStatus(404)
		let html = <html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title> "Imba App"
				<style src="*">
				# <script type="module" src="src/main.js">
				<script type="module" src="src/App.imba">
			<body>
				<App>
		res.status(200).set("Content-Type": "text/html").end String html
	app

const app = await createServer!
console.log "server created now"
const server = app.listen port, do console.log "http://localhost:{port}"
const exitProcess = do
	console.log "exiting process"
	process.off "SIGTERM", exitProcess
	process.off "SIGINT", exitProcess
	process.stdin.off "end", exitProcess
	try await server.close do console.log "server closed" finally process.exit 0

process.once "SIGTERM", exitProcess
process.once "SIGINT", exitProcess
process.stdin.on "end", exitProcess

