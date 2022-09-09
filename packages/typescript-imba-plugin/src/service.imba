import ImbaScriptDts from './dts'
import np from 'path'
import Compiler from './compiler'
import * as util from './util'
import Bridge from './bridge'
import ipc from 'node-ipc'
import {EventEmitter} from 'events'
import {DefaultConfig} from './constants'

let libDir = np.resolve(__realname,'..','..','lib')

global.dirPaths = [__dirname,__filename,__realname]
global.libDir = libDir
global.utils = util

global.ils\Service = null

export default class Service < EventEmitter
	setups = []
	bridge = null
	virtualFiles = {}
	virtualScripts = {}
	imbaGlobals = {}
	ipcid
	counter = 0
	
	get ts
		global.ts
	
	get configuredProjects
		ps ? Array.from(ps.configuredProjects.values()) : []
		
	get cp
		configuredProjects[0]
		
	get ip
		ps.inferredProjects[0]
	
	get ls
		cp.languageService
		
	get isSemantic
		ps.serverMode == 0
		
	def constructor ...params
		super(...params)

	def i i
		let d = m.im.doc
		let t = m.im.getTypeChecker!
		return {
			i: i
			d: d
			t: t
			c: d.getContextAtOffset(i)
			x: t.getMappedLocation(i)
		}
		
	def getCompletions file,pos,ctx
		let script = getImbaScript(file)
		# util.log('getCompletions',file,pos,ctx,script)
		let res = #lastCompletions = script.getCompletions(pos,ctx)
		return res.serialize!
		
	def setConfiguration opts
		util.log('setConfiguration',opts)
		config = opts
	
	def getConfig key, default = null
		let cfg = config or {}
		let path = key.split('.')
		try
			let val
			while path.length
				let key = path.shift!
				val = cfg[key]
				cfg = val or {}
			if val == undefined
				val = default
			return val
		return null
		
	def onDidChangeTextEditorSelection file,opts = {}
		#lastSelection = [file,opts]
		# util.log('onDidChangeTextEditorSelection',file,opts)
		return null

	get f
		getImbaScript(#lastSelection[0])
		
	def onDidSaveTextDocument file
		util.log('onDidSaveTextDocument',file)
		if let script = getImbaScript(file)
			script.didSave!
		return
			
	def resolveCompletionItem item, data
		util.log('resolveCompletionItem',item,data)
		if let ctx = #lastCompletions
			if let item = ctx.items[data.nr]
				item.resolve!
				return item.serialize!
		return 
		
	def getExternalFiles proj
		let paths = Object.keys(virtualScripts)
		util.log('got external files?!',paths)
		return paths
		
	def handleRequest {id,data}
		# util.log('handleRequest',data)
		bridge ||= new Bridge(id)
		bridge.handle(data)

	def createVirtualProjectConfig
		return false if cp or !ip or !ip.shouldSupportImba!
		let jspath = resolvePath('jsconfig.json')
		let tspath = resolvePath('tsconfig.json')
		return false if ps.host.fileExists(jspath) or virtualFiles[jspath] or ps.host.fileExists(tspath)
		util.log('createVirtualProjectFile')
		
		# notify about configuring their own tspath

		virtualFiles[jspath] = JSON.stringify(DefaultConfig,null,2)
		ps.onConfigFileChanged(jspath,0)
		self

	def reloadConfigFile
		let path = cp.getCompilerOptions!.configFilePath
		ps.onConfigFileChanged(resolvePath(path),1)

	def setVirtualFile path, body
		virtualFiles[path] = body
		# (fileName: NormalizedPath, openedByClient: boolean, fileContent?: string, scriptKind?: ScriptKind, hasMixedContent?: boolean, hostToQueryFileExistsOn?: {
		#    fileExists(path: string): boolean;
		# })
		# could we rather fake its existence?
		let script = ps.getOrCreateScriptInfoForNormalizedPath(path,true,body,ts.ScriptKind.TS,false)
		virtualScripts[path] = script
		return script

		
	def resolveImbaDirForProject proj
		let imbadir = ts.resolveImportPath('imba',proj.getConfigFilePath!,proj)
		if imbadir and imbadir.resolvedModule
			# console.warn "RESOLVED",imbadir.resolvedModule
			return np.dirname(imbadir.resolvedModule.resolvedFileName)
		return null

	def imbaForPath path
		let cache = #imbaDirCache ||= {}
		let dir = np.dirname(path)
		let norm = np.resolve(dir,'_.imba')

		if cache[dir]
			return cache[dir]

		let out = ts.resolveModuleName('imba',norm,{moduleResolution: 2},ps.host)
		
		if out and out.resolvedModule
			let imbadir = np.dirname(out.resolvedModule.resolvedFileName)
			let pkg = np.resolve(imbadir,'package.json')
			# read the json file
			let obj = {
				path: imbadir
				package: JSON.parse(ps.host.readFile(pkg))
			}

			return cache[dir] = obj
		return null

	def getImbaCompilerForPath path
		let IMBA = imbaForPath(path)

		if IMBA and getConfig('useImbaFromProject')
			return null if IMBA.#errored
			let src = np.resolve(IMBA.path,IMBA.package.exports['./compiler'])
			try
				return IMBA.#compiler ||= require(src)
			catch e
				IMBA.#errored = yes
				return null
		return null


	def prepareProjectForImba proj
		let inferred = proj isa ts.server.InferredProject
		let opts = proj.getCompilerOptions!
		let libs = opts.lib or ["esnext","dom","dom.iterable"]
		let imbalib = null
		let imbadir = !inferred && resolveImbaDirForProject(proj)

		if imbadir
			let src = np.resolve(imbadir,'typings','imba.d.ts')
			if ps.host.fileExists(src)
				imbalib = src
			proj.#imbadir = imbadir

		if global.IMBA_TYPINGS_DIR
			imbalib ||= np.resolve(global.IMBA_TYPINGS_DIR,'imba.d.ts')

		imbalib ||= 'imba-typings/imba.d.ts'

		util.log("using imba lib",imbalib,proj)
		opts.lib = libs.concat([imbalib])

		if inferred
			opts.checkJs = true

		for lib,i in opts.lib
			let mapped = ts.libMap.get(lib)
			if mapped
				opts.lib[i] = mapped
				
		# if we can resolve an imba installation for the project
		# we should use the typings from that
		
		# console.warn "LIBS!!",opts.lib
		# proj.setCompilerOptions(opts)
		util.log('compilerOptions',proj,opts)
		return proj

	def create info
		#cwd ||= global.IMBASERVER_CWD or info.project.currentDirectory
		# Should the initial InferredProject even be inited?
		let proj = info.project
		proj.NR ||= ++counter

		util.log('create',info)
		setups.push(info)

		self.info = info
		self.project = info.project
		self.ps = project.projectService
		
		if ps.#patched =? yes
			setup!
			
		for script in imbaScripts
			script.wake!
			
		prepareProjectForImba(proj) if proj
		info.ls = info.languageService
		let decorated = decorate(info.languageService)
		emit('create',info)
		createVirtualProjectConfig!
		return decorated
		
	def convertSpan span, ls, filename, kind = null
		if util.isImba(filename) and span.#ostart == undefined
			span.#ostart = span.start
			span.#olength = span.length
			let mapper = ls.getProgram!.getSourceFile(filename)
			let [start,end] = mapper.o2d(span)
			span.start = start
			span.length = end - start
		return span
		
	def convertImbaDtsDefinition item
		try
			let file = item.fileName.replace("._.d.ts",'')
			let gdts = item.fileName == dts..fileName
			let found
			item.#gdts = true
			item.#name = item.name
			let imbaname = util.toImbaIdentifier(item.name)
			let fullname = "{item.containerName}.{item.name}"

			# util.log('convert imba definition',gdts,item.name,Object.keys(imbaGlobals),imbaname,fullname)

			if gdts
				
				if found = (imbaGlobals[fullname] or imbaGlobals[item.name] or imbaGlobals[imbaname])
					# util.log "found definition",found
					item.textSpan = found.textSpan
					item.contextSpan = found.contextSpan
					item.fileName = found.doc.fileName
					item.#scope = found
					return item
				item.#skip = yes
				return item

			let script = getImbaScript(file)
			let path = "{item.containerName}.prototype.{item.name}"
			let token = script.doc.findPath(util.toImbaIdentifier(path))
			util.log "converting path!?",item,path,token
			# console.log "convertImbaDtsDefinition",file
			if token
				item.textSpan = token.span
				item.contextSpan = token.body ? script.doc.expandSpanToLines(token.body.contextSpan) : token.span
			else
				let find = '-----'
				if item.kind == 'getter'
					find = "get {item.name}"

				let idx = script.content.indexOf(find)
				# look for tokens with this name
				let kind = ''
				let name = util.toImbaIdentifier(item.name)
				item.#name = item.name
				# if item.containerName == 'globalThis'

				let hit = script.doc.findNodeForTypeScriptDefinition(item)

				if hit
					item.#token = !!hit
					item.textSpan = hit.textSpan or hit.span
					item.contextSpan = hit.contextSpan or hit.span

				if false
					if item.kind == 'getter'
						kind = 'entity.name.get'
					elif item.kind == 'property'
						kind = 'entity.name.field'
					elif item.kind == 'method'
						kind = 'entity.name.def'
					elif item.kind == 'class'
						let symbols = script.doc.getSymbols!.filter do $1.name == name or $1.name == item.name

						if symbols[0]
							token = symbols[0].node

					if kind
						let tokens = script.doc.tokens.filter do $1.match(kind)
						tokens = tokens.filter do $1.value == name
						token = tokens[0]

						# if token
						#	item.textSpan = token.span
						#	item.contextSpan = token.span
					elif idx >= 0
						# find the token instead?
						item.textSpan = {start: idx, length: find.length}
						yes

					if token
						item.#token = !!token
						item.textSpan = token.span
						item.contextSpan = token.span

			item.#dts = yes

			item.fileName = file
		catch e
			util.log 'error',e
			yes

		return item
		
		
	def convertLocationsToImba res, ls, filename, kind = null
		if res isa Array
			for item in res
				convertLocationsToImba(item,ls,item.fileName)
		
		if !res
			return res

		if util.isImba(filename)
			let script = getImbaScript(filename)
			# let imbaname = util.toImbaIdentifier(res.name)
			let hit = script.doc.findNodeForTypeScriptDefinition(res)

			if hit
				# and util.isTagIdentifier(res.name)
				# let defn = script.doc.
				# token = script.doc.findTagDefinition(imbaname)
				# console.log "FOUND!!",hit
				res.textSpan &&= hit.textSpan or hit.span
				res.contextSpan &&= hit.contextSpan or hit.span
			else
				for key in ['text','context','trigger','applicable']
					if let span = res[key + 'Span']
						convertSpan(span,ls,filename,key)
			
			if res.textSpan
				res.#scope = "{filename}:{res.textSpan.start}"

			if res.textChanges
				for item in res.textChanges
					# this is an imba-native version!!
					if item.span == undefined and item.start != undefined
						item.span = {start: item.start, length: item.length}
						item.span.#ostart = 0
					else
						convertSpan(item.span,ls,res.fileName or filename,'edit')
		
		if res.changes
			convertLocationsToImba(res.changes, ls,filename)
			
		if res.references
			convertLocationsToImba(res.references, ls)
		
		if res.defintion
			convertLocationsToImba(res.defintion, ls,res.fileName)
			
		if res.definitions
			for item in res.definitions
				convertLocationsToImba(item,ls,item.fileName or item.file)

			res.definitions = res.definitions.filter do(item,index,arr)
				return no if item.#scope and arr.find(do $1.#scope == item.#scope) != item
				return no if item.#skip
				return yes

			
				
		if res.description
			res.description = util.toImbaString(res.description)
		
		if res.changes
			for item in res.changes
				for tc in item.textChanges
					tc.newText = util.toImbaString(tc.newText)

		# convert definitions from _.d.ts
		if util.isImbaDts(res.fileName)
			if res.containerName != undefined
				convertImbaDtsDefinition(res)
				
		if res.fileName and typeof res.name == 'string'
			res.name = util.toImbaString(res.name)
			
		if res.displayParts
			res.displayParts = util.toImbaDisplayParts(res.displayParts)
			# for dp,i in res.displayParts
			# 	dp.text = util.toImbaIdentifier(dp.text)
			# 	if dp.text.indexOf('$') >= 0
			# 		dp.text = util.toImbaString(dp.text,dp,res.displayParts)

		return res
		
	def getFileContext filename, pos, ls
		let script = getImbaScript(filename)
		let opos = script ? script.d2o(pos,ls.getProgram!) : pos
		return {script: script, filename: filename, dpos: pos, opos: opos}
		
		
	def decorate ls
		if ls.#proxied
			return ls

		let intercept = Object.create(null)
		ls.#proxied = yes
		# no need to recreate this for every new languageservice?!
		
		intercept.getEncodedSemanticClassifications = do(filename,span,format)
			if util.isImba(filename)
				let script = getImbaScript(filename)
				let spans = script.getSemanticTokens!
				return {spans: spans, endOfLineState: ts.EndOfLineState.None}

			return ls.getEncodedSemanticClassifications(filename,span,format)
		
		intercept.getEncodedSyntacticClassifications = do(filename,span)
			return ls.getEncodedSyntacticClassifications(filename,span)
			
		intercept.getQuickInfoAtPosition = do(filename,pos)
			let {script,dpos,opos} = getFileContext(filename,pos,ls)
			if script
				# let convpos = script.d2o(pos,ls.getProgram!)
				let out = script.getQuickInfo(dpos,ls)
				util.log('getQuickInfo',filename,dpos,opos,out)
				if out
					return out

			let res
			
			try
				res = ls.getQuickInfoAtPosition(filename,opos)
				util.log 'ls.getQuickInfoAtPosition',res
				convertLocationsToImba(res,ls,filename)
			
				if script and res
					let ctx = script.doc.contextAtOffset(pos)
					res.textSpan = ctx.token.span
				util.log 'ls.getQuickInfoAtPosition final',res,res..textSpan
			catch e
				util.log 'error',e
			return res

		intercept.getDefinitionAndBoundSpan = do(filename,pos)
			let {script,dpos,opos} = getFileContext(filename,pos,ls)
			let out
			let tok
			if script
				# check quick info via imba first?
				out = script.getDefinitionAndBoundSpan(dpos,ls)
				util.log "returned from imba script getDefinitionAndBoundSpan",out
				return out if out..definitions
			
			let res = ls.getDefinitionAndBoundSpan(filename,opos)
			# console.log 'got defs',filename,opos,res
			res = convertLocationsToImba(res,ls,filename)
			
			if out and out.textSpan and res and false
				res.textSpan = out.textSpan
				delete res.textSpan

			# console.log("out?!",res)
			
			let defs = res..definitions
			if script and defs
				let __new = defs.find do $1.name == '__new'
				if __new and defs.length > 1
					defs.splice(defs.indexOf(__new),1)

				let hasImbaDefs = defs.some do util.isImba($1.fileName)
				if hasImbaDefs
					defs = res.definitions = defs.filter do util.isImba($1.fileName) or !util.isImbaDts($1.fileName)

			# for convenience - hide certain definitions
			util.log('getDefinitionAndBoundSpan',script,dpos,opos,filename,res)
			
			return res
			
		intercept.getDocumentHighlights = do(filename,pos,filesToSearch)
			return if util.isImba(filename)
			return ls.getDocumentHighlights(filename,pos,filesToSearch)
			
			
		intercept.getRenameInfo = do(file, pos, o = {})
			# { allowRenameOfImportPath: this.getPreferences(file).allowRenameOfImportPath }
			let {script,dpos,opos} = getFileContext(file,pos,ls)
			let res = convertLocationsToImba(ls.getRenameInfo(file,opos,o),ls,file)
			
			return res
			
		intercept.findRenameLocations = do(file,pos,findInStrings,findInComments,prefs)
			let {script,dpos,opos} = getFileContext(file,pos,ls)
			let res = ls.findRenameLocations(file,opos,findInStrings,findInComments,prefs)
			res = convertLocationsToImba(res,ls)
			return res
			# (location.fileName, location.pos, findInStrings, findInComments, hostPreferences.providePrefixAndSuffixTextForRename)
		
		intercept.getEditsForFileRename = do(oldPath, newPath, fmt, prefs)
			let res = ls.getEditsForFileRename(oldPath, newPath, fmt, prefs)
			res = convertLocationsToImba(res,ls)
			return res
		
		intercept.getSignatureHelpItems = do(file, pos, prefs)
			let {script,dpos,opos} = getFileContext(file,pos,ls)
			let res = null
			
			if script
				res = script.getSignatureHelpItems(pos,prefs,ls)
				if res
					util.log('actually returned res from script!',res)
				
			res ||= ls.getSignatureHelpItems(file,opos,prefs)
			res = convertLocationsToImba(res,ls,file)
			return res
		
		intercept.getCompletionsAtPosition = do(file,pos,prefs)
			let {script,dpos,opos} = getFileContext(file,pos,ls)
			
			if script
				let res = script.getCompletionsAtPosition(ls,[dpos,opos],prefs)
				return res

			let res = ls.getCompletionsAtPosition(file,opos,prefs)
			
			if res and res.entries
				res.entries = res.entries.filter do(item)
					return no if item.source == 'imba_css'
					return no if item.source and item.source.indexOf('node_modules/imba/') >= 0
					return yes

			return res
			
		intercept.getNavigationTree = do(file)
			if util.isImba(file)
				let script = getImbaScript(file)
				let res1 = ls.getNavigationTree(file)
				let res2 = script.doc.getOutline!
				util.log('navtree',res1,res2)
				return res2

			let res = ls.getNavigationTree(file)
			return res
			
		intercept.getOutliningSpans = do(file)
			if util.isImba(file)
				let script = getImbaScript(file)
				return null
			return ls.getOutliningSpans(file)
		
		intercept.getCompletionEntryDetails = do(file,pos,name,fmt,source,prefs,data)
			let {script,dpos,opos} = getFileContext(file,pos,ls)
			let res = ls.getCompletionEntryDetails(file,opos,name,fmt,source,prefs,data)
			return res

		intercept.getCodeFixesAtPosition = do(file,start,end,code,fmt,prefs)
			let {script,dpos,opos} = getFileContext(file,start,ls)
			let {opos: endopos} = getFileContext(file,end,ls)

			let res = ls.getCodeFixesAtPosition(file,opos,endopos,code,fmt,prefs)
				
			# "Add 'TextField' to existing import declaration from "./tags/field""
			# "Import 'TextField' from module "./tags/field.imba""
			# 
			for fix in res
				let m
				# rewrite import codefix
				if script and fix.fixName == 'import'
					let name = fix.description.split("'")[1]
					let path = fix.description.split('"')[1].replace(/\.imba$/,'')
					fix._name = name
					fix._path = path
					# experimental
					let edit = script.doc.createImportEdit(path,name,name)
					fix._changes = edit.changes
					fix.changes[0].textChanges = edit.changes

			res = convertLocationsToImba(res,ls,file)
			return res
		
		# const res = project.getLanguageService().getCombinedCodeFix({ type: "file", fileName: file }, fixId, this.getFormatOptions(file), this.getPreferences(file));
		# getCombinedCodeFix(scope: CombinedCodeFixScope, fixId: {}, formatOptions: FormatCodeSettings, preferences: UserPreferences): CombinedCodeActions;
		intercept.getCombinedCodeFix = do(scope,fixId,fmt,prefs)
			let res = ls.getCombinedCodeFix(scope,fixId,fmt,prefs)
			if res.changes
				convertLocationsToImba(res.changes,ls)
				util.log('getCombinedCodeFix',arguments,res)
			return res
			
		intercept.getNavigateToItems = do(val\string, max\number, file\string, excludeDtsFiles\boolean)
			let res = ls.getNavigateToItems(val,max,file,excludeDtsFiles)
			convertLocationsToImba(res,ls)
			return res
		
		# fileName: string, positionOrRange: number | TextRange, preferences: UserPreferences | undefined, triggerReason?: RefactorTriggerReason, kind?: string
		intercept.getApplicableRefactors = do(file,...args)
			if util.isImba(file)
				let script = getImbaScript(file)
				return [] if !script.js

			let res = ls.getApplicableRefactors(file,...args)
			return res
			
		intercept.findReferences = do(file,pos)
			let {script,dpos,opos} = getFileContext(file,pos,ls)

			if script
				# check quick info via imba first?
				let out = script.getDefinitionAndBoundSpan(dpos,ls)
				return [out] if out..references

			let res = ls.findReferences(file,opos)
			res = convertLocationsToImba(res,ls)
			util.log('findReferences',file,dpos,opos,res)
			return res

		intercept.getTypeDefinitionAtPosition = do(file,pos)
			let {script,dpos,opos} = getFileContext(file,pos,ls)
			let res = ls.getTypeDefinitionAtPosition(file,opos)
			# let old = global.structuredClone(res)
			res = convertLocationsToImba(res,ls)
			return res

		intercept.getNavigateToItems = do(query,maxResults)
			let exclusive = getConfig('workspaceSymbols.scope')
			let regex = new RegExp(query.split('').join('.*'),'i')

			let all = []
			let res = []
			for script in imbaScripts
				if script.doc
					let part = script.doc.getNavigateToItems!
					all.push(...part)

			for item in all
				item.name ||= 'render'
				let m = regex.test(item.name)
				if m
					item.matchKind = item.name == query ? "exact" : "prefix"
					item.isCaseSensitive = true
					res.push(item)

			unless exclusive == 'imbaOnly'
				let fromts = ls.getNavigateToItems(query,maxResults)
				for item in fromts
					continue if util.isImbaDts(item.fileName)
					continue if util.isImba(item.fileName)
					continue if util.isImbaStdts(item.fileName)
					res.push(item)

			return res

		# intercept.getNavigateToItems = do(file,pos)


		if true
			for own k,v of intercept
				let orig = v
				intercept[k] = do
					try
						let t = Date.now!
						util.warn("call {k}",...arguments)
						let res = v.apply(intercept,arguments)
						util.warn("return {k} in {Date.now! - t}ms",res)
						return res
					catch e
						util.log('error',k,e)

		
		return new Proxy(ls, {get: do(target,key) return intercept[key] || target[key]})
	
	def rewriteInboundMessage msg
		msg
	
	def awakenProjectForImba proj
		util.warn "service awakenProjectForImba",proj
		# what if it happens multiple times?
		# now we should block / delay the mark project as dirty stuff
		for item in imbaScripts
			item.syncDts!

		syncProjectForImba(proj)
		self

	def syncProjectForImba proj
		# return
		let all = ''
		let globals = {}
		for item in imbaScripts when item.doc
			let dts = item.doc.getGeneratedDTS({},globals)
			if dts
				all += '\n' + dts
		# console.log 'got here?!'
		for own k,v of globals
			all = all.replaceAll("&&{k}&&","module '{v.doc.fileName}'")

		all = all.replace(/&&.+?&&/g,'global')

		let file = dts = proj.#dts ||= new ImbaScriptDts({fileName: np.resolve(proj.currentDirectory,'generated.imba'), project: proj})
		let changed = file.update(all)
		imbaGlobals = globals
		if changed and isSemantic and global.session
			global.session..refreshDiagnostics!
		self
		
	def setup
		let exts = (ps.hostConfiguration.extraFileExtensions ||= [])
		exts.push('.imba') if exts.indexOf('.imba') == -1
		setTimeout(&,200) do createVirtualProjectConfig!
		self
	
	def getScriptInfo src
		ps.getScriptInfo(resolvePath(src))
		
	def getImbaScript src
		getScriptInfo(src)..im
	
	def getSourceFile src
		let info = getScriptInfo(src)
		info..cacheSourceFile..sourceFile

	def getDiagnostics
		let program = cp.program
		return ts.getPreEmitDiagnostics(program)
		
	get scripts
		Array.from(ps.filenameToScriptInfo.values())
		
	get imbaScripts
		# scripts.filter(do(script) util.isImba(script.fileName)).map(do(script) script.imba)
		scripts.map(do $1.#imba).filter(do $1)

	def findImbaTokensOfType type
		let res = []
		for script in imbaScripts
			let matches = script.doc.getMatchingTokens(type)
			res.push(...matches)
		return res

	get cwd
		#cwd ||= normalizePath(global.IMBASERVER_CWD or process.env.VSCODE_CWD or process.env.IMBASERVER_CWD)
	
	get m
		getScriptInfo('main.imba')
			
	get u
		getScriptInfo('util.imba')
	
	def getExt src
		src.substr(src.lastIndexOf("."))

	def normalizePath src
		src.split(np.sep).join(np.posix.sep)
		
	def resolvePath src
		ps.toPath(normalizePath(np.resolve(cwd,src || '__.js')))