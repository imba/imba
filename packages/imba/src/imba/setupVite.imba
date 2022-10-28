# imba$stdlib=1
import np from 'path'
import * as Vite from "vite"
import url from 'node:url'
import nfs from 'node:fs'
import getport from 'get-port'
import { __served__ } from './utils'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export def resolveWithFallbacks(ours, fallbacks, opts = {})
	const {ext} = opts
	let pkg = ours
	pkg += ".{ext}" if ext..length
	fallbacks = [fallbacks] unless Array.isArray fallbacks
	for fallback in fallbacks
		fallback = "{ours}.{fallback}" if ext
		# const userPkg = np.resolve(fallback)
		if nfs.existsSync fallback
			return fallback
	pkg

# def default-cb
# 	console.error "You need to provide a callback to serve assets in production"
# 	console.log "If you're using express, you can use the following"
# 	console.log '''
# 		import compression from "compression"
# 		import np from "node:path"
# 		import serveStatic from "serve-static"
# 		imba.setupVite(server, {}) do({dist})
# 			app.use compression()
# 			app.use serveStatic(np.resolve(dist), index: false)
# 	'''
# 	throw new Error "missing required callback for imba.setupVite"
export def setupVite(srv, options, cb)
	if typeof options == 'string'
		options = {mode: options}
	elif typeof options == 'function'
		options = {mode: "development"}
	const prod? = options.mode == "production" or options.prod == yes
	const port = await getport(port: getport.makeRange(24000, 26000))
	let {serverOptions = {server: {hmr: {port}}}, } = options
	# let {configFile = np.join(root, "vite.config.js")} = options
	const original-config-file = np.join(__dirname, '..', 'bin', "./vite.config.mjs")
	# pick test setup file path
	let configFile = resolveWithFallbacks("vite.config", ["ts", "js", "mjs", "cjs"], {ext:"js"})
	if configFile == "vite.config.js"
		configFile = np.resolve original-config-file
	let manifest\Object

	const vite-options = {
		appType: "custom"
		configFile: configFile
		...serverOptions,
		server: {
			...serverOptions.server,
			middlewareMode: true
		}
	}
	let vite = await Vite.createServer vite-options

	# root: root
	# appType: "custom"
	# configFile: configFile
	# # base: 'https://dev.scrimba.com'
	# server:
	# 	middlewareMode: true
	# 	https: https

	if prod?
		const dist = vite.config.build.outDir
		# manifest = nfs.readFileSync("./{dist}/manifest.json", 'utf-8')
		cb(dist) if cb
	else
		srv.use do(req, res, next)
			__served__.add req.url
			next()
		srv.use vite.middlewares
		srv.use do(req, res, next)
			__served__.delete req.url
			next()
