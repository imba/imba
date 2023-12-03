
import * as util from './util'
import Context from './context'

import {Sym as ImbaSymbol,CompletionTypes as CT, Token as ImbaToken} from 'imba-monarch'
import type ImbaScript from './script'

const Globals = "global imba module window document exports console process parseInt parseFloat setTimeout setInterval setImmediate clearTimeout clearInterval clearImmediate globalThis isNaN isFinite __dirname __filename".split(' ')

const Keywords = "and await begin break by case catch class const continue css debugger def get set delete do elif else export extend false finally for if import in instanceof is isa isnt let loop module new nil no not null of or require return self static super switch tag then this throw true try typeof undefined unless until when while yes".split(' ')

###
CompletionItemKind {
		Text = 0,
		Method = 1,
		Function = 2,
		Constructor = 3,
		Field = 4,
		Variable = 5,
		Class = 6,
		Interface = 7,
		Module = 8,
		Property = 9,
		Unit = 10,
		Value = 11,
		Enum = 12,
		Keyword = 13,
		Snippet = 14,
		Color = 15,
		Reference = 17,
		File = 16,
		Folder = 18,
		EnumMember = 19,
		Constant = 20,
		Struct = 21,
		Event = 22,
		Operator = 23,
		TypeParameter = 24
	}
###

export class Completion

	data = {}
	label = {}
	exportInfo = null

	constructor symbol, context\Completions, options = {}
		#cache = {}
		#context = context
		#options = options
		sym = #symbol = symbol
		weight = options.weight or 1000

		item = {data: data, label: label, sortText: ""}
		load(symbol,context,options)
		kind = options.kind if options.kind

		setup_!
		triggers options.triggers
		finalize!

	def load symbol, context, options = {}
		yes
		self

	def setup_
		setup!

	def setup
		Object.assign(item,sym)

	def match matcher
		if matcher isa RegExp
			return matcher.test(name)
		return no

	def finalize
		yes

	get id
		return #nr if #nr >= 0
		#nr = #context.items.indexOf(self)

	get cat
		#options.kind or ''

	get checker
		#context.checker

	get program
		checker.program

	get script
		checker.script

	get #type
		#symbol.type or #symbol.type_

	get weight
		#weight or #options.weight

	set weight val
		#weight = val

	get doc
		#context.doc

	def triggers chars = ''
		return self unless chars
		let list = item.commitCharacters ||= []
		for chr of chars
			list.push(chr) unless list.indexOf(chr) >= 0
		return self

	def #resolve
		if #resolved =? yes
			resolve!
		return item

	def resolve
		self

	get completion
		self

	get source
		null

	set kind kind
		item.kind = kind

	get kind
		item.kind

	get cat
		#options.kind

	set name val do label.name = val
	get name do label.name

	set type val do label.type = val
	get type do label.type

	set desc val do label.description = val
	get desc do label.description

	set detail val
		item.detail = val

	get detail
		item.detail

	set ns val
		if val isa Array
			val = val[0]

		if val and val.text
			val = val.text

		label.qualifier = val

	get ns
		label.qualifier

	set documentation val
		item.documentation = val

	get uniqueName
		#uniqueName or item.insertText or name

	get filterName
		item.insertText or name

	def shouldBeIncluded stack
		yes

	def serialize stack = {}
		let o = #options

		let key = uniqueName

		if sym.isInternal
			return null

		unless shouldBeIncluded(stack)
			return null

		if stack[key]
			return null

		if o.matchRegex
			return null unless o.matchRegex.test(filterName)

		stack[key] = self

		if o..commitCharacters
			item.commitCharacters = o.commitCharacters
		if #weight != undefined
			item.sortText ||= util.zerofill(#weight)
			data.nr = id
		# item.data.id ||= "{#context.file.id}|{#context.id}|{id}"
		return item

	def resolveImportEdits
		let ii = importInfo or {}

		if ii.namespacePrefix and cat != 'tagname'
			item.insertText = ii.namespacePrefix + '.' + importName
			return self

		if ii.importClauseOrBindingPattern
			let named = ii.importClauseOrBindingPattern..namedBindings..elements
			for entry in (named or [])
				if entry.propertyName..escapedText == importName
					item.insertText = entry.name.escapedText
					return self

		if let ei = exportInfo
			let asType = ei.exportedSymbolIsTypeOnly or #options.kind == 'type'
			let path = ii.moduleSpecifier or ei.packageName or util.normalizeImportPath(script.fileName,ei.modulePath or ei.moduleSpecifier)
			let alias = ei.importName or ei.exportName or ei.symbolName or importName or ei.symbol..escapedName
			let name = (ei.exportKind == 1 or ei.exportKind == 2) ? 'default' : (ei.symbolTableKey or ei.exportName or ei.symbolName or importName or ei.symbol..escapedName)
			if ei.exportKind == 3
				name = '*'

			let edits = script.doc.createImportEdit(path,util.toImbaIdentifier(name),util.toImbaIdentifier(alias),asType)

			if edits.changes.length
				item.additionalTextEdits = edits.changes

		elif ii.moduleSpecifier
			let path = ii.moduleSpecifier
			let name = importName
			let edits = script.doc.createImportEdit(path,util.toImbaIdentifier(name),util.toImbaIdentifier(name),false)
			if edits.changes.length
				item.additionalTextEdits = edits.changes

		self

export class SymbolCompletion < Completion

	get symName
		sym.imbaName

	def setup
		# let cat = #options.kind
		let par = sym.parent
		let tags = sym.imbaTags or {}
		let o = #options
		let f = sym.flags
		let ei = exportInfo

		name = symName
		item.cat = cat
		data.kind = cat

		try
			Object.assign(item,checker.getSymbolKind(sym))

		if #options.range
			item.range = #options.range

		if cat == 'numberunit'
			# TODO Generalize for all completion types
			# kind = 11
			kind = 10
			name = o.prefixCompletion + name
			item.filterText = name

		# let pname = sym.parent..escapedName
		elif cat == 'styleprop'
			#uniqueName = name

			if tags.alias and #options.abbr
				item.insertText = ns = tags.alias
			elif tags.proxy
				ns = tags.proxy
			triggers ':@.=^'
			kind = 9

		elif cat == 'styleval'
			weight = name[0] == '-' ? 2000 : 1000
			triggers ' '
			# let type = sym.parent.escapedName.slice(4)
			let desc = sym.getDocumentationComment! or []
			if desc[0] and desc[0].text
				ns = desc[0].text

			if tags.color
				kind = 15
				let shade = name.slice(-1)

				if shade == '4'
					item.sortText = "color-0-{name}"
				else
					item.sortText = "color-1-{name}"

				item.filterText = "{name}_{name}"

				detail = tags.color
				label.description = tags.color
			else
				kind = 'enum'

		elif cat == 'stylemod'
			ns = tags.detail
			# name = name.slice(1)
			kind = 'event'
			triggers ':= '

		elif cat == 'stylesel'
			triggers ' [.(@'
			kind = 'keyword'

		elif cat == 'tagevent'
			triggers '.=('
			kind = 'event'
			name = '@' + name

		elif cat == 'tageventmod'
			triggers '.='
			name = name.slice(1)
			# check signatures?
			if tags.detail..match(/^\(/)
				triggers '('

		elif cat == 'tagname'
			triggers '> .[#'
			kind = 'value'

		elif cat == 'tag'
			triggers ' '
			kind = 'value'
			item.filterText = name
			name = item.insertText = "<{name}>"
		elif cat == 'type'
			type = 'type'
			triggers ' [=,|&'
		else
			type = item.kind
			triggers '!(,.['

		if cat == 'decorator'
			triggers ' ('

		if cat == 'implicitSelf'
			# item.insertText = item.filterText = name
			# name = "self.{name}"
			# ns = "self"
			yes

		if tags.snippet
			let snip = tags.snippet
			if cat == 'tag'
				snip = "<{snip}>"
			item.insertSnippet = snip
			type = 'snippet'
			if snip.indexOf('$') >= 0
				item.commitCharacters = []

		if tags.importStar
			ns = "import from {tags.importStar}"
			ei = exportInfo = ei = {
				packageName: tags.importStar
				exportName: '*'
				importName: name
				modulePath: tags.importStar
				commitCharacters: ['.']
			}

		if tags.detail
			ns ||= tags.detail

		# check export info
		if ei
			if ei.packageName
				ns = "import from {ei.packageName}"
			else
				ns = "import from {util.normalizeImportPath(script.fileName,ei.modulePath)}"

			item.source = ns.slice(12)
			if ei.exportName == '*'
				ns = ns.replace(/^import /,'import * ')

			# dont be trigger-happy with commitCharacters for imports
			# should still be if the import compes
			item.commitCharacters = item.commitCharacters.filter do(item)
				".!([, ".indexOf(item) == -1

			if ei.commitCharacters
				item.commitCharacters = ei.commitCharacters
			else
				# make filter-text longer for imports to let variables rank earlier
				# but they should not work this way?
				item.filterText = (item.filterText or name) + "        "
				item.sortText = name

	def resolve
		try
			let details = checker.getSymbolDetails(sym,item)

			item.markdown = details.markdown

			if let docs = details.documentation
				item.documentation = docs # global.session.mapDisplayParts(docs,checker.project)

			if let dp = details.displayParts
				unless cat.indexOf('style') >= 0
					item.detail = util.displayPartsToString(util.toImbaDisplayParts(dp))

			util.log 'resolve completion',item,details,self
			resolveImportEdits!
		catch e
			util.log 'error when resolving completion',e,self
		self

export class AutoImportCompletion < SymbolCompletion

	def load data, context, options = {}
		importData = data
		exportInfo = data
		sym = data.symbol
		# resolve it immediately?
		self

	def setup
		name = importData.exportName
		try resolveSpecifier!
		self

	def resolveSpecifier
		let out = #context.checker.autoImports.resolve([importData])
		importInfo = out[0]
		exportInfo = importInfo.exportInfo or importData.exportInfo[0]
		item.detail = importInfo.moduleSpecifier
		desc = item.source = importInfo.moduleSpecifier

		if importInfo.namespacePrefix and cat != 'tagname'
			item.insertText = importInfo.namespacePrefix + '.' + importName

		elif importInfo.importClauseOrBindingPattern
			let named = importInfo.importClauseOrBindingPattern..namedBindings..elements
			for entry in (named or [])
				if entry.propertyName..escapedText == importName
					item.insertText = entry.name.escapedText
		return self

	def resolve
		resolveImportEdits! unless item.insertText
		self

	get symName
		util.toImbaIdentifier(importData.exportName)

	get importPath
		exportInfo..packagName or exportInfo..modulePath

	get importName
		importData..exportName

	get uniqueName
		symName + importPath

	def shouldBeIncluded stack
		# if there is a variable or other property with this name
		if stack[symName]
			return no
		return yes

export class ImbaSymbolCompletion < Completion

	def setup
		name = sym.name

export class ImbaTokenCompletion < Completion

	def setup
		let o = #options
		name = sym.value

		if cat == 'mixin'
			name = ('%' + name).replace(/\%/g,'')

		if o.prefixCompletion
			name = o.prefixCompletion + name
			item.filterText = name

		if cat == 'numberunit'
			kind = 10

export class KeywordCompletion < Completion
	def setup
		name = sym.name
		triggers ' '

export class PathCompletion < Completion

	def setup
		let ext = util.extensionForPath(sym.path)
		# let norm = util.normalizeImportPath(script.fileName,sym)
		name = sym.name or sym.importPath
		item.detail = util.nameForPath(sym.path)
		item.cat = sym.kind or 'file'

		if sym.name
			item.insertText = sym.name.replace(/\.imba$/,'')

		if sym.kind == 'dir'
			triggers '/'

export default class Completions

	constructor script\ImbaScript, pos, prefs
		self.script = script
		self.pos = pos
		self.prefs = prefs
		self.ls = ls or script.ls
		self.meta = {}
		self.config = global.ils.getConfig('suggest',{})

		#prefix = ''
		#added = {}
		#uniques = new Map

		items = []
		resolve!

	get opos
		#opos ??= script.d2o(pos)

	get checker
		# should we choose configured project or?
		#checker ||= script.getTypeChecker!

	get autoimporter
		checker.autoImports

	get triggerCharacter
		prefs.triggerCharacter

	def resolve
		ctx = script.doc.getContextAtOffset(pos)
		tok = ctx.token
		flags = ctx.suggest.flags
		prefix = ''

		if tok.match('identifier')
			prefix = ctx.before.token

		if ctx.suggest.prefix
			prefix = ctx.suggest.prefix

		if prefix
			prefixRegex = new RegExp("^[\#\_\$\<]*{prefix[0] or ''}")

		util.log('resolveCompletions',self,ctx,tok,prefix)

		if triggerCharacter == '/' and !(flags & CT.Path)
			return

		# suppress completions after / which is used as a trigger in paths
		if ctx.before.line.match(/\/\w+$/) and !(flags & CT.Path)
			return

		if triggerCharacter == '=' and !tok.match('operator.equals.tagop')
			return

		# only show completions directly after : in styles
		if triggerCharacter == ':' and !tok.match('style.property.operator')
			return

		if tok.match('style.value.unit')
			let num = tok.prev.value
			add('styleunits',kind: 'numberunit', prefixCompletion: num)

		elif tok.match('style.value.number')
			let num = tok.value
			add('styleunits',kind: 'numberunit', prefixCompletion: num)

		elif tok.match('unit')
			let num = tok.prev.value
			add('numberunits',kind: 'numberunit', prefixCompletion: num)

		elif tok.match('.mixin') or ctx.before.line.match(/^\t*\<?\%\w*$/) or ctx.before.line.match(/^\<\%\w*$/)
			# util.log "match mixin!"
			let mixins = checker.getMixinReferences()
			# util.log('add custom units',mixins)
			# util.log('add default units??',checker.getMetaSymbols('style.value.unit '))
			add(mixins,kind: 'mixin')
			return self
			# add(checker.getMetaSymbols('style.value.unit '),o)

			# only if in styles
		elif tok.match('number')
			let num = tok.value
			add('numberunits',kind: 'numberunit', prefixCompletion: num)

		if flags & CT.TagName
			util.log('resolveTagNames',ctx)
			add('tagnames',kind: 'tagname')

		if flags & CT.StyleModifier
			add checker.stylemods, kind: 'stylemod', range: ctx.suggest.stylemodRange

		if flags & CT.StyleSelector
			add checker.props('ImbaHTMLTags',yes), kind: 'stylesel'

		if flags & CT.StyleProp
			let cfg = config.preferAbbreviatedStyleProperties
			let inline = !ctx.group.closest('rule')
			let abbr = cfg != 'never' and (inline or cfg != 'inline')
			add checker.styleprops, kind: 'styleprop',abbr: abbr

		if flags & CT.StyleVar
			add 'stylevar', kind: 'styleval'

		elif flags & CT.StyleValue
			add 'stylevalue', kind: 'styleval'

		if flags & CT.Decorator
			add 'decorators', kind: 'decorator'

		if flags & CT.DecoratorModifier
			try
				let typ = checker.inferType(ctx.target,script.doc)
				if typ
					let props = checker.valueprops(typ).filter do !$1.isWebComponent
					add props, kind: 'access', matchRegex: /^[^\#\$\@\_]/

		if flags & CT.TagEvent
			add checker.props("ImbaEvents"), kind: 'tagevent'

		if flags & CT.TagEventModifier
			add checker.getEventModifiers(ctx.eventName), kind: 'tageventmod'

		if flags & CT.TagProp
			add('tagattrs',name: ctx.tagName)

		if flags & CT.Type
			add('types',kind: 'type')

		if flags & CT.Path
			add('paths',kind: 'path')

		if flags & CT.Access
			if ctx.target == null
				let selfpath = ctx.selfPath
				let selfprops = checker.valueprops(selfpath)
				# || checker.props(loc.thisType)
				add(selfprops,kind: 'implicitSelf', weight: 300, matchRegex: prefixRegex)
			else
				let typ = checker.inferType(ctx.target,script.doc)

				if typ
					let props = checker.valueprops(typ).filter do !$1.isWebComponent
					add props, kind: 'access', matchRegex: prefixRegex

		if flags & CT.Value
			add('values')

		if flags & CT.ClassBody
			yes

		if triggerCharacter == '<' and ctx.after.character == '>'
			add completionForItem({
				commitCharacters: [' ','<','=']
				filterText: ''
				preselect: yes
				sortText: "0000"
				kind: 'snippet'
				textEdit: {start: pos, length: 1, newText: ''}
				label: {name: ' '}
				action: 'cleanAngleBrackets'
			})
		# if triggerCharacter == '.' and tok.match('operator.access') and items.length
		# 	add completionForItem({
		# 		filterText: ''
		# 		commitCharacters: []
		# 		preselect: yes
		# 		sortText: "0000"
		# 		textEdit: {start: pos, length:0, newText: ''}
		# 		kind: 'snippet'
		# 		label: {name: ' '}
		# 	})
		self

	def stylevalue o = {}
		# let node = ctx.group.closest('styleprop')
		let name = ctx.suggest.styleProperty
		# let name = node..propertyName
		let before = ctx..before..group
		let nr = before ? (before.split(' ').length - 1) : 0

		let symbols = checker.stylevalues(name,nr)
		add symbols,o
		self

	def stylevar o = {}
		let found = checker.getStyleVarTokens()
		add found,o

	def decorators o = {}
		# should include both global (auto-import) and local decorators
		# just do the locals for now?

		let vars = script.doc.varsAtOffset(pos).filter do $1.name[0] == '@'
		add(vars,o)

		try
			let selfpath = ctx.selfPath
			let selfprops = checker.props(selfpath)
			add(selfprops,kind: 'implicitSelf', weight: 300, matchRegex: /^\@[^\@]/)

		# get decorators from the class body

		# add the defaults from imba
		let builtins = checker.props('imba').filter do $1.isDecorator
		add(builtins,o)

		let imports = checker.autoImports.getExportedDecorators!
		add(imports, o)
		self

	def tagnames o = {}
		let html = checker.props('HTMLElementTagNameMap')
		add(html,o)

		let locals = checker.sourceFile.getLocalTags!

		add(locals,o)
		# add(checker.getGlobalTags!,o) # nope?

		util.log "local tags",locals

		try
			let autoTags = autoimporter.getExportedTags!
			add(autoTags,o)
		catch e
			util.log "autoimport error",e

		add(checker.snippets('tags'),o)

	def numberunits o = {}
		add(checker.getMetaSymbols('unit '),o)
		# add(checker.getNumberUnits!,o)

	def styleunits o = {}
		let customUnits = checker.getStyleCustomUnits()
		util.log('add custom units',customUnits)
		# util.log('add default units??',checker.getMetaSymbols('style.value.unit '))
		add(customUnits,o)
		add(checker.getMetaSymbols('style.value.unit '),o)

	def types o = {}

		if ctx.before.group.match(/^\\\<[\w-]*$/)
			add(checker.getGlobalTags!,o)
		else
			add(checker.snippets('types'),o)
			# all globally available types
			let typesymbols = checker.getSymbols('Type')
			add(typesymbols,o)
			add(checker.autoImports.getExportedTypes!,{kind: 'type', weight: 2000})

	def tagattrs o = {}
		let sym = checker.sym("HTMLElementTagNameMap.{o.name}")

		let pascal = o.name[0] == o.name[0].toUpperCase!
		let globalPath = pascal ? o.name : util.toCustomTagIdentifier(o.name)

		unless sym
			sym = try checker.sym("{globalPath}.prototype")

		if sym
			# this is a native tag
			let attrs = checker.props(sym).filter do(item)
				let par = item.parent..escapedName
				return no if par == "GlobalEventHandlers"
				return no if item.escapedName.match(/className|(__$)/)
				return item.isTagAttr

			add(attrs,{...o, commitCharacters: ['=']})
		yes

	def paths o = {}
		# look at the potential paths?
		let g = ctx.group
		return self unless g.type == 'path'

		let start = ctx.before.line.split(/["']/g).pop!
		let sources = []

		if start[0] == '.'
			let reldir = start.replace(/\/[^\/]+$/,'/')
			let dir = util.resolveImportPath(script.fileName,reldir) + '/'

			let host = script.project.directoryStructureHost
			if host
				let dirs = host.getDirectories(dir)
				let files = host.readDirectory(dir,['.imba',''],['.DS_Store'],[],1)

				sources = []

				for item in dirs
					sources.push({
						path: item
						name: item
						kind: 'dir'
					})

				for item in files
					let name = util.nameForPath(item)
					sources.push({
						path: item
						name: name
						kind: 'file'
					})

		elif start.match(/^@?[\w\-]/)
			sources = []

		else
			let fileNames = global.ils.cp.program.getRootFileNames()
			let dirs = fileNames.map(do util.dirForPath($1)).filter do $3.indexOf($1) == $2

			fileNames.map do
				sources.push {
					path: $1
					kind: 'file'
					importPath: util.normalizeImportPath(script.fileName,$1)
				}

			for dir in dirs
				sources.push({
					path: dir
					kind: 'dir'
					importPath: util.normalizeImportPath(script.fileName,dir)
				})

			# use path info from js/tsconfig?

			# drop dts files
			sources = sources.filter do !util.isDts($1.path)
			sources = sources.filter do $1.importPath..indexOf('..') == 0

		add(sources,o)

		self

	def values
		let vars = script.doc.varsAtOffset(pos)
		let symbols = []

		# find our location - want to walk to find a decent alternative
		# walk backwards to find the closest location known by typescript
		# let loc = checker.getLocation(pos,opos)

		for item in vars
			# hide decorators
			# not if we are in the right context?
			continue if item.name[0] == '@'

			let found = checker.findExactSymbolForToken(item.node)
			symbols.push(found or item)

		add(symbols,kind: 'var', weight: 200)

		if ctx.group.closest('tagcontent') and !ctx.group.closest('tag') and !ctx.before.token.match(/\s*-$/)
			add('tagnames',kind: 'tag',weight: 310)

		try
			let selfpath = ctx.selfPath
			let selfprops = checker.props(selfpath)
			# || checker.props(loc.thisType)
			add(selfprops,kind: 'implicitSelf', weight: 300, matchRegex: prefixRegex)

		# add('variables',weight: 70)
		# could also go from the old shared checker?
		add(checker.getClassesInScope!,weight: 200,matchRegex: prefixRegex, implicitGlobal: yes)
		add(checker.globals,weight: 500,matchRegex: prefixRegex, implicitGlobal: yes)

		if prefixRegex or prefs.all
			let imports1 = checker.autoImports.search(prefixRegex,global.ts.SymbolFlags.Value)
			# let imports = checker.autoImports.getVisibleExportedValues!
			# util.log('autoExports',prefixRegex,imports1,imports)
			# imports = imports.filter do $1.important or prefixRegex.test($1.importName or $1.exportName)
			add(imports1, weight: 2000)
			# check for the export paths as well

		try
			let imports = checker.snippets('imports')
			add(imports, weight: 2000)

		# variables should have higher weight - but not the global variables?
		# add('properties',value: yes, weight: 100, implicitSelf: yes)
		# add('keywords',weight: 650,startsWith: prefix)
		# add('autoimports',weight: 700,startsWith: prefix, autoImport: yes)

		if ctx.before.line.match(/^[a-z]*$/)
			add(checker.snippets('root'),kind: 'snippet')

		add(Keywords.map(do new KeywordCompletion({name: $1},self,kind: 'keyword', weight: 800)))
		self

	def completionForItem item, opts = {}
		if item isa Completion
			return item

		if item.#tsym
			item = item.#tsym

		let entry = #uniques.get(item)
		return entry if entry

		if item isa global.SymbolObject
			entry = new SymbolCompletion(item,self,opts)
		elif item isa ImbaSymbol
			entry = new ImbaSymbolCompletion(item,self,opts)
		elif item isa ImbaToken
			entry = new ImbaTokenCompletion(item,self,opts)

		elif item.hasOwnProperty('exportName')
			entry = new AutoImportCompletion(item,self,opts)
		elif item.label
			entry = new Completion(item,self,opts)

		elif opts.kind == 'path'
			entry = new PathCompletion(item,self,opts)

		#uniques.set(item,entry)
		return entry

	def add type, options = {}

		if type isa Completion
			items.push(type) unless items.indexOf(type) >= 0
			return self

		if type isa Array
			for item in type
				add(completionForItem(item,options))
			return self

		return self if #added[type]
		#added[type] = []

		let t = Date.now!
		let results = self[type](options)

		util.log "called {type}",Date.now! - t

		if results isa Array
			for item in results
				add(completionForItem(item,options))
				# items.push(completionForItem(item))
			util.log "added {results.length} {type} in {Date.now! - t}ms"

		#added[type] = results or true
		return self

	def serialize vals = items
		let entries = []
		let stack = {}
		for item in vals
			let entry = item.serialize(stack)
			entries.push(entry) if entry

		return entries

	def filter filter
		let fn = filter
		let items = items
		if filter isa RegExp
			fn = do(item) item.match(filter)
		items.filter(fn)

	def find item
		items.find do $1.name == item