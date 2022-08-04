import { lexer, Token, LexedLine } from './lexer'
import {prevToken, fastExtractSymbols, toImbaIdentifier} from './utils'
import { Root, Scope, Group, ScopeTypeMap } from './scope'
import { Sym, SymbolFlags } from './symbol'

import {SemanticTokenTypes,M,CompletionTypes,Keywords} from './types'

import {ScriptVersionCache} from './svc'
import {Range, Position} from './structures'

###
line and character are both zero based
###
export default class ImbaScriptInfo

	def constructor owner,svc
		owner = owner
		
		if typeof svc == 'string'
			svc = ScriptVersionCache.fromString(svc)

		svc = svc
		seed = new Token(0,'eol','imba')
		eof = new Token(0,'eof','imba')
		initialState = lexer.getInitialState!
		isLegacy = no
		history = []
		#lexed = {lines:[],typeMatchCache:{}}
		self.lexer = lexer
		
	def sync
		yes

	def reload text
		yes

	def log ...params
		yes
		
	get snapshot
		svc.getSnapshot!
		
	get index
		snapshot.index
		
	get content
		#lexed.content ||= getText!
	
	def getText start = 0, end = snapshot.getLength!
		if typeof start.start == 'number'
			end = start.start + start.length
			start = start.start

		snapshot.getText(start,end)

	def after token, match
		let idx = tokens.indexOf(token)
		if match
			while idx < tokens.length
				let tok = tokens[++idx]
				if tok && matchToken(tok,match)
					return tok
			return null
		return tokens[idx + 1]

	def matchToken token, match
		if match isa RegExp
			return token.type.match(match)
		elif typeof match == 'string'
			return token.type == match
		return false
	
	def before token, match, offset = 0
		let idx = tokens.indexOf(token) + offset
		if match
			while idx > 0
				let tok = tokens[--idx]
				
				if matchToken(tok,match)
					return tok
			return null
		return tokens[idx - 1]

	def getTokensInScope scope
		let start = tokens.indexOf(scope.start)
		let end = scope.end ? tokens.indexOf(scope.end) : tokens.length
		let i = start
		let parts = []
		while i < end
			let tok = tokens[i++]
			if tok.scope and tok.scope != scope
				parts.push(tok.scope)
				i = tok.scope.endIndex + 1
			else
				parts.push(tok)
		return parts
		
	def getSymbols
		astify!
		#lexed.symbols ||= tokens.map(do $1.symbol).filter(do $1).filter(do(sym,i,arr) arr.indexOf(sym) == i)
		
	def getImportedSymbols
		getSymbols!.filter do $1.imported?
			
	def getImportNodes
		let tokens = tokens.filter do $1.match('push._imports')
		return tokens.map do $1.scope
		
	def getNodesInScope scope,includeEnds = no,includeWhitespace = no
		astify!
		scope ||= #lexed.root
		let tok = scope.start
		let end = scope.end # ? tokens.indexOf(scope.end) : tokens.length
		
		if includeEnds
			end &&= end.next
		else
			tok = tok.next

		let parts = []
		while tok and tok != end
			if tok.scope and tok.scope != scope
				parts.push(tok.scope)
				continue tok = tok.scope.end.next
			elif tok.type != 'white' or includeWhitespace
				parts.push(tok)
			tok = tok.next

		return parts

	def getTokenAtOffset offset,forwardLooking = no
		return tokenAtOffset(offset)

	def getSemanticTokens filter = SymbolFlags.Scoped
		let tokens = parse!
		let items = []

		for tok,i in tokens
			let sym = tok.symbol
			continue unless sym and (!filter or sym.flags & filter)
			let typ = SemanticTokenTypes[sym.semanticKind]
			let mods = tok.mods | sym.semanticFlags

			items.push([tok.offset,tok.value.length,typ,mods])
		return items

	def getDestructuredPath tok, stack = [], root = null
		if tok.context.type == 'array'
			getDestructuredPath(tok.context.start,stack,root)
			stack.push(tok.context.indexOfNode(tok))
			return stack
		
		let key = tok.value
		
		if tok.prev.match("operator.assign.key-value")
			key = tok.prev.prev.value
		if tok.context.type == 'object'
			getDestructuredPath(tok.context.start,stack,root)
			stack.push(key)
			# p 'in object!',tok
		return stack

	def tokenAtOffset offset
		let tok = tokens[0]
		while tok
			let next = tok.next
			if tok.offset >= offset
				return tok.prev 
			
			# jump through scopes
			if tok.end and tok.end.offset < offset
				# console.log 'jumping',tok.offset,tok.end.offset
				tok = tok.end
			elif next
				tok = next
			else
				return tok
		return tok

	def patternAtOffset offset, matcher = /[\w\-\.\%]/
		let from = offset
		let to = offset
		let str = content

		while from > 0 and matcher.test(content[from - 1])
			from--

		while matcher.test(content[to + 1] or '')
			to++

		let value = str.slice(from,to + 1)
		return [value,from,to]

	def adjustmentAtOffset offset,amount = 1
		let [word,start,end] = patternAtOffset(offset)
		let [pre,post = ''] = word.split(/[\d\.]+/)

		let num = parseFloat(word.slice(pre.length).slice(0,post.length ? -post.length : 1000))
		if !Number.isNaN(num)
			num += amount
			return [start + pre.length,word.length - pre.length - post.length,String(num)]
		return null
		
	def expandSpanToLines span
		try
			let start = index.positionToColumnAndLineText(span.start)
			let end = index.positionToColumnAndLineText(span.start + span.end)
			span.start = span.start - start.zeroBasedColumn
			span.length = span.length + start.zeroBasedColumn
		catch e
			# console.error e
			let text = content
			let chr
			while true
				chr = text[span.start]
				break if !chr or chr == '\n'
				span.start--

			
			yes
		return span
	
	def contextAtOffset offset
		ensureParsed!

		let tok = tokenAtOffset(offset)
		let tokPos = offset - tok.offset
		let tokval = tok.value or ''

		let lineInfo = index.positionToColumnAndLineText(offset)
		let lineText = lineInfo.lineText
		
		if lineText == undefined
			lineText = index.lineNumberToInfo(lineInfo.oneBasedLine).lineText
			
		let col = lineInfo.zeroBasedColumn

		let ctx = tok.context
		let content = index.getText(0,index.getLength!)
		# console.log 'context',offset,tok

		const before = {
			character: lineText[col - 1] or ''
			line: lineText.slice(0,col)
			token: tokval.slice(0,tokPos)
		}

		const after = {
			character: lineText[col]
			token: tokval.slice(tokPos)
			line: lineText.slice(col).replace(/[\r\n]+/,'')
		}

		const around = {
			character: [before.character,after.character]
			token: [before.token,after.token]
			line: [before.line,after.line]
			
		}

		# if the token pushes a new scope and we are at the end of the token
		if tok.scope and !after.token
			ctx = tok.scope
			# are we are the beginning of a scope?
			
		if tok.next
			if tok.next.value == null and tok.next.scope and !after.token and tok.match('operator.assign')
				ctx = tok.next.scope
				# console.log 'changed scope!!!',ctx,ctx.scope
	
		let tabs = prevToken(tok,"white.tabs")
		let indent = tabs ? tabs.value.length : 0
		let group = ctx
		let scope = ctx.scope
		let meta = {}
		let target = tok
		let mstate = tok.stack..state or ''
		let t = CompletionTypes
		let g = null
		let contextTokens = [tok]


		if group
			if group.start
				before.group = content.slice(group.start.offset,offset)
			if group.end
				after.group = content.slice(offset,group.end.offset)

		let suggest = {
			keywords: []
		}
		let flags = 0

		if tok == tabs
			indent = tokPos
		
		if tok.match('br white.tabs')
			while scope.indent > indent
				scope = scope.parent
		
		try
			meta.selfScope = tok.context.selfScope
			meta.selfPath = meta.selfScope.selfPath
		if group.type == 'tag'
			# let name = group.findChildren('tag.name')
			# group.name = name.join('')
			yes

		if tok.match('entity string regexp comment style.')
			flags = 0
		
		# if we are at a a single #
		if tok.match('comment') and before.token == '#' and after.line == ''
			flags = CompletionTypes.Access
			suggest.prefix = '#'
			target = null
			
			if tok.prev and tok.prev.match('operator.access')
				flags = CompletionTypes.Access
				target = tok.prev
		
		# if we are in an accessor
		if g = group.closest('tag')
			meta.tagName = g.tagName
			contextTokens.push(g.nameNode)
			
		if g = group.closest('tagattr')
			meta.tagAttrName = g.propertyName
		
		if g = group.closest('listener')
			let parens = group.closest('parens')
			meta.eventName = g.name
			
			if parens and parens.parent == g
				let prev = parens.start.prev
				if prev.match('tag.event-modifier.name')
					meta.eventModifierName = prev.value
				elif prev.match('tag.event.name')
					meta.eventModifierName = 'options'
				meta.parens = parens
		
		if tok.match('decorator')
			flags = CompletionTypes.Decorator

		if tok.match('tag.event.name tag.event-modifier.name')
			target = tok.prev

		if tok.type == 'path' or tok.type == 'path.open'
			flags |= CompletionTypes.Path
			suggest.paths = 1
			
		if tok.type == 'string'
			if tok.value.match(/^\.\.?\/|\.(svg|html|jpe?g|gif|a?png|avif|webp)$/)
				flags |= CompletionTypes.Path
				suggest.paths = 1
			
			if meta.tagAttrName == 'src' and meta.tagName..match(/^(script|style|img|svg|link)$/)
				flags |= CompletionTypes.Path
				

		if tok.match('identifier tag.operator.equals br white delimiter array operator ( self')
			flags |= CompletionTypes.Value
			target = null

		if tok.match('operator.access')
			flags |= CompletionTypes.Access
			target = tok
			
		if tok.match('accessor')
			flags |= CompletionTypes.Access
			target = tok.prev

		if tok.match('style.property.var')
			flags |= CompletionTypes.StyleVar
			
		if tok.match('tag.name tag.open')
			flags |= CompletionTypes.TagName
		elif tok.match('tag.attr tag.white')
			flags |= CompletionTypes.TagProp
			
		elif tok.match('tag.flag')
			flags |= CompletionTypes.TagFlag
		elif tok.match('tag.event-modifier')
			flags |= CompletionTypes.TagEventModifier
		elif tok.match('tag.event')
			flags |= CompletionTypes.TagEvent
		
		elif tok.match('operator.equals.tagop')
			flags |= CompletionTypes.Value

		if tok.match('style.property.operator') or group.closest('stylevalue')
			flags |= t.StyleValue
			try
				suggest.styleProperty = group.closest('styleprop').propertyName

		if tok.match('style.open style.property.name')
			flags |= t.StyleProp

		if tok.match('style.value.white') or (tok.prev and tok.prev.match('style.value.white'))
			flags |= t.StyleProp

		if tok.match('style.selector.element') and after.line.match(/^\s*$/)
			flags |= t.StyleProp
			
		if scope.closest('rule')
			flags ~= t.Value
			
			if tok.match('white')
				flags |= t.StyleProp
							
		if tok.match('style.selector.class-name')
			flags |= t.TagFlag
			
		if tok.match('style.selector.id')
			flags |= t.TagId
			
		if tok.match('style.property.operator')
			flags ~= t.StyleProp
			
		if group.match('stylevalue') && before.group.indexOf(' ') == -1
			flags = t.StyleValue
			
		if tok.match('style.selector.modifier style.property.modifier')
			flags = t.StyleModifier
			suggest.stylemodRange = [tok.offset,tok.endOffset]
			
		if tok.match('style.selector.element')
			flags |= t.StyleSelector
		
		if scope.closest('rule') and before.line.match(/^\s*$/)
			flags |= t.StyleSelector
			flags ~= t.StyleValue

		if tok.match('style.value') and before.token[0] == '$'
			flags |= t.StyleVar
			
		if tok.match('operator.access accessor white.classname white.tagname')
			flags ~= t.Value
			
		if group.closest('imports')
			flags ~= t.Value
			flags |= t.ImportName
			
		if mstate.match(/\.decl-(let|var|const|param|for)/) or tok.match(/\.decl-(for|let|var|const|param)/)
			flags ~= t.Value
			flags |= t.VarName
			
		if tok.match("delimiter.type.prefix type") or group.closest('type')
			flags = CompletionTypes.Type

		let kfilter = scope.allowedKeywordTypes
		suggest.keywords = for own key,v of Keywords when v & kfilter
			key
			
		if group.class? and before.line.match(/^\t*[a-z]*$/)
			flags ~= t.Value
			flags |= t.ClassBody
			if group.component?
				flags |= t.ComponentBody

		suggest.flags = flags
		
		for own k,v of t
			if flags & v
				suggest[k] ||= yes

		let out = {
			...meta,
			token: tok
			offset: offset
			scope: scope
			indent: indent
			group: ctx
			mode: ''
			target: target
			path: scope.path
			suggest: suggest
			before: before
			after: after
			around: around
		}

		return out
	
	def textBefore offset
		let before = content.slice(0,offset)
		let ln = before.lastIndexOf('\n')
		return before.slice(ln + 1)

	def varsAtOffset offset, globals? = no
		let tok = tokenAtOffset(offset)
		let vars = []
		let scope = tok.context.scope
		let names = {}

		while scope
			for item in Object.values(scope.varmap)
				continue if item.global? and !globals?
				continue if names[item.name]

				if !item.node or (item.node.offset < offset)
					vars.push(item)
					names[item.name] = item

			scope = scope.parent
		return vars

	def getOutline walker = null

		if isLegacy
			let symbols = fastExtractSymbols(content)
			for item in symbols.all
				delete item.parent
				item.path = item.name
				item.name = item.ownName
				walker(item,symbols.all) if walker
			return symbols

		ensureParsed!
		let t = Date.now!
		let raw = content
		let all = []
		let root = {
			childItems: [],
			kind: 'module',
			kindModifiers: '',
			text: JSON.stringify(owner.fileName.split('/').pop()),
			spans: [{start: 0, length: content.length}]
		}

		let curr = root
		let scop = null
		let last\any = {}
		let symbols = new Set
		let awaitScope = null
		
		def shrinkSpan span
			let s = span.start
			let k = s + span.length - 1
			while k > s and (raw[k] == '\n' or raw[k] == '\t')
				--k
			span.length = (k - s)
			return span
				

		def add item,tok
			if item isa Sym
				let sym = item
				symbols.add(item)
				item = {
					text: item.name
					kind: item.outlineKind
					kindModifiers: ""
				}
				if sym.body..scope?
					item.spans = [sym.body.span]

			elif item isa Group
				symbols.add(item)
				item = item.toOutline()

			last = item
			item.#token = tok
			item.childItems ||= []
			item.nameSpan ||= tok.span
			item.kindModifiers ||= ''
			item.text ||= tok.value
			item.spans ||= [item.nameSpan]
			all.push(item)
			curr.childItems.push(item)

		def push end
			last.childItems ||= []
			last.#parent ||= curr
			curr = last
			curr.#end = end
			
		def spanEnd span
			span.start + span.length

		def pop tok
			let currSpan = curr.spans[0]
			let start = Math.min(curr.nameSpan.start,currSpan.start)
			let end = Math.max(spanEnd(curr.nameSpan),spanEnd(currSpan),tok.endOffset)
			curr.spans = [shrinkSpan({start: start, length: end - start})]
			curr = curr.#parent

		for token,i in tokens
			let sym = token.symbol
			let scope = token.scope

			if token.type == 'key'
				add({kind:'property'},token)
			elif sym
				continue if sym.parameter?
				
				if sym.variable? and sym.node != token
					continue

				if !symbols.has(sym)
					add(sym,token)
					if sym.body
						awaitScope = sym.body.start

			elif scope
				if scope.type == 'do'
					let pre = textBefore(token.offset - 3).replace(/^\s*(return\s*)?/,'')
					pre += " callback"
					add({kind:'function',text:pre,kindModifiers: 'null'},token.prev)
					awaitScope = token
			
				elif scope.type == 'tag'
					add(scope,token)
				elif scope.type == 'tagcontent'
					push(scope.end)

			if token == awaitScope
				push(token.end)
			
			if token == curr.#end
				pop(token)
				
		while curr and curr != root
			pop(eof)

		for item in all
			if !item.spans
				item.spans = [item.nameSpan]
			# if item.span
			# 	let len = item.span.length
			# 	# item.span.start = positionAt(item.span.offset)
			# 	# item.span.end = len ? positionAt(item.span.offset + len) : item.span.start
			
			# make sure the containing span of all items always encompass their parent?
			
			if walker
				walker(item,all)
			# delete item.parent
			# delete item.end
			# delete item.token
		# console.log 'outline took',Date.now! - t
		return root

	def getContextAtOffset offset, forwardLooking = no
		return contextAtOffset(offset)

	def ensureParsed
		parse! # if self.head.offset == 0
		return self


	def tokenize force = no
		# return tokenize! unless #lexed
		let from = #lexed
		let snap = svc.getSnapshot!
		
		if from.snapshot == snap and !force
			return from

		let index = snap.index
		let lineCount = index.getLineCount!
		let tokens = []
		let t0 = Date.now!
		let nextState = initialState

		#lexed = {
			lines: []
			tokens: tokens
			snapshot: snap
			typeMatchCache: {}
		}
		
		let lineCache = {}
		
		#lexed.cache = lineCache
		
		for line in from.lines
			let item = (lineCache[line.text] ||= [])
			item.push(line)
			line

		let lineNr = 0
		
		while lineNr < lineCount

			let line = index.lineNumberToInfo(++lineNr)
			
			let str = line.lineText
			let lineOffset = line.absolutePosition
			let startState = nextState
			
			if isLegacy
				str = str.replace(/\@\w/g) do(m) '¶' + m.slice(1)
				str = str.replace(/\w\:(?=\w)/g) do(m) m[0] + '.'
				str = str.replace(/(do)(\s?)\|([^\|]*)\|/g) do(m,a,space,b)
					a + '(' + (space or '') + b + ')'
			
			let cached = lineCache[str]
			let matches = cached and cached.filter do(item) item.startState == startState
			let match = matches and (matches.find(do $1.offset == lineOffset) or matches[0])
			let lexed = null

			if match
				if match.offset == lineOffset
					lexed = match.clone(lineOffset)
				else
					lexed = match.clone(lineOffset)

			unless lexed
				# console.log 'need to reparse line',[str,startState],match
				let run = lexer.tokenize(str,startState,lineOffset)
				lexed = new LexedLine(
					offset: lineOffset,
					text: str,
					startState: startState,
					endState: run.endState,
					tokens: run.tokens
				)

			for tok,ti in lexed.tokens
				tokens.push(tok)
			
			#lexed.lines.push(lexed)
			nextState = lexed.endState
		
		eof.offset = index.getLength!
		return #lexed
	
	get tokens
		astify!
		return #lexed.tokens
		
	get root
		astify!
		return #lexed.root
		
		
	# This is essentially the tokenizer
	def getTokens range = null
		return self.tokens

	def astify
		# now walk the whole token-stream
		let t0 = Date.now!
		let lexed = tokenize!
		return self if lexed.root
		
		const pairings = {']': '[', ')': '(', '}': '{', '>': '<'}
		const openers = {'[': ']','(': ')','{': '}','<': '>'}
		const callAfter = /[\w\$\)\]\?]/

		# let t0 = Date.now!
		let entity = null
		let scope\any = lexed.root = new Root(self,seed,null,'root')
		let root = scope
		
		
		let log = do yes
		let lastDecl = null
		let lastVarKeyword = null
		let lastVarAssign = null
		let prev = seed
		let entityFlags = 0
		
		for tok,ti in lexed.tokens
			let types = tok.type.split('.')
			let value = tok.value
			let nextToken = lexed.tokens[ti + 1]
			let [typ,subtyp,sub2] = types
			let ltyp = types[types.length - 1]
			let styp = types[types.length - 2]
			
			let scopeType = null
			let decl = 0

			if typ == 'ivar'
				value = tok.value = '@' + value.slice(1)

			if prev
				prev.next = tok
				
			tok.prev = prev
			let currScope = tok.context = scope

			if typ == '(' and prev
				# hack [tok.offset - 1]
				let prevchr = lexed.snapshot.getText(tok.offset - 1, tok.offset) or ''
				if callAfter.test(prevchr)
					scope = tok.scope = ScopeTypeMap.args.build(self,tok,scope,'args',types)

			if typ == 'operator'
				tok.op = tok.value.trim!

			if typ == 'keyword'
				if M[subtyp]
					entityFlags |= M[subtyp]
				if value == 'let' or value == 'const'
					lastVarKeyword = tok
					lastVarAssign = null
			
			if typ == 'entity'
				tok.mods |= entityFlags
				entityFlags = 0

			if typ == 'push'
				let scopetype = subtyp
				let idx = subtyp.lastIndexOf('_')
				
				let ctor = idx >= 0 ? Group : Scope

				if idx >= 0
					scopetype = scopetype.slice(idx + 1)
					ctor = ScopeTypeMap[scopetype] || Group
				elif ScopeTypeMap[scopetype]
					ctor = ScopeTypeMap[scopetype]

				scope = tok.scope = new ctor(self,tok,scope,scopetype,types)
				
				let lastDecl = currScope.lastDecl
				if lastDecl
					# only for certain types of scopes?
					lastDecl.body = scope
					scope.symbol = lastDecl
					currScope.lastDecl = null

				if scope == scope.scope
					lastVarKeyword = null
					lastVarAssign = null

			elif typ == 'pop'
				if subtyp == 'value'
					lastVarAssign = null
				
				scope = scope.pop(tok)
			
			elif (subtyp == 'open' or openers[subtyp]) and ScopeTypeMap[typ]
				
				scope = tok.scope = ScopeTypeMap[typ].build(self,tok,scope,typ,types)
				# if subtyp == '('
				#	console.log 'paren!!!',typ,subtyp,ScopeTypeMap[typ],tok
			elif ltyp == 'open' and (scopeType = ScopeTypeMap[styp])
				scope = tok.scope = scopeType.build(self,tok,scope,styp,types)
			
			elif ltyp == 'close' and scope.type == styp
				scope = scope.pop(tok)

			elif subtyp == 'close' and ScopeTypeMap[typ]
				scope = scope.pop(tok)

			elif pairings[typ] and scope and scope.start.value == pairings[typ]
				scope = scope.pop(tok)

			if tok.match(/entity\.name|decl-/)
				let tokenSymbol = Sym.forToken(tok,tok.type,tok.mods)

				if tokenSymbol
					tok.symbol = tokenSymbol # new Sym(symFlags,tok.value,tok)
					tok.symbol.keyword = lastVarKeyword
					scope.register(tok.symbol)
					scope.lastDecl = lastDecl = tokenSymbol
					

				tok.mods |= M.Declaration

			if subtyp == 'declval'
				lastVarAssign = tok

			if tok.match('identifier') && !tok.symbol
				let sym = scope.lookup(tok,lastVarKeyword)
				if sym && sym.scoped?
					if lastVarAssign and sym.keyword == lastVarKeyword
						yes # should not resolve
					else
						sym.addReference(tok)

				# hardcoded fallback handling
				if prev && prev.op == '=' and sym
					let lft = prev.prev
					if lft && lft.symbol == sym
						if lft.mods & M.Declaration
							sym.dereference(tok)
						elif !nextToken or nextToken.match('br')
							sym.dereference(lft)
							
			# if currScope != scope and currScope.parent == scope
			# 	console.log 'popped scope!!',currScope,lastDecl,scope.lastDecl
			prev = tok
		
		while scope != root
			scope = scope.pop(eof)
		# console.log 'astified',Date.now! - t0
		self
		
	def parse
		return tokens

	def getMatchingTokens filter
		let tokens = getTokens!
		if #lexed.typeMatchCache[filter]
			return #lexed.typeMatchCache[filter]
		tokens = tokens.slice(0).filter do $1.match(filter)
		#lexed.typeMatchCache[filter] = tokens
		return tokens

	def getStyleVarDeclarations
		getMatchingTokens('style.property.var')

	def getStyleVarReferences
		getMatchingTokens('style.value.var')

	def findTagDefinition name
		let match = getSymbols!.find do $1.name == name
		return match and match.body

	def findNodeForTypeScriptDefinition item
		let name = toImbaIdentifier(item.name)
		let kind = null
		let res

		let symbols = getSymbols!.filter do $1.name == name or $1.name == item.name
		let tokens = tokens.filter do $1.value == name

		if item.kind == 'getter'
			kind = 'entity.name.get'
		elif item.kind == 'property'
			kind = 'entity.name.field'
		elif item.kind == 'method'
			kind = 'entity.name.def'
		elif item.kind == 'class'
			if symbols[0]
				res = symbols[0].node
		
		if item.containerName == 'globalThis'
			res = symbols[0]

		if kind and !res
			tokens = tokens.filter(do $1.match(kind))
			if tokens.length == 1
				res = tokens[0]
			elif tokens.length
				# should not be this weak from the getgo
				tokens = tokens.filter do(tok) toImbaIdentifier(tok.context.name).toLowerCase! == toImbaIdentifier(item.containerName).toLowerCase!

				if tokens.length == 1
					res = tokens[0]

				# for tok in tokens when tok.context
				#	console.log tok.value, tok.type, tok.context..path,toImbaIdentifier(tok.context.name),name
				#	# if this is a tag
				#	# if tok.context.name
				# console.log "found multiple hits",tokens,symbols
				# for sym in symbols
				# 	console.log sym.name,sym.body.path,sym.body.scope..path

		# if !res and tokens[0]
		#	res = tokens[0]

		if res isa Sym
			res = res.body

		return res

	def findPath path
		let parts = path.split('.')
		let name = parts[parts.length - 1]

		for sym in getSymbols!
			if sym.name == name
				# console.log "found!",sym,sym.body.path
				if sym.body and sym.body.path == path
					return sym.node
		return
	
	def createImportEdit path, name, alias = name, asType = no
		
		let noext = path.replace(/\.(imba|d\.ts|js|ts)$/,'')

		let nodes = getImportNodes!.filter do
			($1.sourcePath == path or $1.sourcePath == noext) and $1.isTypeOnly == asType
		
		if nodes[0]
			path = nodes[0].sourcePath
		else
			path = path.replace(/\.(imba|d\.ts)$/,'')

		let out = ''
		let offset = 0
		
		let changes = []
		let result = {
			changes: changes
		}
		
		let keyword = asType ? "import type" : "import"
		
		if true
			let symbols = getImportedSymbols!.map do $1.importInfo
			let match = symbols.find do
				$1.path == path and $1.name == alias and $1.exportName == name
			if match
				return result
		
		if (name != 'default' and name != '*')
			nodes = nodes.filter do $1.specifiers or !$1.ns
		
		for node in nodes
			
			let defaults = node.default
			let members = node.specifiers
			let ns = node.namespace
		
			if name == 'default'
				offset = node.start.offset + 1

				if defaults
					if defaults.value == alias
						return result
					else
						result.alias = defaults.value
						offset = 0
						continue
				else
					out = alias
					if ns or members
						out += ', '						
				
			elif name == '*'
				continue if members
				if defaults
					offset = defaults.endOffset
					out = ", * as {alias}"
				else
					offset = node.start.offset + 1
					out = "* as {alias} "
			elif ns
				# cannot add it here
				result.alias = "{ns.value}.{name}"
				continue
			else
				let key = name
				key += " as {alias}" if alias != name
				
				if members
					offset = members.start.offset + 1
					out = " {key},"
				elif defaults
					offset = defaults.endOffset
					out = ", \{ {key} \}"
				else
					out = "\{ {key} \}"
					offset = node.start.offset + 1
					
			break if out
		
		if !out
			if name == 'default'
				out = "{keyword} {alias} from '{path}'"
			elif name == '*'
				out = "{keyword} * as {alias} from '{path}'"
			elif alias != name
				out = "{keyword} \{ {name} as {alias} \} from '{path}'"
			else
				out = "{keyword} \{ {name} \} from '{path}'"
				
			out += '\n'
			
		if out.match(/^import /) and !content.slice(offset).match(/^(import|#\s)/)
			out += '\n'
			
		changes.push({newText: out, start: offset, length: 0})
		return result
	
	def getFormattingEdits prefs = {}
		# run through tokens backwards?
		let edits = []
		let i = tokens.length
		let raw = content
		
		let spaced = do(tok)
			return true if raw[tok.endOffset - 1] == ' ' or  raw[tok.endOffset] == ' '
			# return true if tok.next and tok.next.value and tok.next.value[0] == ' '
			return false
		
		while i > 0
			let tok = tokens[--i]
			if tok.match('operator.assign operator.declval')
				unless spaced(tok)
					edits.push([tok.endOffset,0,' '])
				unless spaced(tok.prev)
					edits.push([tok.startOffset,0,' '])
		
		edits