# extend scriptInfo
import fs from 'fs'
import * as util from './util'

import { TokenModifier, TokenType } from './constants'
import Compiler,{Compilation} from './compiler'

# import ImbaScriptInfo from './lexer/script'
import ImbaScriptInfo, {Token as ImbaToken} from 'imba-monarch'
import Completions from './completions'
import ImbaScriptContext from './context'
import ImbaTypeChecker from './checker'
import ImbaScriptDts from './dts'

export default class ImbaScript
	constructor info
		self.info = info
		self.diagnostics = []
		global.hasImbaScripts = yes

		if info.scriptKind == 0
			info.scriptKind = 1
			util.log("had to wake script {fileName}")
			
	get ils
		global.ils
		
	get dts
		#dts ||= new ImbaScriptDts(self)

	get js
		lastCompilation..js
			
	def getMapper target
		let snap = target ? target.getSourceFile(fileName).scriptSnapshot : info.getSnapshot!
		return snap.mapper
		
	def getText start = 0, end = null
		snapshot.getText(start,end)
		
	def o2d pos, source
		getMapper(source).o2d(pos)
			
	def d2o pos, source
		getMapper(source).d2o(pos)
			
	def typeAt pos
		let tc = getTypeChecker!
		tc.typeAtLocation(pos)
		
	def openedWithContent content
		util.log('openedWithContent',fileName)
		if content != self.content
			util.log('replace content?',fileName,[content,doc.content,self.content])
		
	def getFromDisk
		fs.readFileSync(fileName,'utf-8')

	def setup
		let orig = info.textStorage.text
		if orig == undefined
			# if this was already being edited?!
			orig = getFromDisk!
			util.log("setup {fileName} - read from disk",orig.length)
		else
			util.log("setup {fileName} from existing source",orig.length,info)

		svc = global.ts.server.ScriptVersionCache.fromString(orig or '')
		svc.currentVersionToIndex = do this.currentVersion
		svc.versionToIndex = do(number) number
		doc = new ImbaScriptInfo(self,svc)
		
		# if global.ils.isSemantic
		# now do the initial compilation?
		
		# how do we handle if file changes on disk?
		try
			let result = lastCompilation = compile!
			let its = info.textStorage
			let snap = its.svc = global.ts.server.ScriptVersionCache.fromString(result.js or '\n')
			its.text = undefined

			let reloadWithFileText_ = its.reloadWithFileText

			its.reloadWithFileText = do(tempFileName)
				util.log('reloadWithFileText',fileName,tempFileName,this,this.ownFileText,this.pendingReloadFromDisk,this.isOpen)
				unless tempFileName
					let body = getFromDisk!
					# the underlying imba code has actually changed
					util.log('reloadWithFileText content?',fileName,[body,doc.content,content])
					if body != content and !this.isOpen
						replaceContent(body)

				return reloadWithFileText_.call(its,tempFileName)
			
			its.getFileTextAndSize = do(tempFileName)
				util.log('getFileTextAndSize',fileName,tempFileName)
				{text: lastCompilation..js or ''}
				
			its.reload = do(newText)
				util.log('reload',fileName,newText.slice(0,10))
			
				return false
			util.log('resetting the original file',snap)
			snap.getSnapshot!.mapper = result
			info.markContainingProjectsAsDirty!
		catch e
			util.log('setup error',e,self)

		return self
			
	def lineOffsetToPosition line, offset, editable
		svc.lineOffsetToPosition(line, offset, editable)
		
	def positionToLineOffset pos
		svc.positionToLineOffset(pos)

	def asyncCompile
		util.log('async compile!')
		let snap = svc.getSnapshot!
		let body = snap.getText(0,snap.getLength!)
		let output = new Compilation(info,snap)
		# Compiler.compile(info,body)
		output.compile!
		applyOutput(output)
	
	def applyOutput result
		lastCompilation = result
		diagnostics=result.diagnostics

		if let js = result.js
			let its = info.textStorage
			let end = its.svc.getSnapshot!.getLength!
			util.log('compiled',fileName,end,its)
			its.edit(0, end, result.js)
			let snap = its.svc.getSnapshot!
			snap.mapper = result
			result.#applied = yes
	
			result.script.markContainingProjectsAsDirty!
			let needDts = result.js.indexOf('class Ω') >= 0
			util.log('onDidCompileScript',result,needDts)
			if ils.isSemantic
				global.session.refreshDiagnostics!
		else
			util.log('errors from compilation!!!',result)
			diagnostics=result.diagnostics
			global.session.refreshDiagnostics!
		self
		
	def syncDts
		if lastCompilation..shouldGenerateDts
			util.log "syncDts"
			let prog = project.program
			let script = prog.getSourceFile(fileName)
			let out = {}
			let body\string
			let writer = do(path,b) out[path] = body = b
			let res = prog.emit(script,writer,null,true,[],true)
			util.log 'emitted dts',out,res,body
			dts.update(body)
			return dts.#body
		return null
		
	def getImbaDiagnostics
		
		let mapper = lastCompilation
		let entries = mapper.diagnostics
		let diags = []
		
		if mapper.input.#saved
			util.log('imba diagnostics saved!')
		else
			return []
		
		for entry in entries
			let start = mapper.i2d(entry.range.start.offset)
			let end = mapper.i2d(entry.range.end.offset)
			let diag = {
				category: 1
				code: 2551
				messageText: entry.message
				relatedInformation: []
				start: start
				length: (end - start)
				source: entry.source or 'imba'
			}
			diags.push diag

		return diags

	def editContent start, end, newText
		svc.edit(start,end - start,newText)
		# this should just start asynchronously instead
		if ils.isSemantic
			util.delay(self,'asyncCompile',250)

	def replaceContent newText
		let from = content
		let snap = svc.getSnapshot!
		util.log('replacing content',fileName,from,newText,from.length,newText.length)
		if newText != from
			svc.edit(0,from.length,newText)
			svc.getSnapshot!
			doc.tokens
			util.log('replaced content',[newText,doc.content,content])
		

	def compile
		let snap = svc.getSnapshot!
		let output = new Compilation(info,snap)
		# let body = snap.getText(0,snap.getLength!)
		# let result = Compiler.compile(info,body)
		# result.input = snap
		return output.compile!

		
	get snapshot
		svc.getSnapshot!
	
	get content
		let snap = svc.getSnapshot!
		return snap.getText(0,snap.getLength!)
			
	get fileName
		info.fileName
		
	get ls
		project.languageService
		
	get project
		let projs = info.containingProjects
		if projs.indexOf(global.ils.cp) >= 0
			return global.ils.cp
		return projs[0]
		
	def wake
		yes
		
	def didSave
		try
			let snap = snapshot
			snap.#saved = yes
			if lastCompilation..input == snap
				util.log 'saved compilation that was already applied',lastCompilation
				syncDts!
		yes
		
	def getTypeChecker sync = no
		try
			let project = project
			let program = project.program
			let checker = program.getTypeChecker!
			return new ImbaTypeChecker(project,program,checker,self)

		
	def getSemanticTokens
		let result\number[] = []
		let typeOffset = 8
		let modMask = (1 << typeOffset) - 1
		
		for tok,i in doc.tokens when tok.symbol
			let sym = tok.symbol
			let typ = TokenType.variable
			let mod = 0
			let kind = sym.semanticKind
			if TokenType[kind] != undefined
				typ = TokenType[kind]
				
			if sym.global?
				mod |= 1 << TokenModifier.defaultLibrary
			
			if sym.static?
				mod |= 1 << TokenModifier.static
			
			if sym.imported? or sym.root?
				typ = TokenType.namespace

			result.push(tok.offset, tok.endOffset - tok.offset, ((typ + 1) << typeOffset) + mod)
		
		# util.log("semantic!",result)
		return result
		
	def getCompletions pos, options
		let ctx = new Completions(self,pos,options)
		return ctx		
	
	def getCompletionsAtPosition ls, [dpos,opos], prefs
		return null
		
	def getContextAt pos
		# retain context?
		new ImbaScriptContext(self,pos)
	
	def resolveModuleName path
		let res = project.resolveModuleNames([path],fileName)
		return res[0] and res[0].resolvedFileName
		
	def resolveImport path, withAssets = no
		global.ts.resolveImportPath(path,fileName,project,withAssets).resolvedModule..resolvedFileName
		
	def getInfoAt pos, ls
		let ctx = doc.getContextAtOffset(pos)
		let out = {}

		if ctx.after.token == '' and !ctx.before.character.match(/\w/)
			if ctx.after.character.match(/[\w\$\@\#\-]/)
				ctx = doc.getContextAtOffset(pos + 1)
		
		let g = null
		let grp = ctx.group
		let tok = ctx.token or {match: (do no)}
		let checker = getTypeChecker!

		util.log('context for quick info',ctx)
		
		out.textSpan = tok.span
		
		let hit = do(sym,typ)
			if typ
				out[typ] = sym
			out.sym ||= sym
		
		# likely a path?
		if ctx.suggest.Path
			let str = tok.value
			out.resolvedPath = util.resolveImportPath(fileName,str)
			out.resolvedModule = resolveImport(str,yes)
			
		if ctx.tagName
			out.tag = checker.getTagSymbol(ctx.tagName,yes)
			
		if ctx.tagAttrName and out.tag
			out.tagattr = checker.getTagAttrSymbol(ctx.tagName,ctx.tagAttrName)
			# util.log('get tagattgr?!',ctx.tagAttrName,ctx.tagName,tok,ctx)
			# let taginst = checker.getTagSymbolInstance(ctx.tagName,yes)
			# out.tagattr = checker.sym([taginst,util.toJSIdentifier(ctx.tagAttrName)])

		# special description!!
		

		if tok.match("style.property.modifier style.selector.modifier")
			let [m,pre,neg,post] = tok.value.match(/^(@|\.+)(\!?)([\w\-\d]*)$/)
			util.log("style prop modifier",[m,pre,neg,post,tok],post.match(/^\d+$/))

			if pre == '@' or pre == ''
				out.sym ||= checker.styleprop('@'+post)

			if post.match(/^\d+$/)
				util.log("this is a numeric thing(!!!)",tok)
		
		if tok.match('style.value.unit')
			hit(checker.getTokenMetaSymbol(tok) or tok,'unit')
				
		elif g = grp.closest('stylevalue')
			let idx = (ctx..before..group or '').split(' ').length - 1
			let alternatives = checker.stylevalues(g.propertyName,0)
			let name = tok.value.tojs!
			let match = alternatives.find do $1.escapedName == name
			
			# add generic lookups for colors etc
			if match
				hit(match,'stylevalue')

		if tok.match('style.value.var')
			let m = checker.getStyleVarTokens().filter do $1.value == tok.value
			if m[0]
				hit(m[0],'stylevalue')

		

		if tok.match('style.property.var')
			# util.log("matching!!",tok,checker.getSymbolInfo(tok),tok isa ImbaToken)
			hit(tok,'styleprop')
		
		if g = grp.closest('styleprop')
			hit(checker.styleprop(g.propertyName,yes),'styleprop')
			# out.sym ||= checker.sym([checker.cssrule,g.propertyName])
		
		if tok.match('tag.event.start')
			tok = tok.next
			
		if tok.match('tag.event-modifier.start')
			tok = tok.next
			
		if tok.match('tag.event-modifier.name')
			hit(checker.getEventModifier(ctx.eventName,tok.value),'eventmod')

		if tok.match('tag.event.name')
			let name = tok.value.replace('@','')
			hit(checker.sym("ImbaEvents.{name}"),'event')

			# out.sym ||= 
		
		if tok.match('tag.name')
			# out.sym = out.tag
			out.sym = checker.getTokenMetaSymbol(tok) or out.tag
		
		if tok.match('tag.attr') and out.tag
			out.sym = out.tagattr
			
		if tok.match('white keyword')
			return {info: {}}

		hit(checker.getTokenMetaSymbol(tok),'meta')
		hit(checker.getMetaSymbol(tok.type),'concept')
		
			
		if out.sym
			out.info ||= checker.getSymbolInfo(out.sym)
		
		if out.info
			out.info.textSpan ||= tok.span

			if out.concept and out.sym != out.concept
				let extra = checker.getSymbolInfo(out.concept)
				out.extra = extra
				out.info.documentation = out.info.documentation.concat([{text: '\n\n',type: 'markdown'}],extra.documentation)

		if out.sym..isMetaSymbol
			out.info.definitions ||= []

		# util
		util.log('getInfoAt',out)
		return out
		
	def getDefinitionAndBoundSpan pos, ls
		let out = getInfoAt(pos,ls)
		
		if out.resolvedModule
			return {
				definitions: [{
					fileName: out.resolvedModule
					textSpan: {start: 0, length: 0}
				}]
				textSpan: out.textSpan
			}
		elif out.info..definitions
			return out.info
			
		else
			# if out..definitions
			return out
			
		
	def getQuickInfo pos, ls
		try
			let out = getInfoAt(pos,ls)
			
			if out.info
				return out.info
		return null
		
	def getSignatureHelpItems pos, opts, ls
		let ctx = doc.getContextAtOffset(pos)
		let res = null
		
		if ctx.parens and ctx.eventModifierName
			let name = ctx.eventModifierName
			let checker = getTypeChecker!
			let meth = checker.getEventModifier(ctx.eventName,name)
			if meth
				name = "@{ctx.eventName}.{ctx.eventModifierName}".replace(".options","")
				res = checker.getSignatureHelpForType(meth,name)
			
		if !res and ctx.token.match('parens') and ctx.token.value == '('
			let checker = getTypeChecker!
			util.log 'get the context!!'
			let meth = checker.resolveType(ctx.token.prev)
			util.log "inferred type!",meth
			let name = meth..symbol..escapedName
			res = checker.getSignatureHelpForType(meth,name)
			
		if res
			res.applicableSpan = {start: pos, length: 0, #ostart: -1}
			return res
			
		return null