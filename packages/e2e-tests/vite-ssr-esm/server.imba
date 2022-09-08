import fs from "fs"
import path, {dirname} from "path"
import {pathToFileURL} from "url"
import express from "express"
import compression from "compression"
import serveStatic from "serve-static"
import App from "./src/main.imba"
import * as Vite from "vite"

let port = 3000
const args = process.argv.slice(2)
const portArgPos = args.indexOf("--port") + 1
if portArgPos > 0
	port = parseInt(args[portArgPos], 10)

def createServer(root = process.cwd(), isProd = process.env.NODE_ENV === "production")
	const resolve = do(p) path.resolve(root, p)

	const client_dist = path.join(import.meta.url, '../..', 'dist')

	let ssr-manifest\Object
	let manifest\Object
	if isProd
		ssr-manifest = (await import("./dist/manifest.json")).default
		manifest = (await import("./dist/manifest.json")).default

	const app = express()
	let vite
	if !isProd
		vite = await Vite.createServer
			root: root
			appType: "custom"
			configFile: "vite.config.client.js"
			server:
				middlewareMode: true
				port: port
				strictPort: true
				hmr:
					port: port + 25000
		app.use vite.middlewares
	else
		const inlineCfg = 
			root: root
			appType: "custom"
			server:
				middlewareMode: true
		# maybe use a different config
		vite = await Vite.createServer()
		app.use compression()
		app.use serveStatic(resolve("dist"), index: false)
	app.use "*", do(req, res)
		const url = req.originalUrl
		try
			let html = String <html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title> "Imba App"
					# <style src="*">
				<body>
					if !isProd
						<script type="module" src="/@vite/client">
						<script type="module" src="/entry-client.js">
					else
						const prod-src = manifest["src/main.imba"].file
						const css-files = manifest["src/main.imba"].css
						<script type="module" src=prod-src>
						for css-file in css-files
							<style src=css-file>
					<App>
			res.status(200).set("Content-Type": "text/html").end html
		catch e
			vite and vite.ssrFixStacktrace(e)
			console.log e.stack
			res.status(500).end e.stack
	return
		app: app
		vite: vite

createServer().then do({app})
	console.log "server created"
	const server = app.listen port, do console.log "http://localhost:{port}"
	const exitProcess = do
		process.off "SIGTERM", exitProcess
		process.off "SIGINT", exitProcess
		process.stdin.off "end", exitProcess
		try await server.close do console.log "server closed" finally process.exit 0

	process.once "SIGTERM", exitProcess
	process.once "SIGINT", exitProcess
	process.stdin.on "end", exitProcess

