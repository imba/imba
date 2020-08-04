import {computeLineOffsets,getWellformedRange,getWellformedEdit,mergeSort,editIsFull,editIsIncremental} from './utils'
import { lexer, Token } from './lexer'
import * as util from './utils'
import { Root, Scope, Group, ScopeTypeMap } from './scope'
import { Sym, SymbolFlags } from './symbol'

import {SemanticTokenTypes,SemanticTokenModifiers,M,CompletionTypes,Keywords,SymbolKind} from './types'

export class ImbaDocument

	static def tmp content
		new self('file://temporary.imba','imba',0,content)

	def constructor uri, languageId, version, content
		uri = uri
		languageId = languageId
		version = version
		content = content
		connection = null
		lineTokens = []
		head = seed = new Token(0,'eol','imba')
		seed.stack = lexer.getInitialState!
		history = []
		tokens = []
		versionToHistoryMap = {}
		versionToHistoryMap[version] = -1
		

	def log ...params
		console.log(...params)

	get lineCount
		lineOffsets.length

	get lineOffsets
		_lineOffsets ||= computeLineOffsets(content,yes)
	
	def getText range = null
		if range
			var start = offsetAt(range.start)
			var end = offsetAt(range.end)
			return content.substring(start, end)
		return content

	def getLineText line
		let start = lineOffsets[line]
		let end = lineOffsets[line + 1]
		return content.substring(start, end)
	
	def positionAt offset
		offset = Math.max(Math.min(offset, content.length), 0)
		var lineOffsets = lineOffsets
		var low = 0
		var high = lineOffsets.length
		if high === 0
			return { line: 0, character: offset }
		while low < high
			var mid = Math.floor((low + high) / 2)
			if lineOffsets[mid] > offset
				high = mid
			else
				low = mid + 1
		// low is the least x for which the line offset is larger than the current offset
		// or array.length if no line offset is larger than the current offset
		var line = low - 1
		return { line: line, character: (offset - lineOffsets[line]) }

	def offsetAt position
		if position.offset
			return position.offset

		var lineOffsets = lineOffsets
		if position.line >= lineOffsets.length
			return content.length
		elif position.line < 0
			return 0

		var lineOffset = lineOffsets[position.line]
		var nextLineOffset = (position.line + 1 < lineOffsets.length) ? lineOffsets[position.line + 1] : content.length
		return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset)

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
		let edits = []
		
		for change,i in changes
			if editIsFull(change)
				overwrite(change.text,version)
				edits.push([0,content.length,change.text])
				continue

			var range = getWellformedRange(change.range)
			var startOffset = offsetAt(range.start)
			var endOffset = offsetAt(range.end)

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

			var startLine = Math.max(range.start.line, 0)
			var endLine = Math.max(range.end.line, 0)
			var lineOffsets = self.lineOffsets
			# some bug with these line offsets here
			# many items has no line offset changes at all?
			var addedLineOffsets = computeLineOffsets(change.text, false, startOffset)

			if (endLine - startLine) === addedLineOffsets.length
				for added,k in addedLineOffsets
					lineOffsets[k + startLine + 1] = addedLineOffsets[i]
			else
				if addedLineOffsets.length < 10000
					lineOffsets.splice.apply(lineOffsets, [startLine + 1, endLine - startLine].concat(addedLineOffsets))
				else
					_lineOffsets = lineOffsets = lineOffsets.slice(0, startLine + 1).concat(addedLineOffsets, lineOffsets.slice(endLine + 1))

			var diff = change.text.length - (endOffset - startOffset)
			if diff !== 0
				let k = startLine + 1 + addedLineOffsets.length
				while k < lineOffsets.length
					lineOffsets[k] = lineOffsets[k] + diff
					k++
		
		history.push(edits)
		# console.log 'updated',edits,history.length - 1,version # startOffset,endOffset,change.text,JSON.stringify(content)
		versionToHistoryMap[version] = history.length - 1
		updated(changes,version)

	def offsetAtVersion fromOffset, fromVersion, toVersion = version
		let from = versionToHistoryMap[fromVersion]
		let to = versionToHistoryMap[toVersion]
		let offset = fromOffset
		let modified = no
		
		if from < to
			while from < to
				let edits = history[++from]
				for [start,len,text] in edits
					continue if start > offset
					if offset > start and offset > (start + len)
						offset += (text.length - len)
		
		return offset

	def applyEdit change,version,changes
		# apply textual changes
		content = content.substring(0, change.range.start.offset) + change.text + content.substring(change.range.end.offset, content.length)

		let line = change.range.start.line
		let caret = change.range.start.character + 1
		invalidateFromLine(line)
		if changes.length == 1 and change.text == '<'
			let text = getLineText(line)
			let matcher = text.slice(0,caret) + '§' + text.slice(caret)

			if matcher.match(/(^\t*|[\=\>]\s+)\<\§(?!\s*\>)/)
				if connection
					connection.sendNotification('closeAngleBracket',{uri: uri})
		return
	

	def updated changes,version
		version = version
		self

	def invalidateFromLine line
		head = seed
		tokens = []
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
		let start = tokens.indexOf(scope.token)
		let end = scope.endIndex or tokens.length
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

	def contextAtOffset offset
		ensureParsed!

		let pos = positionAt(offset)
		let tok = tokenAtOffset(offset)
		let linePos = lineOffsets[pos.line]
		# console.log 'get token at offset',offset,tok,linePos,pos
		let tokPos = offset - tok.offset
		let ctx = tok.context
		let tabs = util.prevToken(tok,"white.tabs")
		let indent = tabs ? tabs.value.length : 0
		let group = ctx
		let scope = ctx.scope
		let meta = {}

		const before = {
			line: content.slice(linePos,offset)
			token: tok.value.slice(0,tokPos)
		}

		const after = {
			token: tok.value.slice(tokPos)
			line: content.slice(offset,lineOffsets[pos.line + 1]).replace(/[\r\n]+/,'')
		}

		let suggest = {
			keywords: []
		}
		let flags = 0

		if tok == tabs
			indent = tokPos

		while scope.indent > indent
			scope = scope.parent

		if group.type == 'tag'
			# let name = group.findChildren('tag.name')
			# group.name = name.join('')
			yes

		if tok.match('entity string regexp comment style.')
			flags = 0

		if tok.match('operator.access')
			flags |= CompletionTypes.Access

		if tok.match('identifier tag.operator.equals br white')
			flags |= CompletionTypes.Value

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

		if tok.match('style.property.operator') or group.closest('stylevalue')
			flags |= CompletionTypes.StyleValue
			try
				suggest.styleProperty = group.closest('styleprop').propertyName

		if tok.match('style.open style.property.name')
			flags |= CompletionTypes.StyleProp

		if tok.match('style.value.white') or (tok.prev and tok.prev.match('style.value.white'))
			flags |= CompletionTypes.StyleProp

		if tok.match('style.selector.element') and after.line.match(/^\s*$/)
			flags |= CompletionTypes.StyleProp

		let kfilter = scope.allowedKeywordTypes
		suggest.keywords = for own key,v of Keywords when v & kfilter
			key

		suggest.flags = flags

		let out = {
			token: tok
			offset: offset
			position: pos
			linePos: linePos
			scope: scope
			indent: indent
			group: ctx
			mode: ''
			path: scope.path
			suggest: suggest
			before: before
			after: after
		}

		return out

	def varsAtOffset offset, globals? = no
		let tok = tokenAtOffset(offset)
		let vars = []
		let scope = tok.context.scope
		let names = {}

		while scope
			for item in Object.values(scope.varmap)
				continue if item.global? and !globals?
				continue if names[item.name]

				if item.node.offset < offset
					vars.push(item)
					names[item.name] = item

			scope = scope.parent
		return vars

	def getOutline walker
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
			if token.type == 'key'
				add({kind:SymbolKind.Key},token)
			elif sym
				if !symbols.has(sym)
					add(sym,token)
				if sym.body
					awaitScope = sym.body.start
			
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
		parse! if self.head.offset == 0
		return self

	def reparse
		invalidateFromLine(0)
		parse!

	def parse
		let head = seed

		if head != self.head
			return self.tokens

		let t0 = Date.now!
		let raw = content
		let lines = lineOffsets
		let tokens = []
		let prev = head
		let entity = null
		let scope\any = new Root(seed,null,'root')
		let log = console.log.bind(console)
		let lastDecl = null

		log = do yes

		try
			for line,i in lines
				let entityFlags = 0
				let next = lines[i+1]
				let str = raw.slice(line,next or raw.length)
				let lexed = lexer.tokenize(str,head.stack,line)

				for tok,ti in lexed.tokens
					let types = tok.type.split('.')
					let value = tok.value
					let nextToken = lexed.tokens[ti + 1]
					let [typ,subtyp,sub2] = types
					let decl = 0

					tokens.push(tok)
					
					if prev
						prev.next = tok
						tok.prev = prev
						tok.context = scope

					if typ == 'operator'
						tok.op = tok.value.trim!

					if typ == 'keyword'
						if M[subtyp]
							entityFlags |= M[subtyp]
					
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

						scope = tok.scope = new ctor(tok,scope,scopetype,types)
						if lastDecl
							lastDecl.body = scope
							scope.symbol = lastDecl

						ctor
					elif typ == 'pop'
						# log " ".repeat(sub2) + tok.type
						scope = scope.pop(tok)
					
					elif subtyp == 'open' and ScopeTypeMap[typ]
						scope = tok.scope = new (ScopeTypeMap[typ])(tok,scope,typ,types)

					elif subtyp == 'close' and ScopeTypeMap[typ]
						scope = scope.pop(tok)


					if tok.match(/entity\.name|decl-|field/)
						# let tvar = scope.declare(tok,subtyp)
						# create a symbol
						# console.log 'declare',tok.type,Symbol.idToFlags(tok.type,tok.mods)
						let symFlags = Sym.idToFlags(tok.type,tok.mods)

						if symFlags
							lastDecl = tok.symbol = new Sym(symFlags,tok.value,tok)
							scope.register(tok.symbol)

						tok.mods |= M.Declaration

					if tok.match('identifier') && !tok.symbol
						let sym = scope.lookup(tok)
						if sym && sym.scoped?
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
		self.tokens = tokens
		return tokens


	# This is essentially the tokenizer
	def getTokens range
		parse!
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
	