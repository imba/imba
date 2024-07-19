# extend scriptInfo
import fs from 'fs'
import * as util from './util'

import { TokenModifier, TokenType } from './constants'
import {Compilation} from './compiler'

# import ImbaScriptInfo from './lexer/script'
import ImbaScriptInfo, {Token as ImbaToken} from 'imba-monarch'
import Completions from './completions'
import ImbaScriptContext from './context'
import ImbaTypeChecker from './checker'

import {createEdits} from './diff'

export default class ImbaScript
	constructor info
		self.nr = ++global.ils.counter
		self.info = info
		self.diagnostics = []
		self.saveCompiledOutput = no
		self.lastEdits = []
		global.hasImbaScripts = yes

		if info.scriptKind == 0
			info.scriptKind = 3

	get ils
		global.ils

	get js
		lastCompilation..js

	def log ...params
		util.log("SCRIPT:",shortName,...params)

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
		log('openedWithContent',content..slice(0,10))
		self.openedContent = content
		if content != self.content
			log('replace content?',[content,doc.content,self.content])
			replaceContent(content)

	def getFromDisk
		fs.readFileSync(fileName,'utf-8')
		

	def setup
		let orig = info.textStorage.text
		originalsvc = info.textStorage.svc
		log("setup",orig..slice(0,12))
		if orig == undefined
			orig = getFromDisk!
		# console.log("Hello")

		# Creating a ScriptVersionCache for the imba version of file
		# info.textStorage should always mirror the compiled output
		svc = global.ts.server.ScriptVersionCache.fromString(orig or '')
		svc.currentVersionToIndex = do this.currentVersion
		svc.versionToIndex = do(number) number

		ils.set-status(text: "$(sync~spin) {shortName}",autohide:100ms)

		doc = new ImbaScriptInfo(self,svc)

		# how do we handle if file changes on disk?

		# This is very tricky as we are representing the files as two different ones
		try
			# compile immediately upon setup
			# if this was cached across sessions - opening a big project would be _much_ faster
			let result = lastCompilation = compile!
			# apply the compilation now?
			let its = info.textStorage

			# Here we are replacing the ScriptVersionCache for the file as tsc sees it
			log('override textStorage.svc')
			# Why are we forcing it to start with scriptVersionCache at all?
			let snap = its.svc = global.ts.server.ScriptVersionCache.fromString(result.js or '\n')

			# Maybe set the text content here directly?
			# How do we juggle back and forth between text and other cache?
			its.text = undefined

			let {getFileTextAndSize,reloadWithFileText,reload} = its

			its.reloadWithFileText = do(tempFileName)
				log('reloadWithFileText',tempFileName,this,this.ownFileText,this.pendingReloadFromDisk,this.isOpen)
				if !tempFileName and !this.isOpen
					let body = getFromDisk!
					# the underlying imba code has actually changed
					log('reloadWithFileText content?',[body,doc.content,content])
					# what if it is open?
					if body != content
						replaceContent(body)
				# return false
				return reloadWithFileText.call(its,tempFileName)

			its.getFileTextAndSize = do(tempFileName)
				let sup = getFileTextAndSize.call(its,tempFileName)
				log('getFileTextAndSize',tempFileName,sup)
				return {text: lastCompilation..js or ''}
				# should return the old value here?
				# {text: lastCompilation..js or ''}

			its.reload = do(newText)
				log('reload',[newText],lastCompilation..js == newText,content === newText)
				# dont do this when the reloaded content is imba.
				reloadedContent = newText
				its.pendingReloadFromDisk = false
				return false

				# Trying to reload with typescript
				if newText..indexOf('export {};String();') == 0
					return reload.call(its,newText)
				else
					return true

			# util.log('resetting the original file',snap)

			snap.getSnapshot!.mapper = result
			info.markContainingProjectsAsDirty!
		catch e
			log('setup error',e,self)
		#setup = yes
		return self

	def lineOffsetToPosition line, offset, editable
		svc.lineOffsetToPosition(line, offset, editable)

	def positionToLineOffset pos
		svc.positionToLineOffset(pos)

	def asyncCompile
		let t0 = Date.now!
		let snap = svc.getSnapshot!
		let body = snap.getText(0,snap.getLength!)
		ils.set-status(text: "$(sync~spin) Analyzing {shortName}")
		let output = new Compilation(info,snap)
		output.compile!
		log(`asyncCompiled`,(Date.now! - t0) + 'ms',output..js..length)
		applyOutput(output)
		ils.set-status(text: "$(sync~spin) Analyzing {shortName}",autohide:250ms)

	get currts
		info.cacheSourceFile.sourceFile.text

	def forceSync
		let js = lastCompilation.js
		info.textStorage.edit(0,currts.length,js)
		info.markContainingProjectsAsDirty!

	def applyOutput result
		lastCompilation = result
		diagnostics = result.diagnostics

		if let js = result.js
			let its = info.textStorage

			let meta = result.applied = {}

			let curr = meta.cached = currts
			let oldsnap = its.svc.getSnapshot!
			let end = oldsnap.getLength!

			try
				if oldsnap.mapper
					curr = oldsnap.mapper.js
					meta.lcprev = curr

				meta.tsbefore = curr = oldsnap.getText(0,end)
				meta.oldend = end

				let edits = try createEdits(curr,js)
				log('compiled',end,its,edits)
				meta.edits = edits

				if edits
					for [start,end,str] in edits
						its.edit(start, end, str)
				else
					its.edit(0, end, result.js)
				meta.edited = yes
				# just repacing the whole thing now?
				# Should much rather diff it and fake the edits
				let snap = its.svc.getSnapshot!
				try meta.after = snap.getText(0,snap.getLength!)

				# potential for memory leak - should clean up
				snap.mapper = result
				result.#applied = yes
				# check if we are out of sync

				info.markContainingProjectsAsDirty!
				let isSaved = result.input.#saved
				# util.log('onDidCompileScript',result,isSaved)

				if ils.isSemantic and global.session
					global.session..refreshDiagnostics!

				if ils.config.debugLevel >= 3
					fs.writeFileSync(fileName + '.its',result.js)
			catch e
				log('error applying ts',e)
				meta.error = e

		else
			log('errors from compilation!!!',result)
			diagnostics=result.diagnostics
			global.session..refreshDiagnostics!
		self

	def syncDts
		return

	def getImbaDiagnostics

		let mapper = lastCompilation
		let entries = mapper.diagnostics
		let diags = []

		if mapper.input.#saved
			log('imba diagnostics saved!')
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

	# Edit content of the imba file
	def editContent start, end, newText
		let delay = 250

		lastEdits.unshift([start,end,newText,Date.now!])
		
		svc.edit(start,end - start,newText)
		let last = lastCompilation
		# this should just start asynchronously instead
		if ils.isSemantic
			
			# shorter delay for the files that compile quickly
			if last and last.took < 20
				delay = 100

			# if we wrote more than one character
			if newText.length > 1
				delay = 10
			# should probably speed up compilation for certain types of edits?
			util.delay(self,'asyncCompile',delay)
		log('editContent imba',start,end,newText,self,delay)

	# Replace content of the imba file
	def replaceContent newText
		let from = content
		let snap = svc.getSnapshot!
		log('replacing content',fileName,from,newText,from.length,newText.length)
		if newText != from
			svc.edit(0,from.length,newText)
			svc.getSnapshot!
			doc.tokens
			log('replaced content',[newText,doc.content,content])
			if ils.isSemantic
				# should probably speed up compilation for certain types of edits?
				util.delay(self,'asyncCompile',250)

	def compile
		let snap = svc.getSnapshot!
		let output = new Compilation(info,snap)
		return output.compile!

	get snapshot
		svc.getSnapshot!

	get content
		let snap = svc.getSnapshot!
		return snap.getText(0,snap.getLength!)

	get fileName
		info.fileName

	get shortName
		fileName.slice(fileName.lastIndexOf('/'))

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
				log 'saved compilation that was already applied',lastCompilation
				# syncDts!

			ils.syncProjectForImba(project)
		yes

	def getTypeChecker sync = no
		try
			let project = project
			let program = project.program
			let checker = program.getTypeChecker!
			return new ImbaTypeChecker(project,program,checker,self)

	get checker
		$checker ||= getTypeChecker()

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

		log("got semantic tokens",result)
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

		log('getInfoAt',ctx)

		out.textSpan = tok.span

		let hit = do(sym,typ)
			if typ
				out[typ] = sym
			out.sym ||= sym

		# likely a path?
		if ctx.suggest.Path
			let str = tok.value.split('?')[0]
			out.resolvedPath = util.resolveImportPath(fileName,str)
			# out.resolvedModule = resolveImport(str,yes)
			# return null

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
			log("style prop modifier",[m,pre,neg,post,tok],post.match(/^\d+$/))

			if pre == '@' or pre == ''
				out.sym ||= checker.styleprop('@'+post)

			if post.match(/^\d+$/)
				log("this is a numeric thing(!!!)",tok)

		if tok.match('style.value.unit style.property.unit')
			hit(checker.getTokenMetaSymbol(tok) or tok,'unit')

		# if tok.match('style.value.unit style.property.unit')
		#	hit(checker.getTokenMetaSymbol(tok) or tok,'unit')

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

		if tok.match('style.value.colorvar')
			# only include this name?
			let m = checker.getStyleColorVarTokens().filter do $1.value == tok.value
			if m[0]
				hit(m[0],'stylevalue')

		if tok.match('tag.mixin.name')
			# let m = doc.getMatchingTokens('style.selector.mixin.name').filter do $1.value == tok.value
			# hit(m[0],'mixin') if m[0]
			hit(tok,'mixin')
			# util.log("matching mixin??!",m)
			# script.doc.getMatchingTokens(type)

		if tok.match('style.selector.mixin.name')
			hit(tok,'mixin') # we should drop the prefix as a concept now

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

		if tok.match('tag.name')
			out.sym = checker.getTokenMetaSymbol(tok) or out.tag

		if tok.match('tag.attr') and out.tag
			out.sym = out.tagattr

		if tok.match('white keyword')
			return {info: {}}

		try
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
		log('getInfoAt',out)
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
				out.info.textSpan = out.textSpan
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
			log 'get the context!!'
			let meth = checker.resolveType(ctx.token.prev)
			log "inferred type!",meth
			let name = meth..symbol..escapedName
			res = checker.getSignatureHelpForType(meth,name)

		if res
			res.applicableSpan = {start: pos, length: 0, #ostart: -1}
			return res

		return null