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

	def upgrade
		return

	def whenDefined
		return

root.customElements ||= new CustomElementRegistry

export def getElementType typ
	let name = typ
	if typeof typ == 'string'
		typ = TYPES[typ] or MAP[typ] or TYPES[typ + 'Element'] or MAP['svg_' + typ]

	if !typ
		return getElementType('HTML')

	if typ and !typ.klass
		class element < getElementType(typ.up)
		typ.klass = element

	if typ and !typ.idl
		typ.idl = yes
		let existing = Object.getOwnPropertyDescriptors(typ.klass.prototype)
		for own key,alias of typ[1]
			let name = alias == 1 ? key : alias
			continue if existing[name] or name == 'style'

			Object.defineProperty(typ.klass.prototype,key,{
				set: do(value)
					this.setAttribute(name,value)
					return
				get: do this.getAttribute(name)
			})

	return typ.klass

const escapeAttributeValue = do |val|
	let str = typeof val == 'string' ? val : String(val)
	if str.indexOf('"') >= 0
		str = str.replace(/\"/g,"&quot;")
	return str
	
const escapeTextContent = do |val, nodeName|
	let str = typeof val == 'string' ? val : String(val)
	
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
		let ctor = typ or getElementType(name)
		let el = new ctor(name)
		el.nodeName = name
		return el

	def createElementNS ns, name
		if ns == "http://www.w3.org/2000/svg"
			let typ = getElementType('svg_'+name)
			let el = new typ
			el.nodeName = name
			return el
		return self.createElement(name)

	def createTextNode value
		return new Text(value)
		
	def createComment value
		return new Comment(value)

	def createDocumentFragment
		return new DocumentFragment


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
		# self.classes.push(flag) unless self.classes.indexOf(flag) >= 0
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
		new DOMTokenList(dom,self.classes.slice(0))
		
	def toString
		# beware of perf
		self.classes.join(" ").trim()

export class StyleDeclaration

	def constructor
		self
		
	def removeProperty key
		delete self[key]
	
	def setProperty name, value
		self[name] = value
		
	def toString
		var items = []
		for own k,v of self
			unless v isa Function
				items.push("{k}: {v}")
		return items.join(';')

class DataSet
	static def wrap node
		new Proxy(node.attributes,new DataSet)
	
	def set target, key, value
		target["data-" + key] = value
		return true

	def get target, key
		target["data-" + key]


export class Node

	def toString
		this.outerHTML

	get outerHTML
		''

export class Text < Node

	def constructor str
		super()
		self.textContent = str or ''
		self

	get outerHTML
		self.textContent

export class Comment < Node
	
	def constructor value
		super()
		self.value = value
		
	get outerHTML
		"<!-- {escapeTextContent(self.value)} -->"
		
	def toString
		if self.tag and self.tag.toNodeString
			return self.tag.toNodeString()
		self.outerHTML

export class Element < Node

	def constructor name
		super()
		self.nodeName  = name
		self.childNodes = []
		self.attributes = {}
		self

	get classList
		$classList ||= new DOMTokenList(self)

	get style
		$style ||= new StyleDeclaration

	get dataset
		$dataset ||= DataSet.wrap(self)

	get richValue
		value

	set richValue value
		self.value = value

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
		self.childNodes.push(child)
		child.parentNode = self
		return child

	def removeChild child
		var idx = self.childNodes.indexOf(child)
		if idx >= 0
			self.childNodes.splice(idx, 1)
		return self

	def insertBefore node, before
		var idx = self.childNodes.indexOf(before)
		self.childNodes.splice(idx, 0, node)
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
		delete self.attributes[key]
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
		$innerHTML = value

	get innerHTML
		var o = ""
		if $innerHTML
			return $innerHTML

		if self.textContent != undefined
			return escapeTextContent(self.textContent)

		for item,i in self.childNodes
			if item isa String
				o += escapeTextContent(item,self.nodeName)
			elif item isa Number
				o += "" + item
			elif item
				o += item.outerHTML
		return o
	
	get outerHTML
		var typ = self.nodeName
		var sel = "{typ}"
		var v
		
		sel += " id=\"{escapeAttributeValue(v)}\"" if v = self.id
		sel += " class=\"{escapeAttributeValue(v)}\"" if v = self.classList.toString()

		for own key,value of self.attributes
			sel += " {key}=\"{escapeAttributeValue(value)}\""

		if $style
			sel += " style=\"{escapeAttributeValue($style.toString())}\""

		if voidElements[typ]
			return "<{sel}>"
		else
			return "<{sel}>{self.innerHTML}</{typ}>"

	get firstChild
		self.childNodes[0]

	get lastChild
		self.childNodes[self.childNodes.length - 1]

	get firstElementChild
		let l = self.childNodes.length
		let i = 0
		while i < l
			let el = self.childNodes[i++]
			return el if el isa Element
		return null

	get lastElementChild
		let i = self.childNodes.length
		while i > 0
			let el = self.childNodes[--i]
			return el if el isa Element
		return null

	get className
		self.classList.toString()

	set className value
		self.classList.classes = (value or '').split(' ')
		self.classList.toString()

export class DocumentFragment < Element
	def constructor
		super(null)

	get outerHTML
		return self.innerHTML
		
export class ShadowRoot < DocumentFragment

	get outerHTML
		return self.innerHTML

export class HTMLElement < Element

export class HTMLHtmlElement < HTMLElement

	get outerHTML
		return "<!DOCTYPE html>" + super.outerHTML

export class HTMLSelectElement < HTMLElement

export class HTMLInputElement < HTMLElement

export class HTMLTextAreaElement < HTMLElement

export class HTMLButtonElement < HTMLElement

export class HTMLOptionElement < HTMLElement

export class SVGElement < Element


### Event ###
export class Event

export class UIEvent < Event

export class MouseEvent < UIEvent

export class PointerEvent < MouseEvent

export class KeyboardEvent < UIEvent

export class CustomEvent < Event


TYPES[''].klass = Element
TYPES['HTML'].klass = HTMLElement
TYPES['SVG'].klass = SVGElement
MAP['html'].klass = HTMLHtmlElement
MAP['select'].klass = HTMLSelectElement
MAP['input'].klass = HTMLInputElement
MAP['textarea'].klass = HTMLTextAreaElement
MAP['button'].klass = HTMLButtonElement
MAP['option'].klass = HTMLOptionElement

getElementType('')
getElementType('HTML')
getElementType('SVG')

export const document = new Document