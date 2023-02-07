import np from 'path'
import * as Vite from 'vite'
import url from 'node:url'
import nfs from 'node:fs'
import getport from 'get-port'
import { __served__ } from '../imba/utils'
import {getConfigFilePath} from '../utils/vite'
let vite

export def setupVite(srv, options, cb)
	global.__vite__ = yes
	if typeof options == 'string'
		options = {mode: options}
	elif typeof options == 'function'
		options = {mode: "development"}
	const prod? = options.mode == "production" or options.prod == yes
	const mode = prod? ? "production" : "development"

	unless vite
		const port = await getport(port: getport.makeRange(24000, 26000))

		const serverConfig = await getConfigFilePath("server", {command: "server", mode})

		let serverOptions = options.serverOptions or { server: { hmr: {port} } }

		let clientConfig = await getConfigFilePath "client", {mode}

		const vite-options = {
			...clientConfig
			...serverOptions,
			appType: "custom"
			server: {
				...serverConfig.server,
				...serverOptions.server,
				middlewareMode: true
			}
		}

		vite = await Vite.createServer vite-options

	const dist = np.join(vite.config.root, vite.config.build.outDir)
	if prod?
		vite.close().then do vite = null
		global.__vite_manifest__ ||= JSON.parse nfs.readFileSync("{dist}/manifest.json", 'utf-8')
		cb(dist) if cb
		return dist
	else
		srv.use do(req, res, next)
			__served__.add req.url
			next()
		srv.use vite.middlewares
		srv.use do(req, res, next)
			__served__.delete req.url
			next()
	return dist
