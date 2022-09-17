import {createServer} from "vite"
import {ViteNodeServer} from "vite-node/server"
import {ViteNodeRunner} from "vite-node/client"
import {builtinModules} from 'module'
import consola from "consola"
import colors from 'picocolors'
const splitRE = /\r?\n/

def pad(source, n = 2)
	const lines = source.split(splitRE)
	return lines.map(do(l) " ".repeat(n) + l).join("\n")

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
const runner = new ViteNodeRunner
	root: [server.config.root]
	base: [server.config.base]
	debug: yes
	fetchModule: do(id)
		id = id.replace("dist/imba.mjs", "dist/imba.node.mjs") if id.endsWith "dist/imba.mjs"
		node.fetchModule(id)
			
	resolveId: do(id, importer)
		node.resolveId(id, importer)

def cleanStack(stack)
	return stack.split(/\n/g).filter(do(l) /^\s*at/.test(l)).join("\n")

def error-handler(errorData)
	consola.error await buildErrorMessage errorData


# console.log "executing vite env"
# await runner.executeFile("./server.js")
# await runner.executeFile("./server.imba")
def buildErrorMessage(err, args = [], includeStack = true)
	if err.message
		args.push "{colors.red(err.message)}"
	if err.plugin
		args.push "  Plugin: {colors.magenta(err.plugin)}"
	elif err.id
		args.push "  File: {colors.cyan(err.id)}"
	if err.frame
		args.push colors.yellow(pad(err.frame))
	if includeStack and err.stack
		args.push pad(cleanStack(err.stack))
	args.join "\n"

await runner.executeId('/@vite/env')
await runner.executeId("server.imba").catch error-handler

await server.close()
