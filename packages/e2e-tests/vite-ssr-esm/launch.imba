import {builtinModules} from 'node:module'
import fs from 'node:fs'
import {createServer} from "vite"
import {ViteNodeServer} from "vite-node/server"
import {ViteNodeRunner} from "vite-node/client"
import consola from "consola"
import colors from 'picocolors'
const splitRE = /\r?\n/

def pad(source, n = 2)
	const lines = source.split(splitRE)
	return lines.map(do(l) " ".repeat(n) + l).join("\n")

let port = 3013
const args = process.argv.slice(2)
const portArgPos = args.indexOf("--port") + 1

const server = await createServer
	# It's recommended to disable deps optimization
	configFile: "vite.config.server.js"
	optimizeDeps:
		disabled: yes
	server:
		port: port

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
await runner.executeFile("src/App.imba").catch error-handler
const urls = []
const ids = []
const moduleMap = {}
for [id, mod] of server.moduleGraph.idToModuleMap
	const url = mod.url
	urls.push url
	ids.push id
	moduleMap[url] = 
		file: mod.file
		id: mod.id
		url: url
		type: mod.type
		importedModules: Array.from(mod.importedModules.keys()).map(do $1.id)
		importers: Array.from(mod.importers.keys()).map(do $1.id)
		code: (url.endsWith('.css') ? mod.ssrTransformResult.code : "")
# const serialized = {urls, moduleMap, ids}
# fs.writeFileSync("server.moduleGraph.json", JSON.stringify(serialized, null, 2), 'utf-8')

const DEV_CSS_PATH = "./.ssr"
fs.mkdirSync(DEV_CSS_PATH) unless fs.existsSync(DEV_CSS_PATH)
for own id, mod of moduleMap when mod.code
	fs.writeFileSync("{DEV_CSS_PATH}/{id.split("?")[0].split("/")[-1]}.css.js", mod.code.replace("__vite_ssr_exports__.default =", "export default "), 'utf-8')

# const req = await runner.directRequest("/Users/abdellah/workspace/scrimba/imba/packages/e2e-tests/vite-ssr-esm/server.imba")
# console.log "rr", req

await runner.executeFile("server.imba").catch error-handler
await server.close()


# def getCssFiles(url\string, seen, files, root = process.cwd())
# 	const resolve = do(p) path.resolve(root, p)
# 	files ||= new Set
# 	seen ||= new Set
# 	for file in moduleGraph.moduleMap[url]..importedModules
# 		const rel = "/{path.relative(root, file)}"
# 		if rel.includes("type=style")
# 			files.add rel 
# 		elif const mod = moduleGraph.moduleMap[rel]
# 			getCssFiles(mod.url, seen, files)
# 		seen.add rel if !seen.has(rel)
# 	Array.from files