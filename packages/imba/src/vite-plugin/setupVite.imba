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

	let clientDist = np.join(vite.config.root, options.outDir or 'dist', 'public')

	if prod?
		vite.close().then do vite = null
		global.__vite_manifest__ ||= JSON.parse nfs.readFileSync(np.join(clientDist, 'manifest.json'), 'utf-8')
		global.IMBA_PUBDIR = clientDist
		cb(clientDist) if cb
		return clientDist
	else
		srv.use do(req, res, next)
			__served__.add req.url
			next()
		srv.use vite.middlewares
		srv.use do(req, res, next)
			__served__.delete req.url
			next()
	return clientDist
