import * as util from './utils'
import {M,KeywordTypes} from './types'

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

export class Var
	def constructor token,typ,value = null, scope = null
		type = typ
		mods = 0
		token = token
		name = token.value
		value = value
		refs = []
		token.mods |= M.Declaration

		if scope and scope isa Root
			mods |= M.Root
		else
			mods |= M.Local

	get offset
		token.offset

	get loc
		[token.offset,token.value.length]

	def dereference tok
		let idx = refs.indexOf(tok)
		if idx >= 0
			tok.var = null
			refs.splice(idx,1)
		return self

	def reference tok
		refs.push(tok)
		tok.var = self
		return self
	
	def inspect
		if value
			value.inspect!
		else
			console.log "{type} {name}"

	def toJSON
		{
			kind: type
			name: name
			span: token.span
		}

	def toOutline
		{
			kind: type
			name: name
			span: token.span
		}

	def outline ctx, o = {}
		if value
			return value.outline(ctx,o)
		else
			let obj = toJSON!
			o.visit(obj,self) if o.visit
			ctx.children.push(obj) if ctx.children
			return obj

export class Context
	type = ''
	start
	end
	parent

	def constructor token, parent, type
		start = token
		end = null
		type = type
		parent = parent
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
		# all the way from start to end
		''

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

export class Group < Context
	def constructor token, parent, type, parts = []
		super(token,parent,type)

	get scope
		parent.scope

	get varmap
		parent.varmap

	def declare ...params
		return parent.declare(...params)

	def lookup ...params
		return parent.lookup(...params)

export class TagNode < Group

	get name
		findChildren('tag.name').join('')

export class StyleNode < Group

	get properties
		findChildren('styleprop')

export class StyleRuleNode < Group

export class Scope < Context

	def constructor token, parent, type, parts = []
		super(token,parent,type)
		children = []
		entities = []
		refs = []
		varmap = Object.create(parent ? parent.varmap : {})

		if self isa Root
			for own key,val of Globals
				let tok = {value: key, offset: -1, mods: 0}
				varmap[key] = new Var(tok,'global',null,self)
				varmap[key].mods |= M.Global

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
			varmap.e = new Var({value: 'e', offset: 0})
			# self.declare()
			# add virtual vars

		if class? or property?
			ident = token = util.prevToken(start,"entity.{type}")
			keyword = util.prevToken(start,"keyword.{type}")

			if ident
				ident.body = self

			if ident && ident.type == 'entity.def.render'
				$name = 'render'
			if parent.class?
				ident.mods |= M.Member
				parent.entities.push(self)
			elif ident
				if tag? and !ident.type.match(/\.local$/)
					parent.entities.push(self)
				else
					parent.declare(ident,'const',self)
	
	get path
		let par = parent ? parent.path : ''
		
		if property?
			let sep = static? ? '.' : '#'
			return parent ? "{parent.path}{sep}{name}" : name
		
		if tag?
			return util.pascalCase(name + 'Component')

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

	get tag?
		!!type.match(/^tag/)

	get root?
		self isa Root
	
	get top?
		self isa Root
		
	get class?
		!!type.match(/^class/) or tag?

	get def?
		!!type.match(/def|get|set/)

	get static?
		ident && ident.mods & M.Static
	
	get handler?
		!!type.match(/handler/)

	get member?
		!!type.match(/def|get|set/)
	
	get property?
		!!type.match(/def|get|set/)

	get flow?
		!!type.match(/if|else|elif|unless|for|while|until/)
	
	get closure?
		!!type.match(/class|tag|def|get|set|do/)

	get scope
		self

	get name
		$name or (ident ? ident.value : '')

	get variables
		entities.filter do $1 isa Var

	def visit
		self

	def declare token, typ, value
		token.var = new Var(token,typ,value,self)
		entities.push(token.var)
		varmap[token.var.name] = token.var
		return token.var

	def lookup token
		if let variable = varmap[token.value]
			variable.reference(token)
			return variable # token.var
		return null

	def register token
		entities.push(token)

	def inspect
		# console.log "{ind}{type} {name}"
		let grp = "{type} {name}"
		console.group(grp)
		for entity in entities
			entity.inspect!
		console.groupEnd!

	def toOutline
		{
			kind: type
			name: name
			children: []
			span: ident ? ident.span : start.span
		}

	def outline ctx, o = {}
		let item = {
			kind: type
			name: name
			children: []
			span: ident ? ident.span : start.span
		}

		ctx.children.push(item) if ctx
		
		if o.visit
			o.visit(item,self)

		for entity in entities
			entity.outline(item,o)

		return item

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
	styleprop: StylePropNode
	stylepropkey: StylePropKey
	stylevalue: StylePropValue
}