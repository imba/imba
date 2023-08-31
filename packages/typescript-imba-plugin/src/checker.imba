import * as util from './util'
import {Sym as ImbaSymbol,Node as ImbaNode, Token as ImbaToken, SymbolFlags as ImbaSymbolFlags, utils as MonarchUtils} from 'imba-monarch'
import AutoImportContext from './importer'
const Globals = "global imba module window document exports console process parseInt parseFloat setTimeout setInterval setImmediate clearTimeout clearInterval clearImmediate globalThis isNaN isFinite __dirname __filename".split(' ')

extend class ImbaSymbol
	get tsFlags
		let f = 0
		let F = global.ts.SymbolFlags
		if parameter?
			f |= F.FunctionScopedVariable
		elif variable?
			f |= F.BlockScopedVariable
		if member?
			f |= F.Property
		if flags & ImbaSymbolFlags.Class
			f |= F.Class

		return f

	def toSymbolObject checker
		checker.createSymbol(tsFlags,name)

class ImbaMappedLocation
	constructor context, dpos, opos
		dpos = dpos
		opos = opos
		context = context
		otoken = global.ts.findPrecedingToken(opos,context.sourceFile)
	get thisType
		return #thisType if #thisType
		let node = global.ts.getThisContainer(otoken)
		while node and node.symbol.escapedName == '__function'
			node = global.ts.getThisContainer(node)
		if node and node.body
			return #thisType = context.checker.tryGetThisTypeAt(node.body)

		return null

		while !#thisType and node and !(node isa global.SourceFile)
			let typ = context.checker.tryGetThisTypeAt(node)
			if typ.intrinsicName == 'undefined'
				node = global.ts.getThisContainer(otoken)
			else
				return #thisType = typ
		return #thisType

	def valueOf
		dpos

class SetProxy

export default class ImbaTypeChecker
	constructor project, program, checker, script
		project = project
		program = program
		checker = checker
		script = script
		mapper = script.getMapper(program)
		#typecache = {}
		#caches = {
			instanceType: new Map
			type: new Map
		}

	get sourceFile
		#sourceFile ||= program.getSourceFile(script.fileName)

	get ts
		global.ts

	get basetypes
		#basetypes ||= {
			string: checker.getStringType!
			number: checker.getNumberType!
			any: checker.getAnyType!
			void: checker.getVoidType!
			"undefined": checker.getUndefinedType!
		}

	get allGlobals
		#allGlobals ||= props('globalThis').slice(0)

	get globals
		#globals ||= allGlobals.filter do
			($1.pascal? or Globals.indexOf($1.escapedName) >= 0) and !$1.isWebComponent

	def getResultTypeAtLocation node
		while node
			if node.kind == ts.SyntaxKind.CallExpression or node.kind == ts.SyntaxKind.NewExpression
				let typ = checker.getTypeAtLocation(node)
				return typ if typ
			node = node.parent
		# CallExpression = 208,
		# NewExpression = 209,
		return null

	###
	Function for finding the ts type at a specific Token.
	Since we don't always map our tokens correctly to compiled
	tokens we use this function to apply some additional logic
	###
	def getTypeAtLocation node, via
		return unless node
		const sk = ts.SyntaxKind

		if node.kind == sk.DotToken # Dot
			yes
			# node = node.parent.expression

		if node.kind == sk.CloseParenToken
			# should rewrite this method to call itself recursively with a context instead
			if node.parent..parent..expression
				node = node.parent.parent.expression
			elif node.parent..expression
				node = node.parent.expression

		node and checker.getTypeAtLocation(node)

	def getMappedLocation dpos
		let res = {dpos: dpos}
		# if we are just at the start of an indent -- look up
		# to the previously declared
		let opos = res.opos = script.d2o(dpos,program)
		let tok = res.tok = ts.findPrecedingToken(opos,sourceFile)

		res.stmt = ts.findAncestor(res.tok,ts.isStatement)
		res.container = ts.getThisContainer(res.tok)
		return res

	def getLocation dpos, opos = null
		opos ??= script.d2o(dpos,program)
		new ImbaMappedLocation(self,dpos,opos)

	def findClosestContext dpos
		self

	def getSymbolDetails symbol
		symbol = sym(symbol)
		let details = ts.Completions.createCompletionDetailsForSymbol(symbol,checker,sourceFile,sourceFile)
		let tags = symbol.getJsDocTags!
		let md = []

		# util.log "getSymbolDetails",symbol,details,details.documentation
		for item in details.documentation
			md.push(item.text)
			md.push('\n')

		for item in tags when item.text
			let text = util.jsDocTagTextToString(item.text)
			continue if item.name.match(/^(detail|color|snippet)$/)
			# if item.name == 'see'
			md.push "*@{item.name}* — {text}"

		if typeof details.detail == 'string'
			details.detail = util.fromJSIdentifier(details.detail)

		details.markdown = md.join('\n')

		util.log('getSymbolDetails',symbol,details)

		if symbol..isMetaSymbol
			details.displayParts = []
			details.kind = ''

		return details

	def styleprop name, fallback = yes
		return null unless name
		let res = resolve('imbacss').exports.get(name.tojs!)
		if res and res.imbaTags.proxy and fallback
			return styleprop(res.imbaTags.proxy,no)

		res or (fallback and styleprop('_',no) or null)

	get metatokens
		resolve('imbameta').exports.get('tokens')

	def getMetaSymbol name
		return member(metatokens,name)

	def getMetaSymbols pattern
		props(metatokens).filter do
			# should use more advanced matching like with tokens
			$1.escapedName.indexOf(pattern) == 0

	def getTokenMetaSymbol token
		getMetaSymbol(token.type + ' ' + token.value)
		# or (fallback and getMetaSymbol(token.type))

	get stylesymbols
		Array.from(resolve('imbacss').exports.values!)

	get styleprops
		stylesymbols.filter do $1.isStyleProp

	get stylemods
		stylesymbols.filter do $1.isStyleModifier

	get styletypes
		stylesymbols.filter do $1.isStyleType

	def stylevaluetypes name, index = 0
		let target = type(member(styleprop(name),'set'))
		let signatures = checker.getSignaturesOfType(type(target),0)

		let types = []
		for entry in signatures
			let params = entry.getParameters()
			let param = params[index]
			types.push(type(param))

		return types

	def stylevalues name, index = 0, filtered = yes
		let symbols = []
		let types = stylevaluetypes(name,index)
		for typ in types
			let props = allprops(typ).filter do
				!filtered or (!($1.flags & ts.SymbolFlags.Method) and $1.escapedName != 'set')
				# $1.parent and $1.parent.escapedName.indexOf('css$') == 0
			symbols.push(...props)

		if index == 0 and !name.match(/^([xyz]|skew-[xy]|rotate(-[xyz])?|scale(-[xyz])?)$/)
			symbols.push(...props(styleprop('Ψglobals')))

		return symbols.filter do(item,i,arr) arr.indexOf(item) == i

	def getGlobalTags
		checker.getSymbolsInScope(sourceFile,4).filter do $1.escapedName[0] == 'Γ'

	def getSymbolsInScope file = sourceFile, kind = 0
		checker.getSymbolsInScope(file,kind)

	def getClassesInScope file = sourceFile, kind = 0
		checker.getSymbolsInScope(file,global.ts.SymbolFlags.Class).filter do !$1.isGlobalTag

	def getNumberUnits
		props(checker.getDeclaredTypeOfSymbol(resolve('imba').exports.get('units')))

	def getNumberUnit name
		getNumberUnits().find do $1.escapedName == name

	def getLocalTagsInScope
		let symbols = checker.getSymbolsInScope(sourceFile,32)
		for s in symbols
			type(s)
		symbols = symbols.filter do(s)
			let key = type([s,'prototype'])
			key and key.getProperty('suspend')
		return symbols

	def getDefinitionForImbaToken tok
		util.log 'getDefinitionForImbaToken',tok
		let script = tok.context.doc.owner
		let g = tok.context
		let up = null
		let out = {}

		if true
			out = {
				textSpan: tok.span
				contextSpan: tok.span
				name: tok.value
				fileName: script.fileName
				isLocal: true
				isAmbient: false
				containerKind: undefined
				containerName: ''
				unverified: false
				kind: "let"
				isWriteAccess: false
			}

			if up = g.closest('styleprop')
				out.contextSpan = up.contextSpan
				out.#comment = up.comment

		return out

	def getReferenceForImbaToken tok
		let script = tok.context.doc.owner
		let out = {
			textSpan: tok.span # {start:0, length:1}
			contextSpan: tok.span # {start:0, length:1}
			fileName: script.fileName
			isWriteAccess: true
		}
		util.log 'getReferenceForImbaToken',tok,out

		return out

	def getSymbolInfo symbol
		let md = []
		# special rules if it is an ImbaToken
		if symbol isa ImbaToken
			# util.log('getSymbolInfo for ImbaToken',symbol)
			let doc = symbol.context.doc # .owner
			let defs
			let refs

			let out = {
				displayParts: []
				displayString: ''
				kind: 'interface'
				documentation: [{text: 'Style variable?', kind: 'text'}]
				kindModifiers: 'declare'
				definitions: null
			}

			if symbol.match('style.value.var') or symbol.match('style.property.var')
				let defs = getStyleVarTokens().filter do $1.value == symbol.value
				let refs = getStyleVarReferences().filter do $1.value == symbol.value
				out.definitions = defs.map do getDefinitionForImbaToken($1)
				out.definition = out.definitions[0]
				out.references = refs.map do getReferenceForImbaToken($1)

				for item in out.definitions
					if item.#comment
						md.push(item.#comment)

				md.push(`---`) if md.length
				md.push `**Style variable**`
				md.push `[Reference](https://imba.io/docs/css/variables)`

			elif symbol.match('style.value.unit') or symbol.match('style.property.unit')
				let defs = getStyleCustomUnits().filter do $1.value == symbol.value
				out.definitions = defs.map do getDefinitionForImbaToken($1)

				if defs.length == 0
					md.push(`No unit definition found.`)

				for item in out.definitions
					if item.#comment
						md.push(item.#comment)

				md.push(`---`) if md.length
				md.push `Custom CSS unit`
				md.push `[Reference](https://imba.io/docs/css/values)`

			elif symbol.match('tag.mixin.name')
				defs = doc.getMatchingTokens('style.selector.mixin.name').filter do $1.value == symbol.value

			elif symbol.match('style.selector.mixin.name')
				defs = doc.getMatchingTokens('tag.mixin.name').filter do $1.value == symbol.value
				# md.push(`---`) if md.length
				# md.push `**Style variable**`
				# md.push `[Reference](https://imba.io/docs/css/variables)`

			if defs
				out.definitions ??= defs.map do getDefinitionForImbaToken($1)
				out.definition ??= out.definitions[0]

				for item in out.definitions
						if item.#comment
							md.push(item.#comment)

			out.documentation = [{text: md.join('\n\n'), kind: 'markdown'}]

			util.log "getSymbolInfo ImbaToken",out,symbol
			return out

		symbol = sym(symbol)
		let out = ts.SymbolDisplay.getSymbolDisplayPartsDocumentationAndSymbolKind(checker,symbol,sourceFile,sourceFile,sourceFile)
		if out
			out.displayParts &&= util.toImbaDisplayParts(out.displayParts)
			out.kindModifiers = ts.SymbolDisplay.getSymbolModifiers(checker, symbol)
			out.kind = out.symbolKind

		if symbol..isHTMLTag
			out.displayParts = []
			# md.push("**{symbol.imbaName}**\n\n")
			md.push(`[MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/{symbol.imbaName})`)

		util.log "getSymbolInfo",symbol,out

		if symbol..isMetaSymbol
			out.displayParts = []

		if md.length
			let pre = '\n\n'
			out.documentation = (out.documentation or []).concat([{text: pre + md.join('\n\n'), kind: 'markdown'}])

		return out

	def getSymbolKind symbol
		{
			kind: ts.SymbolDisplay.getSymbolKind(checker,symbol,sourceFile)
			kindModifiers: ts.SymbolDisplay.getSymbolModifiers(checker,symbol,sourceFile)
		}

	def getTagSymbol name, forAttributes = no
		let symbol
		if util.isPascal(name)
			symbol = local(name)
		else
			# check in global html types
			let root = forAttributes ? 'ImbaHTMLTags' : 'HTMLElementTagNameMap'
			symbol = sym("{root}.{name}") or sym("HTMLElementTagNameMap.{name}")

			unless symbol
				# let key = name.replace(/\-/g,'_') + '$$TAG$$'
				let typ = (type("globalThis.{util.toCustomTagIdentifier(name)}") or type(util.toCustomTagIdentifier(name)))
				if typ
					symbol = typ.symbol
				# symbol = sym("globalThis.{util.toCustomTagIdentifier(name)}")

			unless symbol
				if let cname = util.tagNameToClassName(name)
					symbol = sym("globalThis.{cname}")

		return symbol

	def getTagSymbolInstance name, forAttributes = no
		let res = getTagSymbol(name,forAttributes)
		if !sym("HTMLElementTagNameMap.{name}")
			res = sym([res,'prototype'])
		return res

	def getEvents
		props("ImbaEvents")

	def getEventModifiers eventName
		let all = props("ImbaEvents.{eventName}")
		all = all.filter do $1.escapedName != 'αoptions' and $1.escapedName[0] == 'α'
		return all

	def getEventModifier eventName, modifierName
		let ev = sym("ImbaEvents.{eventName}.α{modifierName}")
		return ev

	def getTagAttrSymbol tagName,attrName
		let key = util.toJSIdentifier(attrName)
		let taginst = getTagSymbolInstance(tagName,yes)
		let res = sym([taginst,key])

		unless res
			taginst = getTagSymbolInstance(tagName)
			res = sym([taginst,key])
		return res

	def arraytype inner
		checker.createArrayType(inner or basetypes.any)

	def resolve name,types = ts.SymbolFlags.All, location = null
		if (/^\$\w+\$$/).test(name)
			return self[name.slice(1,-1)]

		if MonarchUtils.isTagIdentifier(name)
			let hit = MonarchUtils.tagNameToClassName(name)
			# util.log 'is tag identifier!!',hit
			if hit and hit.name
				name = hit.name

		let sym = checker.resolveName(name,location or sourceFile,symbolFlags(types),false)
		return sym

	def getSymbols types = ts.SymbolFlags.All, location = null
		let sym = checker.getSymbolsInScope(location or sourceFile,symbolFlags(types))
		return sym

	def symToPath sym
		let pre = ''
		if sym.parent
			pre = symToPath(sym.parent) + '.'
		return pre + checker.symbolToString(sym,undefined,0,0)

	def findAmbientModule src
		let mod = checker.tryFindAmbientModuleWithoutAugmentations(src)
		mod and checker.getMergedSymbol(mod)

	def resolveModuleName path, containingFile = null
		let res = project.resolveModuleNames([path],containingFile or sourceFile.fileName)
		return res[0] and res[0].resolvedFileName

	def getModuleSymbol src, containingFile = null
		let path = resolveModuleName(src,containingFile)
		let file = program.getSourceFile(path)
		return file..symbol
		# t.checker.getExportsOfModule(s2.symbol)

	def resolveImportInfo info, tok, doc
		# may need to force the checker to re-resolve
		let sym = getModuleSymbol(info.path)
		# util.log "resolving import",info,sym
		if sym
			if info.exportName == '*'
				return type(sym)
			elif info.exportName == 'default'
				if let classic = sym.exports..get('export=')
					return type(classic)

			return type(member(sym,info.exportName))
		return null

	def pathToSym path
		if path[0] == '"'
			let end = path.indexOf('"',1)
			let src = path.slice(1,end)
			let abs = ts.pathIsAbsolute(src)
			let mod = abs ? program.getSourceFile(src).symbol : findAmbientModule(src)
			return sym([mod].concat(path.slice(end + 2).split('.')))
		return sym(path)

	def parseType string, token, returnAst = no
		string = string.slice(1) if string[0] == '\\'
		if let cached = #typecache[string]
			return cached

		let ast
		try
			ast = ts.parseJSDocTypeExpressionForTests(string,0,string.length).jsDocTypeExpression.type
			ast.resolved = resolveTypeExpression(ast,{text: string},token)
			return ast if returnAst
			return #typecache[string] = ast.resolved
		catch e
			yes

	def collectLocalExports
		let exports = {}
		let files = program.getSourceFiles!
		for file in files
			continue if file.path.indexOf('node_modules') >= 0
			let sym = file.symbol
			exports[file.path] = {}
		return exports

	def resolveTypeExpression expr, source, ctx
		let val = expr.getText(source)

		if expr.elements
			let types = expr.elements.map do resolveTypeExpression($1,source,ctx)
			return checker.createArrayType(types[0])

		if expr.elementType
			let type = resolveTypeExpression(expr.elementType,source,ctx)
			return checker.createArrayType(type)

		if expr.types
			let types = expr.types.map do resolveTypeExpression($1,source,ctx)
			return checker.getUnionType(types)
		if expr.typeName
			let typ = local(expr.typeName.escapedText,#file,'Type')
			if typ
				return checker.getDeclaredTypeOfSymbol(typ)
				# return type(typ)
		elif basetypes[val]
			return basetypes[val]

	def local name, target = sourceFile, types = ts.SymbolFlags.All
		let sym = checker.resolveName(name,loc(target),symbolFlags(types),false)
		return sym

	def symbolFlags val
		if typeof val == 'string'
			val = ts.SymbolFlags[val]
		return val

	def signature item
		let typ = type(item)
		let signatures = checker.getSignaturesOfType(typ,0)
		return signatures[0]

	def fileRef value
		return undefined unless value

		if value.fileName
			value = value.fileName

		if typeof value == 'string'
			program.getSourceFile(value)
		else
			value

	set location value
		let item = loc(value)
		#location = item

	get location
		#location

	def loc item, backup
		return undefined unless item

		if item isa global.Token
			return item
		if item isa global.NodeObject
			return item
		if item isa global.SymbolObject
			return item.valueDeclaration or loc(backup)
		if item isa ImbaMappedLocation
			return item.otoken

		if typeof item == 'number'
			return ts.findPrecedingToken(item,sourceFile)
		if item.fileName
			return program.getSourceFile(item.fileName)

		return item

	def csstype name
		checker.getDeclaredTypeOfSymbol(cssmodule.exports.get("css${name}"))

	def snippets name
		try props(checker.getDeclaredTypeOfSymbol(resolve('imba_snippets').exports.get(name))) catch e []

	def type item, declaredType = no
		if typeof item == 'string'
			if item.indexOf('.') >= 0
				item = item.split('.')
			else
				item = resolve(item)

		if item isa Array
			let base = type(item[0])
			for entry,i in item when i > 0
				let val = type(member(base,entry))
				if !val and i == 1 and base.exports
					val = base.exports.get(entry)
				base = val
			item = base

		if item isa SymbolObject
			if (item.flags & ts.SymbolFlags.Interface) or (item.flags & ts.SymbolFlags.Class)

				let itype = #caches.instanceType.get(item)
				itype or #caches.instanceType.set(item,itype = checker.getDeclaredTypeOfSymbol(item))

				# item.instanceType_ ||= checker.getDeclaredTypeOfSymbol(item)

				unless item.flags & ts.SymbolFlags.Value
					return itype

				if declaredType
					return itype

			item.type_ ||= checker.getTypeOfSymbolAtLocation(item,loc(item) or loc(script))
			return item.type_

		if item isa TypeObject
			return item

		if item isa Signature
			return item.getReturnType!

	def sym item
		if typeof item == 'string'
			if item.indexOf('.') >= 0
				item = item.split('.')
			else
				item = resolve(item)

		if item isa Array
			let base = sym(item[0])
			for entry,i in item when i > 0
				let mem = member(base,entry)
				if !mem and entry == 'prototype'
					continue

				base = sym(mem)

			item = base

		if item isa SourceFile
			item.symbol

		if item isa SymbolObject
			return item

		if item isa TypeObject and item.symbol
			return item.symbol

		return null

	def locals source = (#file or script)
		let file = fileRef(source)
		let locals = file.locals.values!
		return Array.from(locals)

	def props item, withTypes = no
		let typ = type(item)
		return [] unless typ

		let props = typ.getApparentProperties!
		if withTypes
			for item in props
				type(item)
		return props

	def valueprops item, withTypes = no
		let all = self.props(item,withTypes)
		all = all.filter do !$1.isDecorator
		return all

	def ownprops item, withTypes = no
		let typ = type(item)
		return [] unless typ

		let props = typ.getProperties!
		if withTypes
			for item in props
				type(item)
		return props

	def allprops item, withTypes = no
		let typ = type(item)
		return [] unless typ

		let props = typ.types ? checker.getAllPossiblePropertiesOfTypes(typ.types) : typ.getApparentProperties!

		if withTypes
			for item in props
				type(item)
		return props

	def statics item, withTypes = no
		yes

	def propnames item
		let values = type(item).getApparentProperties!
		values.map do $1.escapedName

	def getSelf loc = #location
		yes

		# checker.getSymbolAtLocation(f0.checker.loc(25))

	def member item, name
		return unless item

		if typeof name == 'number'
			name = String(name)

		# if name isa Array
		let key = name.replace(/\!$/,'')
		let jskey = util.toJSIdentifier(key)
		let typ = type(item)

		if name == 'prototype' and typ and typ.symbol and typ.objectFlags & ts.ObjectFlags.Interface
			# util.log 'skip prototype',item,typ
			return typ.symbol

		unless typ and typ.getProperty isa Function
			util.log 'tried getting type',item,key,typ

		let sym = typ.getProperty(key)

		if !sym and key != jskey
			sym = typ.getProperty(jskey)

		if key == '__@iterable'

			let resolvedType = checker.getApparentType(typ)
			util.log('get type of iterable',typ,resolvedType)

			return null unless resolvedType.members
			let members = Array.from(resolvedType.members.values())
			sym = members.find do $1.escapedName.indexOf('__@iterator') == 0
			# sym = resolvedType.members.get('__@iterator')
			util.log('resolving Type',members,sym)

			return type(signature(sym)).resolvedTypeArguments[0]
			#  iter.getCallSignatures()[0].getReturnType()

		if sym == undefined
			let resolvedType = checker.getApparentType(typ)
			return null unless resolvedType.members
			sym = resolvedType.members.get(key) or resolvedType.members.get(jskey)

			if name.match(/^\d+$/)
				sym ||= typ.getNumberIndexType!
			else
				sym ||= typ.getStringIndexType!

		if key !== name
			sym = signature(sym)
		return sym

	def inferType tok, doc, loc = null

		util.log('inferType',tok)

		if tok isa Array
			return tok.map do inferType($1,doc)

		if typeof tok == 'number' or typeof tok == 'string'

			if typeof tok == 'string' and tok[0] == '\\'
				return parseType(tok,null)

			return tok

		if tok isa ImbaNode
			let node = tok
			let g = tok
			if g.type == 'type'
				let val = String(tok)
				return parseType(val,tok)

			if g.match('decorator')
				# util.log('infer type of decorator')
				# might as well just go for the name token?
				let tstok = findExactLocationForToken(g.nameToken)
				if tstok
					let typ = tok.#otyp = getResultTypeAtLocation(tstok)
					return typ
				return null

			if g.match('value') or g.match('parens')
				let end = g.end.prev
				while end and g.match('br')
					end = end.prev
				# end = end.prev if end.match('br')
				tok = end
				let typ = inferType(tok,doc,tok)
				# move away from this hack - prioritize compiled inference
				if node.start.next.match('keyword.new')
					typ = [typ,'prototype']

				return typ

		let sym = tok.symbol
		let typ = tok.type

		# is an imported variable

		if tok isa ImbaSymbol
			let typ = tok.datatype

			if typ and typ.exportName
				return resolveImportInfo(typ,tok,doc)

			if typ
				return inferType(typ,doc)

			# now try to calculate the previous position of this
			# try to find the matching location / symbol in typescript
			let opos = mapper.d2o(tok.node.endOffset)
			let otoken = ts.findPrecedingToken(opos,sourceFile)

			try
				# must be the same type of item and the pos should not have moved?
				typ = getTypeAtLocation(otoken)
				tok.node.#otyp = typ
				return typ if typ

			if tok.body
				# doesnt make sense
				return resolveType(tok.body,doc)

			return basetypes.any

		let value = tok.pops

		if value
			if value.match('index')
				return [inferType(value.start.prev),'0']

			if value.match('args')
				let res = type(signature(inferType(value.start.prev)))
				return res

			if value.match('array')
				return arraytype(basetypes.any)

			if value.match('parens')
				return inferType(value,doc,tok)

		if tok.match('tag.event.start')
			return 'ImbaEvents'

		if tok.match('tag.event.name')
			# maybe prefix makes sense to keep after all now?
			return ['ImbaEvents',tok.value]

		if tok.match('tag.event-modifier.start')
			# maybe prefix makes sense to keep after all now?
			return [['ImbaEvents',tok.context.name],'MODIFIERS']
			# return ['ImbaEvents',tok.value]

		if typ == ')' and tok.start
			# usually better to look for the exact token location first
			return [inferType(tok.start.prev),'!']

		if tok.match('number')
			return basetypes.number

		elif tok.match('string')
			return basetypes.string

		if tok.match('operator.access')
			if tok.prev..type == ')' and tok.prev.start
				let otok = findExactLocationForToken(tok.prev)

				if otok
					let typ = tok.#otyp = getTypeAtLocation(otok)
					return typ

			let typ = inferType(tok.prev,doc)

			unless typ
				let otok = findExactLocationForToken(tok.prev)
				if otok
					return tok.#otyp = getTypeAtLocation(otok)

			return typ

		if tok.type == 'self'
			# what if the selfPath doesnt work?
			return tok.context.selfScope.selfPath

		if tok.match('identifier.special')
			let argIndex = tok.value.match(/^\$\d+$/) and parseInt(tok.value.slice(1)) - 1
			let container = ts.getThisContainer(tok)
			if argIndex == -1
				return resolve('arguments',container)

			return checker.getContextualTypeForArgumentAtIndex(container,argIndex)

		if tok.match('identifier')
			# what if it is inside an object that is flagged as an assignment?
			if tok.value == 'global'
				return 'globalThis'

			if (!sym or !sym.desc..datatype) and !tok.value.match(/\!$/)
				# check if sym and sym has datatype(!)
				let otok = tok.#otok = findExactLocationForToken(tok)
				util.log('found exact token for identifier?!',tok,otok)

				if otok
					return tok.#otyp = getTypeAtLocation(otok)

			if !sym
				let scope = tok.context.selfScope

				if tok.value == 'self'
					return scope.selfPath

				let accessor = tok.value[0] == tok.value[0].toLowerCase!

				if accessor
					# util.log('selfPath?',scope.selfPath)
					return [scope.selfPath,tok.value]
				else
					# need to resolve locally though
					util.log('resolve as local?!',tok)
					return type(self.local(tok.value))

			# type should be resolved at the location it is in(!)
			# tok has a symbol
			util.log('resolveType for',sym,tok)
			return resolveType(sym,doc,tok)

		if tok.match('accessor')
			# let lft = tok.prev.prev
			return [inferType(tok.prev,doc),tok.value]

	def resolveType tok, doc, ctx = null
		let paths = inferType(tok,doc || script.doc,ctx)
		util.log('resolvedType',tok,paths)
		return type(paths)

	def findExactLocationForToken token
		if typeof token == 'number'
			token = script.doc.tokenAtOffset(token)
		try
			# see if it has moved since before
			let dpos = token.endOffset
			let ipos = mapper.d2i(dpos)
			let opos = mapper.i2o(ipos)
			util.log('find token pos',dpos,ipos,opos)
			let otok = ts.findPrecedingToken(opos,sourceFile)

			if ipos == dpos and otok
				# util.log 'location has not changed',dpos,ipos,opos,otok
				return otok
				# see if it is the same type as well
			return null

	def findExactLocationForOffset dpos
		try
			if typeof dpos.start == 'number' and typeof dpos.length == 'number'
				dpos = dpos.start + dpos.length
			# see if it has moved since before
			let ipos = mapper.d2i(dpos)
			let opos = mapper.i2o(ipos)
			let otok = ts.findPrecedingToken(opos,sourceFile)

			if ipos == dpos and otok
				return otok
				# see if it is the same type as well
			return null

	def findExactSymbolForToken dtok
		let otok = findExactLocationForToken(dtok)
		if otok
			let sym = checker.getSymbolAtLocation(otok)
			if sym and sym.escapedName == 'default'
				sym = ts.getLocalSymbolForExportDefault(sym) or sym
			return sym
		return null

	# type at imba location
	def typeAtLocation offset

		let tok = script.doc.tokenAtOffset(offset)
		# let ctx = script.doc.getContextAtOffset(offset)
		util.log('typeAtLocation',offset,tok)
		# let loc = getLocation(offset)
		let inferred = inferType(tok,script.doc,tok)
		return inferred

	def getStyleVarTokens
		global.ils.findImbaTokensOfType('style.property.var')

	def getStyleVarReferences
		global.ils.findImbaTokensOfType('style.value.var')

	def getStyleCustomUnits
		global.ils.findImbaTokensOfType('style.property.unit.name')

	def getMixinReferences
		global.ils.findImbaTokensOfType('.mixin.name')

	def getTagDeclarationNames
		global.ils.findImbaTokensOfType('entity.name.component')

	def getSignatureHelpForType typ, name

		typ = type(typ)
		let sign = checker.getSignaturesOfType(typ,0)
		let prev = checker.getResolvedSignatureForSignatureHelp
		let predOfSign = checker.getTypePredicateOfSignature
		let res
		return unless typ and sign and sign.length

		checker.getResolvedSignatureForSignatureHelp = do(node,candidates,argCount)
			candidates.push(...sign)
			util.log('quick return signature',node,candidates,argCount,sign)
			return sign
			# util.log('checker getContextualType',...args)
			# return prev.call(checker,...args)

		checker.getTypePredicateOfSignature = do undefined

		try
			let cancel = {throwIfCancellationRequested: do yes}
			res = ts.SignatureHelp.getSignatureHelpItems(program,sourceFile,17,{kind: 'invoked', triggerCharacter: "("},cancel)

		checker.getTypePredicateOfSignature = predOfSign
		checker.getResolvedSignatureForSignatureHelp = prev

		if res and name
			for item in res.items
				item.prefixDisplayParts[0].text = name

		return res

	get autoImports
		#autoImports ||= new AutoImportContext(self)
