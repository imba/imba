import { tagNameToClassName,prevToken,toCustomTagIdentifier} from './utils'
import {M,KeywordTypes,SemanticTokenTypes,SemanticTokenModifiers} from './types'
import {Sym,SymbolFlags} from './symbol'

export const Globals = {
	'global': {datatype: 'globalThis'}
	'imba': {datatype: 'globalThis.imba'}
	'module': {}
	'window': {datatype: 'globalThis.window'}
	'document': {datatype: 'globalThis.document'}
	'exports': {}
	'console': {datatype: 'globalThis.console'}
	'process': {datatype: 'globalThis.process'}
	'parseInt': {datatype: 'globalThis.parseInt'}
	'parseFloat': {datatype: 'globalThis.parseFloat'}
	'setTimeout':{datatype: 'globalThis.setTimeout'}
	'setInterval': {datatype: 'globalThis.setInterval'}
	'setImmediate': {datatype: 'globalThis.setImmediate'}
	'clearTimeout': {datatype: 'globalThis.clearTimeout'}
	'clearInterval': {datatype: 'globalThis.clearInterval'}
	'clearImmediate': {datatype: 'globalThis.clearImmediate'}
	'globalThis': {datatype: 'globalThis'}
	'isNaN': {datatype: 'globalThis.isNaN'}
	'isFinite': {datatype: 'globalThis.isFinite'}
	'__dirname': {datatype: '\\string'}
	'__filename': {datatype: '\\string'}
	'__realname': {datatype: '\\string'}
}

export class Node
	type = ''
	start
	end
	parent

	static def build doc,tok,scope,typ,types
		new self(doc,tok,scope,typ,types)

	def constructor doc, token, parent, type, types = null
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
		findChildren(pattern,yes)[0]
		
	get childNodes
		doc.getNodesInScope(self,yes,yes)

	get children
		doc.getNodesInScope(self)

	get allTokens
		let all = []
		let tok = start
		while tok
			all.push(tok)
			break if tok == end
			tok = tok.next
		return all
	
	get parents
		[parent].concat(parent.parents)

	get span
		let starts = start.startOffset
		let ends = end ? end.endOffset : doc.content.length
		{start: starts, length: (ends - starts)}
	
	get contextSpan
		span

	def findChildren pattern, returnFirst = no
		let found = []
		let tok = start
		while tok
			if returnFirst and found.length
				return found
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
		
	get scope?
		no

	get selfScope
		(member? or top?) ? self : parent.selfScope

	get name
		$name or ''
	
	get value
		doc.content.slice(start.offset,end ? end.endOffset : -1)

	get outerText
		doc.getText(contextSpan)

	get next
		end ? end.next : null

	get prev
		start ? start.prev : null

	def match query
		if typeof query == 'string'
			return type == query
			# let m = type.indexOf(query) >= 0
		elif query isa RegExp
			return query.test(type)
		elif query isa Function
			return query(self)
		return yes

	get startOffset
		start.offset

	get endOffset
		end.endOffset
		
	get outlineText
		"item"
		
	get outlineKind
		symbol ? symbol.outlineKind : type
		
	def toOutline
		{
			text: outlineText
			kind: outlineKind
		}

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

	get comment
		let val = value
		let m = val.match(/\s\#\s([^\n]+)\n/)
		if m
			return m[1]
		
		let prev = start.prev
		if prev and prev.match('white.tabs')
			prev = prev.prev
		
		if prev..match('comment')
			return prev.value.replace(/(^\#\s)|(\n+$)/g,'')

		return null




export class ValueNode < Group

export class StringNode < Group

export class StyleNode < Group

	get properties
		findChildren('styleprop')

export class StyleRuleNode < Group

export class Scope < Node

	def constructor doc, token, parent, type, parts = []
		super(doc, token,parent,type)
		# children = []
		entities = []
		refs = []
		varmap = Object.create(parent ? parent.varmap : {})

		if self isa Root
			for own key,val of Globals
				let tok = {value: key, offset: -1, mods: 0, match: (do no)}
				varmap[key] = new Sym(SymbolFlags.GlobalVar,key,tok,val)

		indent = (parts[3] && parts[3][0] == '\t') ? parts[3].length : 0
		setup!
		return self
		
	get outlineText
		ident ? ident.value : 'something'

	def setup
		if handler?
			let kind = "ImbaEvents.{parent.name}"
			varmap.e = new Sym(SymbolFlags.Parameter,'e',null,{datatype: kind})
			varmap.e.#scope = self

			# self.declare()
			# add virtual vars

		if class? or property?
			ident = token = prevToken(start,"entity.")

			# need to start at the beginning of the line?
			let kw = prevToken(start,"keyword.class keyword.tag",10000,2)
			keyword = kw

			# console.log "found start?!",kw
			if class? and kw
				token = kw.next..next
				if token..match('push.assignable')
					token = token.scope
				ident = token

			if ident
				ident.body = self

			if ident && ident.type == 'entity.name.def.render'
				$name = 'render'
				if ident.symbol
					ident.symbol.name = 'render'

		
	
	get selfPath
		let path = self.path
		if property?
			return path.slice(0,path.lastIndexOf('.'))
		return path
	
	get path
		let par = parent ? parent.path : ''
		
		if property?
			let sep = static? ? '.' : '.prototype.'
			return parent ? "{parent.path}{sep}{name}" : name
		
		if component?
			if name[0] == name[0].toLowerCase!
				let hit = tagNameToClassName(name)
				if hit
					return hit.name
				return toCustomTagIdentifier(name)
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
		
	get scope?
		yes
		
	get class?
		!!type.match(/^class/) or component?

	get extends?
		class? and keyword and keyword.prev.prev..match('keyword.extend')

	get global?
		class? and (!!prevToken(keyword,'keyword.global',3,1) or (component? and name[0] == name[0].toLowerCase!))

	get def?
		!!type.match(/def|get|set/)

	get static?
		!!(ident && ident.mods & M.Static)
	
	get handler?
		!!type.match(/handler|spy/)

	get member?
		!!type.match(/def|get|set/)
	
	get property?
		!!type.match(/def|get|set|field/)

	get flow?
		!!type.match(/if|else|elif|unless|for|while|until/)
	
	get closure?
		!!type.match(/class|component|def|get|set|do/)

	get scope
		self

	get name
		$name or (ident ? ident.value : '')
		
	get span
		let starts = start.startOffset
		if ident
			starts = ident.startOffset
		let ends = end ? end.endOffset : doc.content.length
		{start: starts, length: (ends - starts)}

	get textSpan
		ident ? ident.span : span

	get contextSpan
		if class? or component? or def?
			doc.expandSpanToLines(span)
		else
			span

	def visit
		self

	def register symbol
		if symbol.scoped?
			varmap[symbol.name] = symbol
			symbol.#scope ||= self

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


export class GlobalScope < Scope
	
export class Root < Scope
	get parents
		[]

export class Class < Scope

export class Method < Scope

export class Flow < Scope

export class ForScope < Scope
	get expression
		let kw = find('keyword.in keyword.of')
		kw.next.next

	get forvars
		Object.values(varmap).filter do $1.itervar?

export class BlockScope < Scope

export class WeakScope < Scope
	# get varmap
	#	parent.varmap

	def register symbol
		return parent.register(symbol)

	def lookup ...params
		return parent.lookup(...params)
		
export class FieldScope < Scope
	
	get selfScope
		self

	# get selfPath
		

export class SelectorNode < Group

export class StylePropKey < Group

	get propertyName
		if start.next.match('style.property.name')
			start.next.value
		else
			parent.prevProperty..propertyName

	get modifier
		if start.next.match('style.property.modifier')
			return start.next.value

	get styleValue
		yes

export class StylePropValue < Group

	get key
		parent.key

	get propertyName
		parent.propertyName
	
	get modifier
		parent.modifier

export class StylePropNode < Group

	# get name
	get key
		find('stylepropkey')

	get prevProperty
		if start.prev.pops
			return start.prev.pops
		return null
	
	get propertyName
		key..propertyName
		# let name = find('stylepropkey')
		# name ? name.propertyName : null

	get modifier
		key..modifier

export class StyleInterpolation < Group

export class PathNode < Group
	
	get innerText
		value.slice(1,-1)

export class TagNode < Group

	get name
		if start.next..match('tag.name.parens')
			return 'any'

		let name = findChildren('tag.name').join('')
		name == 'self' ? closest('component').name : name
		
	get nameNode
		findChildren('tag.name')[0]

	get local?
		name[0] == name[0].toUpperCase!

	get tagName
		name

	get parentTag
		closest('tagcontent')..ownerTag
	
	get ancestorTags
		closest('tagcontent')..ownerTags

	get ancestorPath
		ancestorTags.map(do $1.tagName).join('.')

	get pathName
		"<{name}>"
	
	get outlineText
		let inner = findChildren(/tag\.(reference|name|id|white|flag|event(?!\-))/).join('').trim()
		inner = inner.replace(/\.\s+/g,'')
		"<{inner}>"
		
	def toOutline
		return {
			text: outlineText
			kind: 'string'
			nameSpan: span
		}
	

export class TagAttrNode < Group
	get propertyName
		if start.next.match('tag.attr')
			start.next.value
		else
			''

	get tagName
		parent.name
			

export class TagAttrValueNode < Group

	get propertyName
		parent.propertyName

	get tagName
		parent.tagName

	# get completionPath
	#	"<>"

export class TagContent < BlockScope

	get ownerTag
		start.prev.pops

	get ownerTags
		let els = [ownerTag]
		
		while let el = els[0].parentTag
			els.unshift(el)
			# curr = parent.closest('tagcontent')
		return els

export class Listener < Group

	get name
		findChildren('tag.event.name').join('').replace('@','')

export class ParensNode < Group

export class BracketsNode < Group

	static def build doc,tok,scope,typ,types
		let cls = self
		let chr = doc.getText(tok.offset - 1,tok.offset) # tok.prev.value # .slice(-1)
		# console.log 'build brackets',tok,chr
		if !chr or ' [{(|=&-;\n\t:/*%+-'.indexOf(chr) >= 0 # chr.match(/[\s\[\,\(\n\,]/)
			typ = 'array'
			cls = ArrayNode
		else
			typ = 'index'
			cls = IndexNode

		new cls(doc,tok,scope,typ,types)
	
export class BracesNode < Group
	
export class SpecifiersNode < BracesNode

export class ArrayNode < BracketsNode
	
	get delimiters
		children.filter do $1.match('delimiter')
	
	def indexOfNode node
		let delims = delimiters
		let index = 0
		for delim,i of delims
			if node.offset > delim.offset
				index++
		return index

export class IndexNode < BracketsNode

export class TypeAnnotationNode < Group

	def constructor
		super
		prev.datatype = self
		
	def toString
		value

export class InterpolatedValueNode < Group

export class ObjectNode < BracesNode
	
export class ImportsNode < Group
	
	get isTypeOnly
		!!start.prev.match('keyword.type')
	
	get sourcePath
		let path = children.find do $1.match('path')
		return path..innerText
		
	get specifiers
		children.find do $1.match('specifiers')
		
	get default
		children.find do $1.match('.default')
		
	get namespace
		children.find do $1.match('.ns')

export class Assignable < Group

export const ScopeTypeMap = {
	style: StyleNode
	array: BracketsNode
	stylerule: StyleRuleNode
	sel: SelectorNode
	path: PathNode
	value: ValueNode
	tag: TagNode
	forscope: ForScope
	field:FieldScope
	type: TypeAnnotationNode
	parens: ParensNode
	brackets: BracketsNode
	object: ObjectNode
	braces: BracesNode
	specifiers: SpecifiersNode
	string: StringNode
	tagattr: TagAttrNode
	imports: ImportsNode
	interpolation: InterpolatedValueNode
	tagattrvalue: TagAttrValueNode
	tagcontent: TagContent
	listener: Listener
	styleinterpolation: StyleInterpolation
	styleprop: StylePropNode
	stylepropkey: StylePropKey
	stylevalue: StylePropValue
	args: ParensNode
	assignable: Assignable
}