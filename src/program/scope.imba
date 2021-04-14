import * as util from './utils'
import {M,KeywordTypes,SemanticTokenTypes,SemanticTokenModifiers} from './types'
import {Sym,SymbolFlags} from './symbol'

export const Globals = {
	'global': 1
	'imba': 1
	'module': 1
	'window': 1
	'document': 1
	'exports': 1
	'console': 1
	'process': 1
	'parseInt': 1
	'parseFloat': 1
	'setTimeout': 1
	'setInterval': 1
	'setImmediate': 1
	'clearTimeout': 1
	'clearInterval': 1
	'clearImmediate': 1
	'globalThis': 1
	'isNaN': 1
	'isFinite': 1
	'__dirname': 1
	'__filename': 1
}

export class Node
	type = ''
	start
	end
	parent

	def constructor doc, token, parent, type
		doc = doc
		start = token
		end = null
		type = type
		parent = parent
		$name = null

		token.scope = self

	def pop end
		end = end
		end.start = start
		end.pops = self
		start.end = end
		visit!
		return parent
	
	def find pattern
		findChildren(pattern)[0]

	def findChildren pattern
		let found = []
		let tok = start
		while tok
			if tok.scope && tok.scope != self
				if tok.scope.match(pattern)
					found.push(tok.scope)
				continue tok = tok.scope.next

			if tok.match(pattern)
				found.push(tok)

			if tok == end
				break
			tok = tok.next
		return found

	def closest ref
		return self if match(ref)
		return parent ? parent.closest(ref) : null

	def visit
		self

	get member?
		no

	get top?
		no

	get selfScope
		(member? or top?) ? self : parent.selfScope

	get name
		$name or ''
	
	get value
		doc.content.slice(start.offset,end ? end.offset : -1)

	get next
		end ? end.next : null

	def match query
		if typeof query == 'string'
			return type.indexOf(query) >= 0
		elif query isa RegExp
			return query.test(type)
		elif query isa Function
			return query(self)
		return yes

export class Group < Node
	def constructor doc, token, parent, type, parts = []
		super(doc, token,parent,type)

	get scope
		parent.scope

	get varmap
		parent.varmap

	def register symbol
		return parent.register(symbol)

	def lookup ...params
		return parent.lookup(...params)

export class TagNode < Group

	get name
		findChildren('tag.name').join('')

	get outline
		findChildren(/tag\.(reference|name|id|white|flag|event(?!\-))/).join('')

export class ValueNode < Group

export class StyleNode < Group

	get properties
		findChildren('styleprop')

export class StyleRuleNode < Group

export class Scope < Node

	def constructor doc, token, parent, type, parts = []
		super(doc, token,parent,type)
		children = []
		entities = []
		refs = []
		varmap = Object.create(parent ? parent.varmap : {})

		if self isa Root
			for own key,val of Globals
				let tok = {value: key, offset: -1, mods: 0}
				varmap[key] = new Sym(SymbolFlags.GlobalVar,key,tok)

		indent = parts[3] ? parts[3].length : 0
		setup!
		return self

	def closest ref
		return self if match(ref)
		return parent ? parent.closest(ref) : null

	def match query
		if typeof query == 'string'
			return type.indexOf(query) >= 0
		elif query isa RegExp
			return query.test(type)
		elif query isa Function
			return query(self)
		return yes

	def setup
		if handler?
			varmap.e = new Sym(SymbolFlags.SpecialVar,'e')
			# self.declare()
			# add virtual vars

		if class? or property?
			ident = token = util.prevToken(start,"entity.")

			if ident
				ident.body = self

			if ident && ident.type == 'entity.name.def.render'
				$name = 'render'
				if ident.symbol
					ident.symbol.name = 'render'
	
	get path
		let par = parent ? parent.path : ''
		
		if property?
			let sep = static? ? '.' : '#'
			return parent ? "{parent.path}{sep}{name}" : name
		
		if component?
			if name[0] == name[0].toLowerCase!
				return util.pascalCase(name + 'Component')
			else
				return name

		if class?
			return name

		return par

	get allowedKeywordTypes
		if class?
			KeywordTypes.Class
		elif self.root?
			KeywordTypes.Root | KeywordTypes.Block
		else
			KeywordTypes.Block

	get component?
		!!type.match(/^component/)

	get root?
		self isa Root
	
	get top?
		self isa Root
		
	get class?
		!!type.match(/^class/) or component?

	get def?
		!!type.match(/def|get|set/)

	get static?
		ident && ident.mods & M.Static
	
	get handler?
		!!type.match(/handler|spy/)

	get member?
		!!type.match(/def|get|set/)
	
	get property?
		!!type.match(/def|get|set/)

	get flow?
		!!type.match(/if|else|elif|unless|for|while|until/)
	
	get closure?
		!!type.match(/class|component|def|get|set|do/)

	get scope
		self

	get name
		$name or (ident ? ident.value : '')

	def visit
		self

	def register symbol
		if symbol.scoped?
			varmap[symbol.name] = symbol
			if self.root?
				symbol.flags |= SymbolFlags.IsRoot
		return symbol
		
	def lookup token, kind = SymbolFlags.Scoped
		let name = token.value
		if name[name.length - 1] == '!'
			name = name.slice(0,-1)
		if let variable = varmap[name]
			# variable.reference(token)
			return variable # token.var
		return null

	def toOutline
		{
			kind: type
			name: name
			children: []
			span: ident ? ident.span : start.span
		}

export class Root < Scope

export class Class < Scope

export class Method < Scope

export class Flow < Scope

export class SelectorNode < Group

export class StylePropKey < Group

	get propertyName
		if start.next.match('style.property.name')
			start.next.value
		else
			parent.prevProperty..propertyName

	get styleValue
		yes

export class StylePropValue < Group

export class StylePropNode < Group

	# get name

	get prevProperty
		if start.prev.pops
			return start.prev.pops
		return null
	
	get propertyName
		let name = find('stylepropkey')
		name ? name.propertyName : null

export class PathNode < Group

export const ScopeTypeMap = {
	style: StyleNode
	tag: TagNode
	stylerule: StyleRuleNode
	sel: SelectorNode
	path: PathNode
	value: ValueNode
	styleprop: StylePropNode
	stylepropkey: StylePropKey
	stylevalue: StylePropValue
}