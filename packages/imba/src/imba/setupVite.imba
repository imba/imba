# imba$stdlib=1
import np from 'path'
import * as Vite from "vite"
import url from 'node:url'
import nfs from 'node:fs'
import getport from 'get-port'
import { __served__ } from './utils'
import {resolveWithFallbacks, viteClientConfigFile} from '../utils/vite'
let vite

export def setupVite(srv, options, cb)
	global.__vite__ = yes
	if typeof options == 'string'
		options = {mode: options}
	elif typeof options == 'function'
		options = {mode: "development"}
	const prod? = options.mode == "production" or options.prod == yes
	unless vite
		const port = await getport(port: getport.makeRange(24000, 26000))
		let serverOptions = options.serverOptions or { server: { hmr: {port} } }
		let configFile = resolveWithFallbacks(viteClientConfigFile, ["ts", "js", "mjs", "cjs"])

		const vite-options = {
			appType: "custom"
			configFile: configFile
			...serverOptions,
			server: {
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
