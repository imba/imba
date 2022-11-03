import path from "path"
import express from "express"
import compression from "compression"
import serveStatic from "serve-static"
import App from './src/App.imba'
import * as Vite from "vite"
import np from 'node:path'
import url from 'node:url'

# import moduleGraph from "./server.moduleGraph.json"
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
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

def createServer(root = process.cwd(), isDev = import.meta.env.MODE === "development")
	const resolve = do(p) path.resolve(root, p)

	let manifest\Object
	if !isDev
		manifest = (await import("./dist_client/manifest.json")).default
	const app = express()
	const configFile = np.join(__dirname, "vite.config.mjs")
	let vite
	if isDev
		vite = await Vite.createServer
			root: root
			appType: "custom"
			configFile: configFile
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
		app.use compression()
		app.use serveStatic("dist_client", index: false)
	app.use "*", do(req, res)
		const url = req.originalUrl
		try
			let html = String <html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title> "Imba App"
					if isDev
						<script type="module" src="/@vite/client">
						<script type="module" src="/src/main.js">
						<style id="dev_ssr_css" innerHTML=ssr-styles>
					else
						const prod-src = manifest["src/main.js"].file
						const css-files = manifest["src/main.js"].css
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
