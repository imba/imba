# imba$imbaPath=global
###
Very basic shim for the DOM to support rendering on the server
We want to support this in webworkers as well, so the asynclocalstorage
should move elsewhere
###

import {TYPES,MAP} from './schema'
import {AsyncLocalStorage} from 'async_hooks'

let asl = null

class Location < URL

export class Window
	get document
		#document ||= new self.Document(self)

	get location
		self.document.location

# extend class ImbaContext
# 	get #window
# 		##window ||= new Window(self)
# 
# 	get #document
# 		##document or self.window.document
# 
# 	def run cb
# 		let runtime = new ImbaContext(self,Object.create(state))
# 		asl ||= new AsyncLocalStorage
# 		asl.run(runtime,cb)

# Object.defineProperties(global,{
# 	#imba: {get: (do asl..getStore! or global.imba)}
# })

# const DOM = global.imba.##window = Window.prototype

const voidElements = {
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

const CustomTagConstructors = {}

class CustomElementRegistry

	def define
		self

	def get
		self

	def upgrade
		return

	def whenDefined
		return

export const customElements = new CustomElementRegistry

export def getTagType typ
	let name = typ
	if typeof typ == 'string'
		typ = TYPES[typ] or MAP[typ] or TYPES[typ + 'Element'] or MAP['svg_' + typ]

	if typ isa Node
		return typ

	if !typ
		return getTagType('HTML')

	if typ and !typ.klass
		class element < getTagType(typ.up)
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

const escapeAttributeValue = do(val)
	let str = typeof val == 'string' ? val : String(val)
	if str.indexOf('"') >= 0
		str = str.replace(/\"/g,"&quot;")
	return str
	
const escapeTextContent = do(val, nodeName)
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

	set location value
		#location = new Location(value)

	get location
		#location ||= new Location('http://localhost/')

	def createElement name
		# look for custom elements now?
		let ctor = getTagType(name)
		let el = new ctor(name)
		el.nodeName = name
		return el

	def createElementNS ns, name
		if ns == "http://www.w3.org/2000/svg"
			let typ = getTagType('svg_'+name)
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

	def getElementById id
		return null

const doc = new Document
export const document = doc
# could optimize by using a dictionary in addition to keys
# where we cache the indexes?
# export these as well?
class DOMTokenList

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

	def text$ item
		self.textContent = item
		self

	get #imba
		##imba ?= global.#imba

	get #parent
		##parent or this.parentNode

	def #init
		self

	# replace this with something else
	def replaceWith$ other
		if !(other isa Node) and other.replace$
			other.replace$(this)
		else
			self.parentNode.replaceChild(other,this)
		return other

	def insertInto$ parent
		parent.appendChild$(this)
		return this

	def insertBefore$ el, prev
		this.insertBefore(el,prev)

	def insertBeforeBegin$ other
		self.parentNode.insertBefore(other,this)

	def insertAfterEnd$ other
		if self.nextSibling
			self.nextSibling.insertBeforeBegin$(other)
		else
			self.parentNode.appendChild(other)
	
	def insertAfterBegin$ other
		if self.childNodes[0]
			self.childNodes[0].insertBeforeBegin$(other)
		else
			self.appendChild(other)

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

	def appendChild child
		self.childNodes.push(child)
		child.parentNode = self
		return child

	def removeChild child
		var idx = self.childNodes.indexOf(child)
		if idx >= 0
			self.childNodes.splice(idx, 1)
		return self

	def replaceChild newChild, oldChild
		let idx = childNodes.indexOf(oldChild)
		if idx >= 0
			childNodes.splice(idx,1,newChild)
			newChild.parentNode = self
		# self.childNodes.push(child)
		# child.parentNode = self
		return oldChild

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

	def log ...params
		console.log(...params)
		self

	def slot$ name, ctx
		return self

	# inline in files or remove all together?
	def text$ item
		self.textContent = item
		self

	def insert$ item, f, prev
		let type = typeof item

		if type === 'undefined' or item === null
			# what if the prev value was the same?
			if prev and prev isa Comment # check perf
				return prev

			let el = new Comment('')
			prev ? prev.replaceWith$(el) : el.insertInto$(this)
			return el

		# dont reinsert again
		if item === prev
			return item

		# what if this is null or undefined -- add comment and return? Or blank text node?
		elif type !== 'object'
			let res
			let txt = item
			
			if (f & $TAG_FIRST_CHILD$) && (f & $TAG_LAST_CHILD$)
				# FIXME what if the previous one was not text? Possibly dangerous
				# when we set this on a fragment - it essentially replaces the whole
				# fragment?
				self.textContent = txt
				return

			if prev
				if prev isa Text # check perf
					prev.textContent = txt
					return prev
				else
					res = new Text(txt)
					prev.replaceWith$(res,self)
					return res
			else
				self.appendChild$(res = new Text(txt))
				return res	

		else
			prev ? prev.replaceWith$(item,self) : item.insertInto$(self)
			return item
		return

	def open$
		self

	def close$
		self

	def end$
		self.render() if self.render
		return

Element.prototype.appendChild$  = Element.prototype.appendChild
Element.prototype.removeChild$  = Element.prototype.removeChild
Element.prototype.insertBefore$ = Element.prototype.insertBefore
Element.prototype.replaceChild$ = Element.prototype.replaceChild
Element.prototype.set$ = Element.prototype.setAttribute
Element.prototype.setns$ = Element.prototype.setAttributeNS

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

export class HTMLScriptElement < HTMLElement

	set asset name
		let asset = imba.asset(name) or imba.asset(name + ".js")
		console.log 'did set asset',asset..url
		if asset
			setAttribute('src',asset.url)
			setAttribute('type','module')

	get asset
		#asset

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
MAP['script'].klass = HTMLScriptElement

getTagType('')
getTagType('HTML')
getTagType('SVG')

export def createElement name, parent, flags, text
	# struggling with this thing here
	let el = doc.createElement(name)
	el.className = flags if flags

	if text !== null
		el.text$(text)

	if parent and parent isa Node
		el.insertInto$(parent)

	return el

export def createComponent name, parent, flags, text, ctx
	# the component could have a different web-components name?
	let el
	
	if typeof name != 'string'
		# what about a class based component?
		if name and name.nodeName
			name = name.nodeName

	if CustomTagConstructors[name]
		el = CustomTagConstructors[name].create$(el)
		# extend with mroe stuff
		
		el.slot$ = proto.slot$
		el.__slots = {}
	else
		el = doc.createElement(name)

	el.##parent = parent
	el.#init!

	if text !== null
		el.slot$('__').text$(text)
		
	if flags or el.flags$ns # or nsflag
		el.flag$(flags or '')
	return el

export def defineTag name, klass, options = {}
	TYPES[name] = {
		idl: yes
		name: name
		klass: klass
	}
	klass.nodeName = name

	let proto = klass.prototype
	
	# if proto.render && proto.end$ == Element.prototype.end$
	#	proto.end$ = proto.render
	let basens = proto._ns_
	if options.ns
		let ns = options.ns
		let flags = ns + ' ' + ns + '_ '
		if basens
			flags += proto.flags$ns 
			ns += ' ' + basens
		proto._ns_ = ns
		proto.flags$ns = flags

	if options.extends
		CustomTagConstructors[name] = klass
	return klass