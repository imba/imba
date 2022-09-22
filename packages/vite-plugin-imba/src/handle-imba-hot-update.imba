import {ModuleNode,HmrContext} from "vite"
import {Code,CompileData} from "./utils/compile"
import {log,logCompilerWarnings} from "./utils/log"
import {ImbaRequest} from "./utils/id"
import {VitePluginImbaCache} from "./utils/vite-plugin-imba-cache"
import {ResolvedOptions} from "./utils/options"
import * as Diff from 'diff'

export def handleImbaHotUpdate(compileImba, ctx\HmrContext, imbaRequest\ImbaRequest, cache\VitePluginImbaCache, options\ResolvedOptions)
	if !cache.has(imbaRequest)
		# file hasn't been requested yet (e.g. async component)
		log.debug "handleHotUpdate called before initial transform for {imbaRequest.id}"
		return
	const {read: read, server: server} = ctx
	const cachedJS = cache.getJS(imbaRequest)
	const cachedCss = cache.getCSS(imbaRequest)
	const content = await read()
	let compileData\CompileData
	try
		options.compilerOptions.sourcemap = no
		compileData = await compileImba(imbaRequest, content, options)
		cache.update compileData
	catch e
		cache.setError imbaRequest, e
		throw e
	const affectedModules = new Set
	const cssModule = server.moduleGraph.getModuleById(imbaRequest.cssId)
	const mainModule = server.moduleGraph.getModuleById(imbaRequest.id)
	const cssUpdated = cssModule and cssChanged(cachedCss, compileData.compiled.css)
	if cssUpdated
		log.debug "handleHotUpdate css changed for {imbaRequest.cssId}"
		affectedModules.add cssModule
	const jsUpdated = mainModule and jsChanged(cachedJS, compileData.compiled.js, imbaRequest.filename)
	if jsUpdated
		# transform won't be called, log warnings here
		log.debug "handleHotUpdate js changed for {imbaRequest.id}"
		affectedModules.add mainModule
	if !jsUpdated
		logCompilerWarnings imbaRequest, compileData.compiled.warnings, options
	const result = [...affectedModules].filter(Boolean)
	# TODO is this enough? see also: https://github.com/vitejs/vite/issues/2274
	const ssrModulesToInvalidate = result.filter(do(m) !!m.ssrTransformResult)
	if ssrModulesToInvalidate.length > 0
		log.debug "invalidating modules {ssrModulesToInvalidate.map(do $1.id).join(', ')}"
		ssrModulesToInvalidate.forEach do(moduleNode) server.moduleGraph.invalidateModule(moduleNode)
	if result.length > 0
		log.debug "handleHotUpdate for {imbaRequest.id} result: {result.map(do $1.id).join(', ')}"
	return result

def isCodeEqual(prev, next)
	if !prev and !next
		return true
	if !prev and next or prev and !next
		return false
	prev === next
def cssChanged(prev, next)
	return !isCodeEqual(prev..code, next..code)

def jsChanged(prev, next, filename)
	let prevJs\string = prev..code
	return yes if !prevJs
	const i = prevJs.indexOf("\n/*__css_import__*/")
	prevJs = prevJs
		.replace(/^\/\/#\ssourceMapp(.*)$/mg, "")
		.replace('\n\n/*__css_import__*/', '/*__css_import__*/')
	const nextJs = next..code
	const diff = Diff.diffChars(prevJs, nextJs)
	const addedOrRemoved = []
	diff.forEach do(part)
		const color = part.added ? "\x1b[32m" : part.removed ? "\x1b[31m" : "\x1b[33m"
		const what = part.added ? "part.added" : part.removed ? "part.removed" : "no change"
		addedOrRemoved.push {color, what, value:part.value} if part.added or part.removed
	# debug HMR
	# addedOrRemoved.forEach do
	# 	console.log("\x1b[36m", $1.what) 
	# 	console.log ($1.color, $1.value.replace(/\n/g, "") ? "newlines": $1.value)
	if addedOrRemoved.find(do $1.value.replace(/\n/g, "") !== "")
		# console.log "added or removed", addedOrRemoved
		return yes
	else
		return no

###
 # remove code that only changes metadata and does not require a js update for the component to keep working
 #
 # 1) add_location() calls. These add location metadata to elements, only used by some dev tools
 # 2) ... maybe more (or less) in the future
 # @param code
###
# def normalizeJsCode(code)
# 	if !code
# 		return code
# 	code.replace(/\s*\badd_location\s*\([^)]*\)\s*;?/g, "")
