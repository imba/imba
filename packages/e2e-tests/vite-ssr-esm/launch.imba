import {createServer} from "vite"
import {ViteNodeServer} from "vite-node/server"
import {ViteNodeRunner} from "vite-node/client"
import {builtinModules} from 'module'

let port = 3000
const args = process.argv.slice(2)
const portArgPos = args.indexOf("--port") + 1

const server = await createServer
	# It's recommended to disable deps optimization
	configFile: "vite.config.server.js"
	optimizeDeps:
		disabled: yes
	server:
		port: port
		watch:
			# // During tests we edit the files too fast and sometimes chokidar
			# // misses change events, so enforce polling for consistency
			usePolling: yes
			interval: 100

const builtins = new RegExp(builtinModules.join("|"), 'gi');
# this is need to initialize the plugins
await server.pluginContainer.buildStart({})

const node = new ViteNodeServer server,
	ssr: yes
	transformMode:
		ssr: [builtins]
	# deps:
	# 	external: builtinModules

# when having the server and runner in a different context,
# you will need to handle the communication between them
# and pass to this function
const runner = new ViteNodeRunner(
	root: [server.config.root]
	base: [server.config.base]
	debug: yes
	fetchModule: do(id)
		id = id.replace("dist/imba.mjs", "dist/imba.node.mjs") if id.endsWith "dist/imba.mjs"
		node.fetchModule(id)
	resolveId: do(id, importer)
		node.resolveId id, importer
)

# console.log "executing vite env"
# await runner.executeId('/@vite/env')
console.log "executing server.imba"
# await runner.executeFile("./server.js")
# await runner.executeFile("./server.imba")
await runner.executeId("server.imba")
await server.close()
