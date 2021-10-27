import * as util from './util'
import * as constants from './constants'
import Compiler from './compiler'
import ImbaScript from './script'
import * as Diagnostics from './diagnostics'
import np from 'path'

let EDITING = no
global.state = {command: ''}

let EXTRA_HIT = null
let EXTRA_EXTENSIONS = ['.imba']

const typings = {
	"imba.d.ts": import("../../../typings/imba.d.ts?as=text")
	"imba.dom.d.ts": import("../../../typings/imba.dom.d.ts?as=text")
	"imba.events.d.ts": import("../../../typings/imba.events.d.ts?as=text")
	"imba.router.d.ts": import("../../../typings/imba.router.d.ts?as=text")
	"imba.snippets.d.ts": import("../../../typings/imba.snippets.d.ts?as=text")
	"imba.types.d.ts": import("../../../typings/imba.types.d.ts?as=text")
	"styles.d.ts": import("../../../typings/styles.d.ts?as=text")
	"styles.generated.d.ts": import("../../../typings/styles.generated.d.ts?as=text")
	"styles.modifiers.d.ts": import("../../../typings/styles.modifiers.d.ts?as=text")
}

def isEditing
	global.state.command == 'updateOpen'


def stack state, cb
	let prev = global.state
	global.state = state
	let res = cb()
	global.state = prev
	return res	

export class Session
	
	def onMessage msg
		global.session = self
		#onMessage(msg)
		
	def toEvent name, body
		#toEvent(name,body)
		
	def doOutput info, cmdName, reqSeq, success, message
		#doOutput(info, cmdName, reqSeq, success, message)

	
	def send msg
		let log = yes
		
		if msg.body and msg.body.diagnostics and msg.body.diagnostics.length == 0
			log = no
			
		if log
			util.log("send {msg.type} {msg.event or msg.command}",msg)
		
		msg = JSON.parse(util.toImbaString(JSON.stringify(msg)))
		
		#send(msg)
		
	def refreshDiagnostics
		# @ts-ignore
		let files = Array.from(projectService.openFiles.keys!).filter do !util.isImbaDts($1)

		# @ts-ignore
		let handler = handlers.get('geterr')
		# wont send in syntactic mode?
		let req = {arguments: {files: files, delay: 10}}
		util.log('sendErrors',req)
		handler.call(this,req)

	def getFormattingEditsForRange args
		#getFormattingEditsForRange(args)
		
	def getFormattingEditsForRangeFull args
		#getFormattingEditsForRangeFull(args)
		
	def getFormattingEditsForDocumentFull args
		#getFormattingEditsForDocumentFull(args)
		
	def getFormattingEditsAfterKeystroke args
		#getFormattingEditsAfterKeystroke(args)
		
	def getFormattingEditsAfterKeystrokeFull args
		#getFormattingEditsAfterKeystrokeFull(args)
	
	def getOutliningSpans args, simplified
		if util.isImba(args.file)
			return null
		#getOutliningSpans(args,simplified)

	def parseMessage msg
		let prev = #lastReceived
		let data = #parseMessage(msg)
		if global.ils
			data = global.ils.rewriteInboundMessage(data)
			
		unless data.command == 'configurePlugin'
			util.log("receive {data.type} {data.command}",data)
		
		if prev and prev.command == 'encodedSemanticClassifications-full'
			if util.isImba(prev.arguments.file)
				if data.command == 'geterr'
					util.log('suppress geterr message!',data)
					# there will still be the same errors?
					data.arguments.files = [prev.arguments.file]
					# data.skip = yes
		
		#lastReceived = data
		return data
		
	def toFileSpan file, span, project
		
		let res = null
		if util.isImba(file)
			let script = project.getScriptInfo(file)
			let start = script.positionToLineOffset(span.start)
			let end =  script.positionToLineOffset(span.start + span.length)
			res = {
				file: file
				start: start
				end: end
			}
		else
			res = #toFileSpan(file,span,project)
			
		util.log('toFileSpan',file,span,res)
		return res
		
	def executeCommand request
		# we want to intercept some commands on the syntactic server
		# if request.command.indexOf('navtree') == 0
		#	return { responseRequired: false }
			
		if request.command == 'configurePlugin' and request.arguments.pluginName == 'imba'
			let data = request.arguments.configuration
			if global.ils
				if data.#handled =? yes
					global.ils.handleRequest(data)
			return { responseRequired: false }

		if request.skip
			return { responseRequired: false }

		let res = stack(request) do #executeCommand(request)
		return res
		
	def filterDiagnostics file, project, diagnostics, kind
		let script = project.getScriptInfoForNormalizedPath(file)
		let state = {}
		
		# return diagnostics unless script.#imba
		
		for item in diagnostics
			try
				let mapper = item.#mapper ||= item.file..scriptSnapshot..mapper
				continue unless mapper
				
				if item.#converted =? yes
					# item.messageText = util.toImbaMessageText(item.messageText)
					let mapper = item.file..scriptSnapshot..mapper
					let opos = item.#opos = [item.start,item.start + item.length]
					item.#otext = mapper.otext(opos[0],opos[1])
					Diagnostics.filter(item,project,kind)
					continue if item.#suppress
					
					# for rel in item.relatedInformation
					#	rel.messageText = util.toImbaMessageText(rel.messageText)

					let range = mapper.o2iRange(item.start,item.start + item.length,no)
					# let start = mapper.o2d(item.start)
					# let end = mapper.o2d(item.start + item.length)
					if range.length
						item.#ipos = range
						item.#length = range[1] - range[0]
						item.#text = mapper.itext(range[0],range[1])
					else
						# hide the diagnostic if it doesnt map perfectly
						item.start = item.length = 0
						item.#suppress = yes
				
				if item.#ipos
					item.start = mapper.i2d(item.#ipos[0])
					item.length = mapper.i2d(item.#ipos[1]) - item.start
					let text = mapper.dtext(item.start,item.start + item.length)
					if text != item.#text
						# util.log('suppress item',item,item.#text,text)
						item.#suppress = yes
				
			catch e
				util.log('error',e)
		
		# util.log('filterDiagnostics',file,diagnostics)
		return diagnostics.filter do !$1.#suppress
			
	def sendDiagnosticsEvent(file, project, diags, kind)
		if kind == 'semanticDiag' and diags.length
			util.log('sendDiagnisticsPrefilter',diags.slice(0))

		diags = filterDiagnostics(file,project,diags,kind)
		
		if kind == 'semanticDiag' and util.isImba(file) and global.ils
			let script = global.ils.getImbaScript(file)
			let add = script.getImbaDiagnostics()
			# util.log('sendDiagnosticsEvent for imba',script,add)
			diags.push(...add)
			###
			category: 1
			code: 2551
			file: SourceFileObject {pos: 0, end: 1289, flags: 131072, modifierFlagsCache: 0, transformFlags: 10617424, …}
			length: 7
			messageText: "Property 'assertz' does not exist on type 'Console'. Did you mean 'assert'?"
			relatedInformation: [{…}]
			start: 284
			###
			# for item in script.diagnostics
		
		if diags.length
			util.log('sendDiagnosticsEvent',file, project, diags.slice(0,5), kind)
		#sendDiagnosticsEvent(file,project,diags,kind)
		
	def convertToDiagnosticsWithLinePosition diagnostics, script
		# util.log 'convertToDiagnosticsWithLinePosition',diagnostics,script
		#convertToDiagnosticsWithLinePosition(diagnostics, script)

export class ScriptInfo
	
	get imbaContent
		#imba..content
	
	# mostly used by session to format diagnostics etc for vscode
	# default to convert to the imba offsets instead. It's important
	# to make sure diagnostics have converted the start,length props
	# to current imba coordinates before calling this
	def positionToLineOffset pos
		if #imba
			let out = #imba.positionToLineOffset(pos)
			# util.log('positionToLineOffset',path,pos,out)
			return out

		let res = #positionToLineOffset(pos)
		return res
	
	# mostly called by session to convert from positions coming in from
	# vscode (ie. from the live imba file). Here we usually want the position
	# in the imba file - and then rather convert that to js when we want to.
	def lineOffsetToPosition line, offset, editable
		if #imba
			return #imba.lineOffsetToPosition(line, offset, editable)
		#lineOffsetToPosition(line,offset, editable)
		
	def o2d pos, source
		getMapper(source).o2d(pos)
			
	def d2o pos, source
		getMapper(source).d2o(pos)

	def jsPositionToImbaLineOffset pos
		let dpos = getMapper!.o2d(pos)
		#imba.svc.positionToLineOffset(dpos)
		
	def positionToImbaLineOffset offset
		let snap = getSnapshot!
		let converted = snap.c.o2i(offset)
		# @ts-ignore
		util.log('converted',path,offset,converted)
		let lo = snap.mapper.input.index.positionToLineOffset(converted)
		return lo
		
	def getMapper target
		# @ts-ignore
		let snap = target ? target.getSourceFile(path).scriptSnapshot : getSnapshot!
		return snap.mapper

	# imba position
	def imbaToJsPosition pos, program
		let mapper = getMapper(program)
		let ipos = mapper.d2i(pos)
		let opos = mapper.d2o(pos)
		util.log('rewind pos',pos,ipos,opos)

		return opos
		# let converted = snap.c.i2o(pos)

	def editContent start, end, newText
		util.log('editContent',start,end,newText)
		if #imba
			#imba.editContent(start,end,newText)
		else	
			#editContent(start,end,newText)
			
	def getSnapshot
		# util.log('getSnapshot',self.path)
		#imba
		return #getSnapshot!
		

export class TextStorage
	
	# ts.server.ScriptVersionCache.fromString
	
	def getFileTextAndSize tempName
		# @ts-ignore
		if util.isImba(info.path)
			# util.log('getFileTextAndSize',info.path,tempName,info.##imba)
			if #text != undefined
				return {text: #text}
			# info.im
			# should get the compilation connected
		#getFileTextAndSize(tempName)
	
	def smartReplaceText text
		# calculate edits by comparing current snapshot with content
		self

export class System
	
	get virtualFileMap
		global.ils and global.ils.virtualFiles or {}
	
	def readVirtualFile path
		let body = virtualFileMap[path]
		if body == undefined
			body = virtualFileMap[path.toLowerCase!]
		
		typeof body == 'string' ? body : undefined
		 
	def fileExists path
		if (/\.tsx$/).test(path)
			for ext in EXTRA_EXTENSIONS
				let ipath = path.replace('.tsx',ext).replace(ext + ext,ext)
				if #fileExists(ipath)
					util.log "intercepted fileExists",path,ipath
					EXTRA_HIT = [path,ipath]
					return yes
		
		if path.indexOf('imba-typings') >= 0
			let name = np.basename(path)
			virtualFileMap[path] ||= typings[name]
			return true
		
		if (/[jt]sconfig\.json/).test(path)
			util.log('fileExists',path,#fileExists(path),!!readVirtualFile(path))

			if readVirtualFile(path) !== undefined
				return true
				
		return #fileExists(path)
	
	# readDirectory?(path: string, extensions?: readonly string[], exclude?: readonly string[], include?: readonly string[], depth?: number): string[];
	def readDirectory path, extensions, exclude, include,depth
		let res = #readDirectory(path,extensions, exclude, include,depth)
		util.log('readDirectory',arguments,res)
		return res
	
	def readFile path,encoding = null
		util.log("readFile",path)
		
		if path.indexOf('imba-typings') >= 0
			return readVirtualFile(path)
		
		if (/[jt]sconfig\.json/).test(path)
			if let body = readVirtualFile(path)
				util.log("return virtual file",path,body)
				return body
			
		const body = #readFile(...arguments)
		# if this is an imba file we want to compile it on the spot?
		# if the script doesnt already exist...
		if util.isImba(path)
			# first see if script exists?
			util.log("readFile imba",path,body,global.ils)
			# return Compiler.readFile(path,body)

		return body
		
export class Project
	def setCompilerOptions value
		let res = #setCompilerOptions(value)
		util.log('setCompilerOptions',this,value)
		return
		
	def onPluginConfigurationChanged name, data
		util.log('configChanged',name,data)
		if name == 'imba' and global.ils
			if data.#handled =? yes
				global.ils.handleRequest(data)
		else
			#onPluginConfigurationChanged(name,data)
	
	def reloadForImba
		let path = canonicalConfigFilePath
		let cfg = projectService.configFileExistenceInfoCache.get(path)
		let isLoading = !!sendLoadingProjectFinish

		if isLoading
			return

		if cfg..config
			cfg.config.reloadLevel = 1
			projectService.reloadFileNamesOfConfiguredProject(self)
		yes
		
	def shouldSupportImba
		return true if global.hasImbaScripts
		let files = projectService.host.readDirectory(currentDirectory,null,['node_modules'],['**/*.imba'],4)
		return true if files.length > 0
		return false

		
export class ProjectService

	def activateProjectForImba project
		let isLoading = !!project.sendLoadingProjectFinish

		if isLoading
			return
		
		if project.#patchedForImba =? yes
			let exts = (hostConfiguration.extraFileExtensions ||= [])
			exts.push('.imba') if exts.indexOf('.imba') == -1

			if project.shouldSupportImba!
				util.log('activateProjectForImba',project)
				let path = project.canonicalConfigFilePath
				let cfg = configFileExistenceInfoCache.get(path)
				if cfg..config
					cfg.config.reloadLevel = 1
					reloadFileNamesOfConfiguredProject(project)
		self
		
	def awakenProjectForImba project
		util.warn('awakenProjectForImba',project)
		
	
	def sendProjectLoadingFinishEvent project
		util.log('sendProjectLoadingFinishEvent',project,!!project.#patchedForImba)
		#sendProjectLoadingFinishEvent(project)
		try
			if !project.#patchedForImba
				activateProjectForImba(project)
			elif !project.#awakenedForImba and global.ils
				project.#awakenedForImba = yes
				global.ils.awakenProjectForImba(project)
				
		catch e
			util.log('error',e,project)
	

		
	def getOrCreateOpenScriptInfo(fileName, fileContent, scriptKind, hasMixedContent, projectRootPath)
		let origFileContent = fileContent
		if util.isImba(fileName)
			util.log("getOrCreateOpenScriptInfo {fileName}")
			# if fileContent !== undefined
			#	fileContent = Compiler.readFile(fileName,fileContent)

		let script = #getOrCreateOpenScriptInfo(fileName, fileContent, scriptKind, hasMixedContent, projectRootPath)
		
		script.#imba
		
		if script.#imba and origFileContent !== undefined
			script.#imba.openedWithContent(origFileContent)
			
		return script
		
	def ensureConfiguredImbaProjects
		let configs = []
		# @ts-ignore
		for [configFile,project] of configuredProjects
			if !project.#imba
				# @ts-ignore
				let imbafiles = host.readDirectory(project.currentDirectory,null,['node_modules'],['*.imba'],4)
				util.log('ensureImba',project,imbafiles,project.isInitialLoadPending!)

				if imbafiles.length
					project.#imba = yes
					configs.push(configFile)
					setTimeout(&,50) do
						# @ts-ignore
						delayUpdateProjectsFromParsedConfigOnConfigFileChange(configFile,1)
		
		
		# for cfg in configs
		# 	delayUpdateProjectsFromParsedConfigOnConfigFileChange(cfg,1)
		self
				
		# delayUpdateProjectsFromParsedConfigOnConfigFileChange
		
export class ScriptVersionCache
	
	def getRawChangesBetweenVersions oldVersion, newVersion
		let edits = []
		while oldVersion < newVersion
			# @ts-ignore
			let snap = this.versions[++oldVersion]
			for edit of snap.changesSincePreviousVersion
				edits.push([edit.pos,edit.deleteLen,edit.insertedText or ''])
		
		return edits
		
	def smartReplaceText text
		# calculate edits by comparing current snapshot with content
		self
		
	def getRawChangesSince oldVersion = 0
		# @ts-ignore
		let snap = getSnapshot!
		getRawChangesBetweenVersions(oldVersion,snap.version)
			
	get syncedVersion
		# @ts-ignore
		getSnapshot!.version
			
	def getFullText
		# @ts-ignore
		let snap = getSnapshot!
		snap.getText(0,snap.getLength!)
		
	def getAdjustedOffset fromOffset, from, to = syncedVersion, stickyStart = no
		
		let minVersion = Math.min(from,to)
		let maxVersion = Math.max(from,to)
		
		if minVersion == maxVersion
			return fromOffset
		
		let edits = getRawChangesBetweenVersions(minVersion,maxVersion)
		# console.log 'edits!!',edits,from,to
		
		if edits.length == 0
			return fromOffset
			
		# this is a range
		if fromOffset.start != undefined
			return {
				start: getAdjustedOffset(fromOffset.start,from,to,stickyStart)
				length: getAdjustedOffset(fromOffset.start + fromOffset.length,from,to,stickyStart)
			}

		let offset = fromOffset
		let modified = no
		
		if from < to
			for [start,len,text] in edits
				continue if start > offset
				start -= 1 if stickyStart
				if offset > start and offset > (start + len)
					offset += (text.length - len)
						
		elif to < from
			for [start,len,text] in edits.slice(0).reverse!
				continue if start > offset
				if offset > start and offset > (start + len)
					offset -= (text.length - len)

		return offset
		
	def rewindOffset offset, version
		getAdjustedOffset(offset,syncedVersion,version,yes)
	
	def forwardOffset offset, fromVersion
		getAdjustedOffset(offset,fromVersion,syncedVersion,yes)


export class TS

	def resolveImportPath path, src, project, withAssets = null
		let args = [path,src,project.getCompilerOptions(),project.directoryStructureHost]
		if withAssets
			EXTRA_EXTENSIONS = withAssets isa Array ? withAssets : constants.Extensions
		let res = resolveModuleName.apply(self,args)
		EXTRA_EXTENSIONS = ['.imba']
		return res
	
	def getSupportedExtensions options, extra
		let res = #getSupportedExtensions(options,extra)
		# util.log 'getSupportedExtensions',options,extra,res
		res.unshift('.imba') if res.indexOf('.imba') == -1
		return res

	def resolveModuleName moduleName, containingFile, compilerOptions, host, cache, redirectedReference
		let res = #resolveModuleName.apply(self,arguments)
		let hit = res..resolvedModule
		let name = hit..resolvedFileName
		
		if hit..extension == '.tsx'
			if EXTRA_HIT and EXTRA_HIT[0] == name
				# util.log "rewrite resolveModuleName",name,EXTRA_HIT[1]
				name = EXTRA_HIT[1]
				# for ext in checkExtraExtensions
				# 	let name = ext.replace()
				# 	let name = hit.resolvedFileName.replace('.tsx','.imba')
				# @ts-ignore
				if self.sys.fileExists(name)
					hit.resolvedFileName = name
					hit.extension = '.ts'

		return res
	
	def getScriptKindFromFileName fileName
		const ext = fileName.substr(fileName.lastIndexOf("."))
		# @ts-ignore
		return self.ScriptKind.JS if ext == '.imba'
		return #getScriptKindFromFileName(fileName)
		
		

export def subclasses ts
	let O = {}
	class O.ImbaScriptVersionCache < ts.server.ScriptVersionCache
		
		def currentVersionToIndex
			currentVersion
			
		def versionToIndex number
			number

	return O
	
export default def patcher ts
	util.extend(ts.server.Session.prototype,Session)
	util.extend(ts.server.ScriptInfo.prototype,ScriptInfo)
	util.extend(ts.server.TextStorage.prototype,TextStorage)
	util.extend(ts.server.ScriptVersionCache.prototype,ScriptVersionCache)
	util.extend(ts.server.ProjectService.prototype,ProjectService)
	util.extend(ts.server.Project.prototype,Project)
	util.extend(ts.sys,System)
	util.extend(ts,TS)
	
	let subs = subclasses(ts)
	
	for own k,v of subs
		ts[k] = v
	
	const SymbolObject = global.SymbolObject = ts.objectAllocator.getSymbolConstructor!
	const Token = global.Token = ts.objectAllocator.getTokenConstructor!
	const TypeObject   = global.TypeObject = ts.objectAllocator.getTypeConstructor!
	const NodeObject   = global.NodeObject = ts.objectAllocator.getNodeConstructor!
	const SourceFile   = global.SourceFile = ts.objectAllocator.getSourceFileConstructor!
	const Signature    = global.Signature = ts.objectAllocator.getSignatureConstructor!
	const Identifier = global.Identifier = ts.objectAllocator.getIdentifierConstructor!
	

	extend class SourceFile
			
		def i2o i
			scriptSnapshot.mapper.i2o(i)
			
		def d2i i
			scriptSnapshot.mapper.d2i(i)
		
		def d2o i
			scriptSnapshot.mapper.d2o(i)
			
		def o2d i
			scriptSnapshot.mapper.o2d(i)
			
		def getLocalTags
			for [key,item] of locals
				if item.exportSymbol and !item.exports
					item = item.exportSymbol
				continue unless item..exports..has('$$TAG$$')
				item
	
	
	extend class SymbolObject
	
		get pascal?
			util.isPascal(escapedName)
		
		
		get imbaName
			return #imbaName if #imbaName
			let name = escapedName
			# elif name.match(/^[\w\-]+CustomElement$/)
			#	name = util.dasherize(name.slice(0,-13))
			# elif name.indexOf('_$SYM$_') == 0
			#	name = name.split("_$SYM$_").join("#")
			if name.indexOf('___') == 0
				name = name.slice(1)
				
			if name == 'globalThis'
				name = 'global'
			
			name = util.fromJSIdentifier(name)

			#imbaName = name
			
		get imbaTags
			return #imbaTags if #imbaTags
			let tags = #imbaTags = {}
			for item in getJsDocTags!
				let res = item.text or true
				if res isa Array and res[0]
					res = res[0]
				
				if res and res.kind == 'text'
					res = res.text
					
				if typeof res == 'string' and res.indexOf('\\') >= 0
					res = res.replace(/\\n/g,'\n').replace(/\\t/g,'\t')
					
				tags[item.name] = res
			tags
			
		def doctag name
			let tags = getJsDocTags!
			for item in tags
				if item.name == name
					let res = item.text or true
					if res isa Array and res[0] and res[0].kind == 'text'
						return res[0].text
					return res
			return null
			
		get isInternal
			(/^__@|$\d+$|^\$\$\w+\$\$|_\$INTERNAL\$_/).test(escapedName)
			
		get isTag
			self.exports..has('$$TAG$$')
			
		get isWebComponent
			(/^[\w\-]+CustomElement$/).test(escapedName)
			
		get isReadonly
			valueDeclaration.modifierFlagsCache & ts.ModifierFlags.Readonly

		get isDeprecated
			valueDeclaration.modifierFlagsCache & ts.ModifierFlags.Deprecated
			
		get isDecorator
			escapedName[0] == 'α'
			
			
		get isStyleProp
			parent and parent.escapedName == 'imbacss' and (/^[a-zA-ZΞ]/gu).test(escapedName)
			
		get isStyleModifier
			parent and parent.escapedName == 'imbacss' and (/^α/gu).test(escapedName)
		
		get isStyleType
			parent and parent.escapedName == 'imbacss' and (/^Ψ/gu).test(escapedName)

		get isTagAttr
			return no if isDeprecated
			(flags & (ts.SymbolFlags.Property | ts.SymbolFlags.SetAccessor)) && (flags & ts.SymbolFlags.Function) == 0 && !isReadonly && !escapedName.match(/^on\w/)
			
		get method?
			flags & ts.SymbolFlags.Method

	return ts
	
	