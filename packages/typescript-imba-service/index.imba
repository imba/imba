import np from 'path'
import * as ts from 'typescript/lib/tsserverlibrary'
import imba-plugin from '../typescript-imba-plugin/index'
# import imba-plugin from '../typescript-imba-plugin/dist/index.js'

global.IMBA_TYPINGS = require.resolve('typescript-imba-plugin/typings/imba.d.ts')

class Logger
	def close
		yes
		
	def hasLevel lebel
		yes
		
	def loggingEnabled
		yes
		
	def perftrc
		yes
		
	def info str
		return
		console.log str
	
	def startGroup
		console.group()
	
	def endGroup
		console.groupEnd()
		
	def msg str, type = null
		# return
		return
		console.log str
	
	def getLogFileName
		undefined

# imba-plugin(typescript: ts)

const defaults = {
	host: ts.sys
	logger: new Logger
	globalPlugins: ['typescript-imba-plugin']
	LanguageServiceMode: ts.LanguageServiceMode.Semantic
	useSingleInferredProject: false
}

let old = ts.sys.require
ts.sys.require = do(initialPath\string, moduleName\string)
	if moduleName == 'typescript-imba-plugin'
		return {module: imba-plugin}
	old.apply(ts.sys,arguments)

export const TypeObject = ts.objectAllocator.getTypeConstructor!

export default class Service

	def constructor cwd\string,options = {open: 'main.imba'}

		self.cwd = cwd
		self.options = options # Object.assign({},defaults,options)
		global.IMBASERVER_CWD = cwd
		global.LOADED_PROJECT = loaded.bind(self)
		self.startTime = Date.now!
		self.ps = new ts.server.ProjectService(defaults)
		self.ready = new Promise do #ready = $1
		
		console.log 'start with project',cwd
		if options.open
			open(options.open)

	def summarize
		await self.ready
		let errors = global.ils.getDiagnostics!
		let locals = errors.filter do
			let rel = np.relative(self.cwd,$1.file..fileName)
			return rel.indexOf('node_modules') == -1

		locals.map do
			console.log $1.code,$1.messageText,$1.category,$1.file..fileName
		# console.log x.cp.rootFiles
		# for f in global.ils.cp.rootFiles
		#	console.log f.fileName
		console.log "found {locals.length} errors ({errors.length} including dependencies)"

	get ils
		global.ils

	get lsp
		ils.info.ls

	get cp do ils.cp
	get ip do ils.ip

	def logprops src, path
		let f = file(src)
		let c = f.getTypeChecker!
		console.log c.ownprops(path).map do $1.escapedName
		return c

	def abs src
		np.resolve(cwd,src)

	def loaded
		#ready(self)

	def open src
		ps.openClientFile(abs(src))

	def file src
		global.ils.getImbaScript(abs(src))

	def script src
		global.ils.getScriptInfo(abs(src))

if process.env.IMBA_LS_INIT
	let cwd = process.env.PWD
	let service = global.service = new Service(cwd,open: process.env.IMBA_LS_INIT)
	global.service.summarize!.then do 
		console.log 'done in',Date.now! - service.startTime