import {computeLineOffsets,getWellformedRange,getWellformedEdit,mergeSort,editIsFull,editIsIncremental} from './utils'
import { lexer, Token, LexedLine } from './lexer'
import * as util from './utils'
import { Root, Scope, Group, ScopeTypeMap } from './scope'
import { Sym, SymbolFlags } from './symbol'

import {SemanticTokenTypes,SemanticTokenModifiers,M,CompletionTypes,Keywords,SymbolKind} from './types'

import {Range, Position} from './structures'

extend class Token

	get node
		if scope and scope.start == self
			return scope
		if pops
			return pops
		return self
		
	get nextNode
		next..node
		
	get prevNode
		prev..node
		
###
line and character are both zero based
###
export class ImbaDocument

	static def tmp content
		new self('file://temporary.imba','imba',0,content)
	
	static def from uri, languageId, version, content
		new self(uri,languageId,version,content)

	def constructor uri, languageId, version, content
		uri = uri
		languageId = languageId
		version = version
		content = content
		connection = null
		lineTokens = []
		isLegacy = languageId == 'imba1' or (uri && uri.match(/\.imba1$/))
		head = seed = new Token(0,'eol','imba')
		initialState = lexer.getInitialState!
		seed.stack = lexer.getInitialState!
		history = []
		# tokens = []
		self.lexer = lexer
		versionToHistoryMap = {}
		versionToHistoryMap[version] = -1
		if content and content.match(/^\#[^\n]+imba1/m)
			isLegacy = yes
		

	def log ...params
		console.log(...params)

	get lineCount
		lineOffsets.length

	get lineOffsets
		_lineOffsets ||= computeLineOffsets(content,yes)
	
	def getText range = null
		if range
			let start = offsetAt(range.start)
			let end = offsetAt(range.end)
			return content.substring(start, end)
		return content

	def getLineText line
		let start = lineOffsets[line]
		let end = lineOffsets[line + 1]
		return content.substring(start, end).replace(/[\r\n]/g,'')
	
	def positionAt offset
		if offset isa Position
			return offset

		if typeof offset == 'object'
			offset = offset.offset

		offset = Math.max(Math.min(offset, content.length), 0)
		let lineOffsets = lineOffsets
		let low = 0
		let high = lineOffsets.length
		if high === 0
			return new Position(0,offset,offset,version)
			# return { line: 0, character: offset, offset: offset }
		while low < high
			let mid = Math.floor((low + high) / 2)
			if lineOffsets[mid] > offset
				high = mid
			else
				low = mid + 1
		# low is the least x for which the line offset is larger than the current offset
		# or array.length if no line offset is larger than the current offset
		let line = low - 1
		return new Position(line,offset - lineOffsets[line],offset,version)
		# return { line: line, character: (offset - lineOffsets[line]), offset: offset }

	def offsetAt position
		if position.offset
			return position.offset

		let lineOffsets = lineOffsets
		if position.line >= lineOffsets.length
			return content.length
		elif position.line < 0
			return 0

		let lineOffset = lineOffsets[position.line]
		let nextLineOffset = (position.line + 1 < lineOffsets.length) ? lineOffsets[position.line + 1] : content.length
		return position.offset = Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset)

	def rangeAt start, end = start
		new Range(positionAt(start),positionAt(end))

	def overwrite body,newVersion
		version = newVersion or (version + 1)
		content = body
		_lineOffsets = null
		invalidateFromLine(0)
		
		return self

	def update changes, version
		# what if it is a full updaate
		# handle specific smaller changes in an optimized fashion
		# many changes will be a single character etc
		if version == undefined
			version = self.version + 1

		let edits = []
		
		for change,i in changes
			if editIsFull(change)
				overwrite(change.text,version)
				edits.push([0,content.length,change.text])
				continue

			let range = getWellformedRange(change.range)
			let startOffset = offsetAt(range.start)
			let endOffset = offsetAt(range.end)

			# console.log 'update with changes',change.text,startOffset,endOffset

			change.range = range
			change.offset = startOffset
			change.length = endOffset - startOffset
			range.start.offset = startOffset
			range.end.offset = endOffset
			# console.log 'update',startOffset,endOffset,change.text,JSON.stringify(content)
			# content = content.substring(0, startOffset) + change.text + content.substring(endOffset, content.length)
			applyEdit(change,version,changes)

			edits.push([startOffset,endOffset - startOffset,change.text or ''])

			let startLine = Math.max(range.start.line, 0)
			let endLine = Math.max(range.end.line, 0)
			let lineOffsets = self.lineOffsets
			# some bug with these line offsets here
			# many items has no line offset changes at all?
			let addedLineOffsets = computeLineOffsets(change.text, false, startOffset)

			if (endLine - startLine) === addedLineOffsets.length
				for added,k in addedLineOffsets
					lineOffsets[k + startLine + 1] = addedLineOffsets[i]
			else
				if addedLineOffsets.length < 10000
					lineOffsets.splice.apply(lineOffsets, [startLine + 1, endLine - startLine].concat(addedLineOffsets))
				else
					_lineOffsets = lineOffsets = lineOffsets.slice(0, startLine + 1).concat(addedLineOffsets, lineOffsets.slice(endLine + 1))

			let diff = change.text.length - (endOffset - startOffset)
			if diff !== 0
				let k = startLine + 1 + addedLineOffsets.length
				while k < lineOffsets.length
					lineOffsets[k] = lineOffsets[k] + diff
					k++
		
		history.push(edits)
		# console.log 'updated',edits,history.length - 1,version # startOffset,endOffset,change.text,JSON.stringify(content)
		versionToHistoryMap[version] = history.length - 1
		updated(changes,version)

	def offsetAtVersion fromOffset, fromVersion, toVersion = version, stickyStart = no
		let from = versionToHistoryMap[fromVersion]
		let to = versionToHistoryMap[toVersion]
		let offset = fromOffset
		let modified = no
		
		if from < to
			while from < to
				let edits = history[++from]
				for [start,len,text] in edits
					continue if start > offset
					start -= 1 if stickyStart
					if offset > start and offset > (start + len)
						offset += (text.length - len)
						
		elif to < from
			while to < from
				let edits = history[from--]
				for [start,len,text] in edits
					continue if start > offset
					if offset > start and offset > (start + len)
						offset -= (text.length - len)

		return offset
		
	def historicalOffset offset, oldVersion
		offsetAtVersion(offset,version,oldVersion,yes)

	def applyEdit change,version,changes
		# apply textual changes
		content = content.substring(0, change.range.start.offset) + change.text + content.substring(change.range.end.offset, content.length)

		let line = change.range.start.line
		invalidateFromLine(line)
		return
	
	def updated changes,version
		version = version
		self

	def invalidateFromLine line
		head = seed
		# tokens = []
		self

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

	def getTokenRange token
		{start: positionAt(token.offset), end: positionAt(token.offset + token.value.length)}

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
		
	def getNodesInScope scope,includeEnds = no
		let tok = scope.start
		let end = scope.end # ? tokens.indexOf(scope.end) : tokens.length
		
		if includeEnds
			end = end.next
		else
			tok = tok.next

		let parts = []
		while tok and tok != end
			if tok.scope and tok.scope != scope
				parts.push(tok.scope)
				continue tok = tok.scope.end.next
			elif tok.type != 'white'
				parts.push(tok)
			tok = tok.next

		return parts

	def getTokenAtOffset offset,forwardLooking = no
		return tokenAtOffset(offset)

		let pos = positionAt(offset)
		getTokens(pos) # ensure that we have tokenized all the way here
		let line = lineTokens[pos.line]
		let idx = line.index
		let token
		let prev
		# find the token
		while token = tokens[idx++]
			if forwardLooking and token.offset == offset
				return token

			break if token.offset >= offset
			prev = token
		return prev or token

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


	def getEncodedSemanticTokens
		let tokens = getSemanticTokens!
		let out = []
		let l = 0
		let c = 0
		for item in tokens
			let pos = positionAt(item[0])
			let dl = pos.line - l
			let chr = dl ? pos.character : (pos.character - c)
			out.push(dl,chr,item[1],item[2],item[3])
			l = pos.line
			c = pos.character
		return out
		
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

	def contextAtOffset offset
		ensureParsed!

		let pos = positionAt(offset)
		let tok = tokenAtOffset(offset)
		let linePos = lineOffsets[pos.line]
		# console.log 'get token at offset',offset,tok,linePos,pos
		let tokPos = offset - tok.offset
		
		let ctx = tok.context

		const before = {
			character: content[offset - 1]
			line: content.slice(linePos,offset)
			token: tok.value.slice(0,tokPos)
		}

		const after = {
			character: content[offset]
			token: tok.value.slice(tokPos)
			line: content.slice(offset,lineOffsets[pos.line + 1]).replace(/[\r\n]+/,'')
		}
		


		# if the token pushes a new scope and we are at the end of the token
		if tok.scope and !after.token
			ctx = tok.scope
			# are we are the beginning of a scope?
			
		if tok.next
			if tok.next.value == null and tok.next.scope and !after.token and tok.match('operator.assign')
				ctx = tok.next.scope
				# console.log 'changed scope!!!',ctx,ctx.scope
	
		let tabs = util.prevToken(tok,"white.tabs")
		let indent = tabs ? tabs.value.length : 0
		let group = ctx
		let scope = ctx.scope
		let meta = {}
		let target = tok
		let mstate = tok.stack.state or ''
		let t = CompletionTypes

		

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

		if group.type == 'tag'
			# let name = group.findChildren('tag.name')
			# group.name = name.join('')
			yes

		if tok.match('entity string regexp comment style.')
			flags = 0
		
		# if we are in an accessor

		

		

		if tok.match('tag.event.name tag.event-modifier.name')
			target = tok.prev

		if tok.type == 'path' or tok.type == 'path.open'
			flags |= CompletionTypes.Path
			suggest.paths = 1

		if tok.match('identifier tag.operator.equals br white delimiter array operator (')
			flags |= CompletionTypes.Value
			target = null

		if tok.match('operator.access')
			flags |= CompletionTypes.Access
			target = tok
			
		if tok.match('accessor')
			flags |= CompletionTypes.Access
			target = tok.prev

		if tok.match("delimiter.type.prefix type")
			flags |= CompletionTypes.Type
		if tok.match('tag.name tag.open')
			flags |= CompletionTypes.TagName
		elif tok.match('tag.attr tag.white')
			flags |= CompletionTypes.TagProp
			
		elif tok.match('tag.flag')
			flags |= CompletionTypes.TagFlag
		elif tok.match('tag.event.modifier')
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
			flags |= t.StyleProp
			flags ~= t.Value
			
		if tok.match('style.property.operator')
			flags ~= t.StyleProp
			
		if group.match('stylevalue') && before.group.indexOf(' ') == -1
			flags = t.StyleValue
			
		if tok.match('style.selector.modifier style.property.modifier')
			flags = t.StyleModifier
			
		if tok.match('style.selector.element')
			flags |= t.StyleSelector
		
		if scope.closest('rule') and before.line.match(/^\s*$/)
			flags |= t.StyleSelector
			flags ~= t.StyleValue
			
		if tok.match('operator.access accessor white.classname white.tagname')
			flags ~= t.Value
			
		if mstate.match(/\.decl-(let|var|const|param|for)/) or tok.match(/\.decl-(for|let|var|const|param)/)
			flags ~= t.Value
			flags |= t.VarName

		let kfilter = scope.allowedKeywordTypes
		suggest.keywords = for own key,v of Keywords when v & kfilter
			key

		suggest.flags = flags
		
		for own k,v of t
			if flags & v
				suggest[k] ||= yes

		let out = {
			token: tok
			offset: offset
			position: pos
			linePos: linePos
			scope: scope
			indent: indent
			group: ctx
			mode: ''
			target: target
			path: scope.path
			suggest: suggest
			before: before
			after: after
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
			let symbols = util.fastExtractSymbols(content)
			for item in symbols.all
				delete item.parent
				item.path = item.name
				item.name = item.ownName
				walker(item,symbols.all) if walker
			return symbols

		ensureParsed!
		let t = Date.now!
		let all = []
		let root = {children: []}
		let curr = root
		let scop = null
		let last\any = {}
		let symbols = new Set
		let awaitScope = null

		def add item,tok
			if item isa Sym
				symbols.add(item)
				item = {
					name: item.name
					kind: item.kind
				}
			last = item
			item.token = tok
			item.children ||= []
			item.span ||= tok.span
			item.name ||= tok.value
			all.push(item)
			curr.children.push(item)

		def push end
			last.children ||= []
			last.parent ||= curr
			curr = last
			curr.end = end

		def pop tok
			curr = curr.parent

		for token,i in tokens
			let sym = token.symbol
			let scope = token.scope

			if token.type == 'key'
				add({kind:SymbolKind.Key},token)
			elif sym
				continue if sym.parameter?

				if !symbols.has(sym)
					add(sym,token)
				if sym.body
					awaitScope = sym.body.start

			elif scope and scope.type == 'do'
				let pre = textBefore(token.offset - 3).replace(/^\s*(return\s*)?/,'')
				pre += " callback"
				add({kind:SymbolKind.Function,name:pre},token.prev)
				awaitScope = token
			
			elif scope and scope.type == 'tag'
				add({kind:SymbolKind.Field,name:scope.outline},token)

			if token == awaitScope
				push(token.end)
			
			if token == curr.end
				pop!

		for item in all
			if item.span
				let len = item.span.length
				item.span.start = positionAt(item.span.offset)
				item.span.end = len ? positionAt(item.span.offset + len) : item.span.start
			if walker
				walker(item,all)

			delete item.parent
			delete item.end
			delete item.token
		# console.log 'outline took',Date.now! - t
		return root

	def getContextAtOffset offset, forwardLooking = no
		return contextAtOffset(offset)

	def ensureParsed
		parse! # if self.head.offset == 0
		return self

	def reparse
		invalidateFromLine(0)
		parse!
		
	def profileReparse
		let t = Date.now!
		let res = reparse!
		console.log 'took',Date.now! - t
		return res

	def tokenize force = no
		# return tokenize! unless #lexed
		let from = #lexed or {lines:[]}
		
		if from.version == version and !force
			return from

		let raw = content
		
		if isLegacy
			raw = raw.replace(/\@\w/g) do(m) '¶' + m.slice(1)
			raw = raw.replace(/\w\:(?=\w)/g) do(m) m[0] + '.'
			raw = raw.replace(/(do)(\s?)\|([^\|]*)\|/g) do(m,a,space,b)
				a + '(' + (space or '') + b + ')'

		let lineOffsets = self.lineOffsets
		let tokens = []
		
		let head = seed
		let prev = head
		let t0 = Date.now!
		let nextState = initialState
		
		

		#lexed = {
			version: version
			lines: []
			tokens: tokens
		}
		
		let lineCache = {}
		
		#lexed.cache = lineCache
		
		for line in from.lines
			let item = (lineCache[line.text] ||= [])
			item.push(line)
			line
		
		for lineOffset,i in lineOffsets
			let next = lineOffsets[i+1]
			let toOffset = next or raw.length
			let str = raw.slice(lineOffset,toOffset)
			let startState = nextState
			
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
		
		let elapsed = Date.now! - t0
		console.log 'retokenized in',elapsed
		return #lexed
	
	get tokens
		astify!
		return #lexed.tokens
		
	# This is essentially the tokenizer
	def getTokens range = null
		return self.tokens

	def astify
		# now walk the whole token-stream
		let lexed = tokenize!
		return self if lexed.root
		
		const pairings = {']': '[', ')': '(', '}': '{', '>': '<'}
		const openers = {'[': ']','(': ')','{': '}','<': '>'}
		const callAfter = /[\w\$\)\]\?]/

		let t0 = Date.now!
		let entity = null
		let scope\any = lexed.root = new Root(self,seed,null,'root')
		let raw = content
		let log = console.log.bind(console)
		let lastDecl = null
		let lastVarKeyword = null
		let lastVarAssign = null
		let prev = null
		let entityFlags = 0
		
		for tok,ti in lexed.tokens
			let types = tok.type.split('.')
			let value = tok.value
			let nextToken = lexed.tokens[ti + 1]
			let [typ,subtyp,sub2] = types
			let ltyp = types[types.length - 1]
			let decl = 0

			if typ == 'ivar'
				value = tok.value = '@' + value.slice(1)

			if prev
				prev.next = tok
				
			tok.prev = prev
			tok.context = scope
			
			# tag content interpolation
			if sub2 == 'braces' and value == '{'
				scope = tok.scope = ScopeTypeMap.interpolation.build(self,tok,scope,'interpolation',types)

			if typ == '(' and prev
				let prevchr = raw[tok.offset - 1] or ''
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
				if lastDecl
					lastDecl.body = scope
					scope.symbol = lastDecl
					lastDecl = null
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

			elif subtyp == 'close' and ScopeTypeMap[typ]
				scope = scope.pop(tok)

			elif pairings[typ] and scope and scope.start.value == pairings[typ]
				scope = scope.pop(tok)

			if tok.match(/entity\.name|decl-/)
				let tokenSymbol = Sym.forToken(tok,tok.type,tok.mods)

				if tokenSymbol
					lastDecl = tok.symbol = tokenSymbol # new Sym(symFlags,tok.value,tok)
					tok.symbol.keyword = lastVarKeyword
					scope.register(tok.symbol)

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
			prev = tok
		# self.newTokens = lexed.tokens
		console.log 'astified',Date.now! - t0
		self
		
	def parse
		return tokens

	def parseOld
		
		let head = seed

		if head != self.head
			return self.tokens

		let t0 = Date.now!
		let raw = content
		let lines = lineOffsets
		let tokens = []
		let prev = head
		let entity = null
		let scope\any = new Root(self,seed,null,'root')
		let log = console.log.bind(console)
		let lastDecl = null
		let lastVarKeyword = null
		let lastVarAssign = null
		let legacy = isLegacy

		if isLegacy
			raw = raw.replace(/\@\w/g) do(m) '¶' + m.slice(1)
			raw = raw.replace(/\w\:(?=\w)/g) do(m) m[0] + '.'
			raw = raw.replace(/(do)(\s?)\|([^\|]*)\|/g) do(m,a,space,b)
				a + '(' + (space or '') + b + ')'

		log = do yes

		let pairings = {
			']': '['
			')': '('
			'}': '{'
			'>': '<'
		}

		let openers = {
			'[': ']'
			'(': ')'
			'{': '}'
			'<': '>'
		}

		let callAfter = /[\w\$\)\]\?]/

		# let openers = Object.values(pairings)

		try
			for line,i in lines
				let entityFlags = 0
				let next = lines[i+1]
				let str = raw.slice(line,next or raw.length)
				let t0 = Date.now!
				let lexed = lexer.tokenize(str,head.stack,line)
				let t1 = Date.now!
				
				if (t1 - t0) > 30
					console.log 'took a long time to parse linke',line,head.stack,str,(t1 - t0)

				for tok,ti in lexed.tokens
					let types = tok.type.split('.')

					let value = tok.value
					let nextToken = lexed.tokens[ti + 1]
					let [typ,subtyp,sub2] = types
					let ltyp = types[types.length - 1]
					let decl = 0

					tokens.push(tok)

					if typ == 'ivar'
						value = tok.value = '@' + value.slice(1)

					
					
					if prev
						prev.next = tok
						tok.prev = prev
						tok.context = scope
					
					# tag content interpolation
					if sub2 == 'braces' and value == '{'
						scope = tok.scope = ScopeTypeMap.interpolation.build(self,tok,scope,'interpolation',types)

					if typ == '(' and prev
						let prevchr = raw[tok.offset - 1] or ''
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
						if lastDecl
							lastDecl.body = scope
							scope.symbol = lastDecl
							lastDecl = null
						if scope == scope.scope
							lastVarKeyword = null
							lastVarAssign = null
						ctor

					elif typ == 'pop'
						# console.log 'popping the value!',subtyp
						# log " ".repeat(sub2) + tok.type\
						if subtyp == 'value'
							lastVarAssign = null
						
						scope = scope.pop(tok)
					
					elif (subtyp == 'open' or openers[subtyp]) and ScopeTypeMap[typ]

						scope = tok.scope = ScopeTypeMap[typ].build(self,tok,scope,typ,types)

					elif subtyp == 'close' and ScopeTypeMap[typ]
						scope = scope.pop(tok)

					# elif openers[typ] and ScopeTypeMap[subtyp]
					#	console.log 'create scope',
					#	scope = tok.scope = new (ScopeTypeMap[subtyp])(self,tok,scope,subtyp,types)

					elif pairings[typ] and scope and scope.start.value == pairings[typ]
						scope = scope.pop(tok)


					if tok.match(/entity\.name|decl-/)
						# let tvar = scope.declare(tok,subtyp)
						# create a symbol
						# console.log 'declare',tok.type,Symbol.idToFlags(tok.type,tok.mods)
						let tokenSymbol = Sym.forToken(tok,tok.type,tok.mods)

						if tokenSymbol
							lastDecl = tok.symbol = tokenSymbol # new Sym(symFlags,tok.value,tok)
							tok.symbol.keyword = lastVarKeyword
							scope.register(tok.symbol)

						tok.mods |= M.Declaration

					if subtyp == 'declval'
						# console.log "found declval"
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

					prev = tok
				# head should
				head = new Token((next or content.length),'eol','imba')
				head.stack = lexed.endState
				# head = {state: lexed.endState, offset: (next or content.length)}
		catch e
			console.log 'parser crashed',e
			# console.log tokens
		
		# console.log 'parsed',tokens.length,Date.now! - t0
		self.head = head
		# self.tokens = tokens
		return tokens

	def getMatchingTokens filter
		let tokens = getTokens!
		tokens = tokens.slice(0).filter do $1.match(filter)
		return tokens

	def migrateToImba2
		let source = self.content
		source = source.replace(/\bdef self\./g,'static def ')
		source = source.replace(/\b(var|let|const) def /g,'def ')
		source = source.replace(/\?\./g,'..')

		source = source.replace(/def ([\w\-]+)\=/g,'set $1')

		source = source.replace(/do\s?\|([^\|]+)\|/g,'do($1)')

		source = source.replace(/(prop) ([\w\-]+) (.+)$/gm) do(m,typ,name,rest)
			let opts = {}
			rest.split(/,\s*/).map(do $1.split(/\:\s*/)).map(do opts[$1[0]] = $1[1] )
			let out = "{typ} {name}"

			if opts.watch and opts.watch[0].match(/[\'\"\:]/)
				out = "@watch({opts.watch}) {out}"
			elif opts.watch
				out = "@watch {out}"
			
			delete opts.watch
			
			if opts.default
				out = "{out} = {opts.default}"
				delete opts.default

			if Object.keys(opts).length
				console.log 'more prop values',m,opts
			return out

		let doc = ImbaDocument.tmp(source)
		let tokens = doc.getTokens!
		let ivarPrefix = ''

		for token,i in tokens

			let next = tokens[i + 1]
			let {value,type,offset} = token
			let end = offset + value.length
			if type == 'operator.dot.legacy'
				value = '.'
				next.access = true if next

			if type == 'operator.spread.legacy'
				value = '...'

			if type == 'identifier.tagname'
				if value.indexOf(':') >= 0
					value = value.replace(':','-')
			if type == 'identifier.def.propname' and value == 'initialize'
				value = 'constructor'
			
			if type == 'decorator' and !source.slice(end).match(/^\s(prop|def|get|set)/)
				value = ivarPrefix + value.slice(1)
			
			if type == 'property'
				if value[0] == '@'
					value = value.replace(/^\@/,ivarPrefix)
					token.access = yes
				elif value == 'len'
					value = 'length'
				elif (/^(\n|\s\:|\)|\,|\.)/).test(source.slice(end)) and !token.access
					if value[0] == value[0].toLowerCase!
						value = value + '!'

			if type == 'identifier' and !token.access and value[0] == value[0].toLowerCase! and value[0] != '_'
				if !token.variable and (/^(\n|\s\:|\)|\,|\.)/).test(source.slice(end)) and value != 'new'
					value = value + '!'

			token.value = value

		return tokens.map(do $1.value).join('')
