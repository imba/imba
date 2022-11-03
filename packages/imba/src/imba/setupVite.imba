# imba$stdlib=1
import np from 'path'
import * as Vite from "vite"
import url from 'node:url'
import nfs from 'node:fs'
import getport from 'get-port'
import { __served__ } from './utils'
import {resolveWithFallbacks, viteClientConfigFile} from '../utils/vite'

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
	let serverOptions = options.serverOptions or { server: { hmr: {port} } }
	let configFile = resolveWithFallbacks(viteClientConfigFile, ["ts", "js", "mjs", "cjs"])
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
	global.__vite__ = yes
	const dist = np.join(vite.config.root, vite.config.build.outDir)
	if prod?
		global.__vite_manifest__ = JSON.parse nfs.readFileSync("{dist}/manifest.json", 'utf-8')
		cb(dist) if cb
	else
		srv.use do(req, res, next)
			__served__.add req.url
			next()
		srv.use vite.middlewares
		srv.use do(req, res, next)
			__served__.delete req.url
			next()
	return dist
