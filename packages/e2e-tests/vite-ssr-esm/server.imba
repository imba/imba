import fs from "fs"
import path, {dirname, basename} from "path"
import {pathToFileURL} from "url"
import express from "express"
import compression from "compression"
import serveStatic from "serve-static"
import App from './src/App.imba'
import * as Vite from "vite"
# import moduleGraph from "./server.moduleGraph.json"

# We need to load SSR styles manually in order to prevent FOUC
# We leverage vite-node to create a module graph from the server entry point
# And we load all the tags CSS in separate files and concatenate them  here
# We didn't put them in one big css file because Vite transforms them to be
# imported as ESModules so their string contain some js specific stuff
# like \n ... Instead we keep them to avoid breaking anything and import them
# as they should be
const ssr-css-modules = import.meta.glob("./.ssr/*.css.js")
let ssr-styles = ""
for own key of ssr-css-modules
	ssr-styles += (await ssr-css-modules[key]()).default
let port = 3000
const args = process.argv.slice(2)
const portArgPos = args.indexOf("--port") + 1
if portArgPos > 0
	port = parseInt(args[portArgPos], 10)

const CLIENT_ENTRY = "src/main.js"
# The server entry is used in the launch.imba file
# not used here
const SERVER_ENTRY = "src/App.imba"

def createServer(root = process.cwd(), isProd = import.meta.env.MODE === "production")
	const resolve = do(p) path.resolve(root, p)

	const client_dist = path.join(import.meta.url, '../..', 'dist')

	let manifest\Object
	if isProd
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
					if !isProd
						<script type="module" src="/@vite/client">
						<script type="module" src="/{CLIENT_ENTRY}">
						<style id="dev_ssr_css" innerHTML=ssr-styles>
					else
						const prod-src = manifest[CLIENT_ENTRY].file
						const css-files = manifest[CLIENT_ENTRY].css
						<script type="module" src=prod-src>
						for css-file in css-files
							<style src=css-file>
				<body>
					<App>
			res.status(200).set("Content-Type": "text/html").end html
		catch e
			vite and vite.ssrFixStacktrace(e)
			console.log "err", e.stack
			res.status(500).end e.stack
	return
		app: app
		vite: vite

const {app} = await createServer!
console.log "server created"
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

