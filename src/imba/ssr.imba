# TODO classes should not be global,
# rather imported where they are needed

var root = (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null))

import {TYPES,MAP} from './schema'

var voidElements = {
	area: yes
	base: yes
	br: yes
	col: yes
	embed: yes
	hr: yes
	img: yes
	input: yes
	keygen: yes
	link: yes
	meta: yes
	param: yes
	source: yes
	track: yes
	wbr: yes
}

class CustomElementRegistry

	def define
		self

	def get
		self

root.customElements ||= CustomElementRegistry.new()

export def getElementType typ
	if typeof typ == 'string'
		typ = TYPES[typ] or MAP[typ] or TYPES[typ + 'Element']

	# console.log 'get element',String(typ)

	if typ and !typ.klass
		class element < getElementType(typ.up)
		typ.klass = element

	if typ and !typ.idl
		typ.idl = yes
		let existing = Object.getOwnPropertyDescriptors(typ.klass.prototype)
		for own key,alias of typ[1]
			let name = alias == 1 ? key : alias
			continue if existing[name]

			Object.defineProperty(typ.klass.prototype,key,{
				set: do |value|
					this.setAttribute(name,value)
					return
				get: do this.getAttribute(name)
			})

	return typ.klass

var escapeAttributeValue = do |val|
	var str = typeof val == 'string' ? val : String(val)
	if str.indexOf('"') >= 0
		str = str.replace(/\"/g,"&quot;")
	return str
	
var escapeTextContent = do |val, nodeName|
	var str = typeof val == 'string' ? val : String(val)
	
	if nodeName == 'script'
		return str

	if str.indexOf('"') >= 0
		str = str.replace(/\"/g,"&quot;")
	if str.indexOf('<') >= 0
		str = str.replace(/\</g,"&lt;")
	if str.indexOf('>') >= 0
		str = str.replace(/\>/g,"&gt;")
	return str


# could create a fake document 
export class Document

	def createElement name
		# look for custom elements now?
		let typ = imba.tags.lookup(name)
		let el = (typ or getElementType(name)).new(name)
		el.nodeName = name
		return el

	def createElementNS ns, type
		return ns == 'svg' ? SVGElement.new(type) : HTMLElement.new(type)

	def createTextNode value
		return Text.new(value)
		
	def createComment value
		return Comment.new(value)


# could optimize by using a dictionary in addition to keys
# where we cache the indexes?
export class DOMTokenList

	def constructor dom, classes
		this.classes = classes or []
		this.dom = dom

	def add flag
		self.classes.push(flag) unless self.classes.indexOf(flag) >= 0
		self

	def remove flag
		# TODO implement!
		# @classes.push(flag) unless @classes.indexOf(flag) >= 0
		var idx = self.classes.indexOf(flag)
		if idx >= 0
			self.classes[idx] = ''
		self

	def toggle flag
		self.contains(flag) ? self.remove(flag) : self.add(flag)
		self

	def contains flag
		self.classes.indexOf(flag) >= 0

	def clone dom
		var clone = DOMTokenList.new(dom,self.classes.slice(0))
		return clone
		
	def toString
		# beware of perf
		self.classes.join(" ").trim()

export class StyleDeclaration

	def constructor dom
		self.dom = dom
		self
		
	def removeProperty key
		delete self[key]
	
	def setProperty name, value
		self[name] = value
		
	def toString
		var items = []
		for own k,v of self
			unless k[0] == '_'
				items.push("{k}: {v}")
		return items.join(';')

export class Node

	# appendChild
	# removeChild etc

export class Text < Node

	def constructor str
		super
		@textContent = str or ''
		self

	get outerHTML
		@textContent

export class Comment < Node
	
	def constructor value
		super
		self.value = value
		
	get outerHTML
		"<!-- {escapeTextContent(self.value)} -->"
		
	def toString
		if self.tag and self.tag.toNodeString
			return self.tag.toNodeString()
		self.outerHTML

export class Element < Node

	def constructor name
		super
		self.nodeName  = name
		self.childNodes = []
		self.attributes = {}
		self

	get classList
		#classList ||= DOMTokenList.new(self)

	get style
		#style ||= StyleDeclaration.new(this)

	def flag$
		self

	def flagIf$
		self

	def end$
		self

	def close$
		self

	def open$
		self

	def appendChild child
		# again, could be optimized much more
		# console.log 'appendChild',child
		if typeof child === 'string'
			@childNodes.push(escapeTextContent(child,self.nodeName))
		else
			@childNodes.push(child)
			child.parentNode = self
		return child

	def insertBefore node, before
		var idx = self.children.indexOf(before)
		self.children.splice(idx, 0, node)
		self

	def setAttribute key, value
		self.attributes[key] = value
		self

	def setAttributeNS ns, key, value
		self.setAttribute(ns + ':' + key,value)

	def getAttribute key
		# console.log "getAttribute not implemented on server"
		self.attributes ? self.attributes[key] : undefined

	def getAttributeNS ns, key
		self.getAttribute(ns + ':' + key)

	def removeAttribute key
		console.log "removeAttribute not implemented on server"
		true
	
	# noop
	def addEventListener
		self
	
	# noop
	def removeEventListener
		self
		
	def resolve
		self

	set innerHTML value
		#innerHTML = value

	get innerHTML
		var o = ""
		if @textContent != undefined
			return escapeTextContent(@textContent)

		for item,i in @childNodes
			if item isa String
				o += escapeTextContent(item,self.nodeName)
			elif item isa Number
				o += "" + item
			elif item
				o += item.outerHTML
		return o
		# self.resolve()
		# return #innerHTML || (self.textContent and escapeTextContent(self.textContent,self.nodeName)) || (self.children and self.children.join("")) or ''
	
	get outerHTML
		var typ = self.nodeName
		var sel = "{typ}"
		
		sel += " id=\"{escapeAttributeValue(v)}\"" if var v = self.id
		sel += " class=\"{escapeAttributeValue(v)}\"" if var v = self.classList.toString()

		for own key,value of self.attributes
			sel += " {key}=\"{escapeAttributeValue(value)}\""

		if #style
			sel += " style=\"{escapeAttributeValue(#style.toString())}\""

		if voidElements[typ]
			return "<{sel}>"
		else
			return "<{sel}>{self.innerHTML}</{typ}>"

	set children value
		#children = value

	get children
		self.resolve()
		return #children

	get firstChild
		self.children[0]

	get firstElementChild
		self.children[0]

	get lastElementChild
		self.children[self.children.length - 1]
	
	

	get className
		self.classList.toString()

	set className value
		self.classList.classes = (value or '').split(' ')
		self.classList.toString()

export class DocumentFragment < Element

export class HTMLElement < Element

export class SVGElement < Element


### Event ###
export class Event

export class MouseEvent < Event

export class KeyboardEvent < Event

export class CustomEvent < Event

TYPES[''].klass = Element
TYPES['HTML'].klass = HTMLElement
TYPES['SVG'].klass = SVGElement

getElementType('')
getElementType('HTML')
getElementType('SVG')

export var document = Document.new()