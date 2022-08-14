import np from 'path'
import * as ts from 'typescript/lib/tsserverlibrary'
import imba-plugin from '../typescript-imba-plugin/index'


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
		console.log str
	
	def getLogFileName
		undefined

const defaults = {
	host: ts.sys
	logger: new Logger
	globalPlugins: ['typescript-imba-plugin']
	LanguageServiceMode: ts.LanguageServiceMode.Semantic
	useSingleInferredProject: true
}

let old = ts.sys.require
ts.sys.require = do(initialPath\string, moduleName\string)
	if moduleName == 'typescript-imba-plugin'
		return {module: imba-plugin}
	old.apply(ts.sys,arguments)

export const TypeObject = ts.objectAllocator.getTypeConstructor!

export default class Service

	def constructor cwd\string,options = {}
		self.cwd = cwd
		self.options = options # Object.assign({},defaults,options)
		global.IMBASERVER_CWD = cwd
		global.LOADED_PROJECT = loaded.bind(self)
		self.ps = new ts.server.ProjectService(defaults)
		self.ready = new Promise do #ready = $1
		self.startTime = Date.now!
		console.log 'start with project',cwd
		open('index.imba')

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

		