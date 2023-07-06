import {setupVite} from 'imba/plugin'
import express from "express"
import compression from "compression"
import serveStatic from "serve-static"
import App from './src/App.imba'
import entry from './src/App.imba?url&entry'

let port = 3000
const args = process.argv.slice(2)
const portArgPos = args.indexOf("--port") + 1
if portArgPos > 0
	port = parseInt(args[portArgPos], 10)

def createServer()
	const app = express()
	const options = 
		mode: import.meta.env.MODE

	await setupVite app, options, do(dist)
		app.use compression()
		L dist
		app.use serveStatic(dist, index: false)

	app.use "/", do(req, res)
		let html = <html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title> "Imba App {__APP_VERSION__}"
				<script type="module" src=entry>
			<body>
				<h1> "Imba App {__APP_VERSION__}"
				<#root>
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


