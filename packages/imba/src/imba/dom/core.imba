# imba$stdlib=1

###
Very basic shim for the DOM to support rendering on the server
We want to support this in webworkers as well, so the asynclocalstorage
should move elsewhere
###

import {TYPES,MAP} from './schema'
import {AsyncLocalStorage} from '../bindings'
import {Flags} from './flags'
import {createRenderContext,renderContext} from './context'
import {getDeepPropertyDescriptor} from '../utils'

const manifest = {}

let asl = null

export class Location < URL

export class Window
	get document
		#document ||= new self.Document(self)

	get location
		self.document.location

export def use_window
	global.imba.uses_window = yes
	yes

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

let HtmlContext = null

const CustomTagToElementNames = {}

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

export const CUSTOM_TYPES = {}

export def getTagType typ, klass

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

export def getSuperTagType name, klass, cmp
	let typ = getTagType(name,klass)
	let custom = typ == cmp or typ.prototype isa cmp or typ.prototype.#htmlNodeName

	if !custom
		let cls = typ.prototype.#ImbaElement

		if !cls
			cls = class CustomBuiltInElement < typ
				def constructor
					super
					__slots = {}
					__F = 0

			typ.prototype.#ImbaElement = cls
			let descriptors = Object.getOwnPropertyDescriptors(cmp.prototype)
			Object.defineProperties(cls.prototype,descriptors)
			cls.prototype.#htmlNodeName = name

		return cls

	return typ

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

	static def create ctx, cb
		let doc = new Document
		doc.#context = ctx
		doc.location = ctx.location
		asl ||= new AsyncLocalStorage
		asl.run(doc,cb)
		return doc

	def constructor
		self

	get flags
		# should be the html root
		#flags ||= new Flags({classList: new DOMTokenList(self)})

	get scripts
		#scripts ||= []

	set location value
		if typeof value == 'string'
			value = new Location(value)
		#location = value

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

renderContext.createTextNode = do(text) doc.createTextNode(text)
	

export const document = doc

export def get_document
	asl && asl..getStore! or doc

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
		let idx = self.classes.indexOf(flag)
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
		let items = []
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

const contextHandler =
	def get target, name
		let ctx = target
		let val = undefined
		while ctx and val == undefined
			if ctx = ctx.#parent
				val = ctx[name]
		return val

export class Node

	def toString
		this.outerHTML

	get outerHTML
		''

	def text$ item
		self.textContent = item
		self

	get ownerDocument
		##document ||= get_document!

	get #parent
		##parent or this.parentNode or ##up

	get #context
		##context ||= new Proxy(self,contextHandler)

	get #closestNode
		self

	get #parentNode
		#parent..#closestNode

	def #__init__
		self

	def ##inited
		self

	def #getRenderContext sym
		createRenderContext(self,sym)

	def #getDynamicContext sym,key
		#getRenderContext(sym).#getRenderContext(key)

	def #replaceChild newnode, oldnode
		let res = #insertChild(newnode,oldnode)
		#removeChild(oldnode)
		return res

	def #appendChild newnode
		newnode.#insertInto(self,null)

	def #removeChild node
		node.#removeFrom(self)

	def #insertInto parent, before
		before ? parent.insertBefore(self,before) : parent.appendChild(self)
		return this

	def #insertChild newnode, refnode
		newnode.#insertInto(self,refnode)

	def #removeFrom parent
		parent.removeChild(self)

	def #removeFromDeopt parent
		parent.removeChild(#domNode or self)

	def #replaceWith other, parent
		parent.#replaceChild(other,self)

	def #replaceWithDeopt other, parent
		parent.#replaceChild(other,#domNode or self)

	get #placeholderNode
		##placeholderNode ||= doc.createComment("placeholder")

	set #placeholderNode value
		let prev = ##placeholderNode
		##placeholderNode = value
		if prev and prev != value and prev.parentNode
			prev.#replaceWith(value)

	def #attachToParent
		let ph = #domNode
		let par = ph and ph.parentNode
		if ph and par and ph != self
			#domNode = null
			#insertInto(par,ph)
			ph.#removeFrom(par)
		self

	def #detachFromParent
		if #domDeopt =? yes
			#replaceWith = #replaceWithDeopt
			#removeFrom = #removeFromDeopt
			#insertInto = #insertIntoDeopt

		let ph = #placeholderNode
		if parentNode and ph != self
			ph.#insertInto(parentNode,self)
			#removeFrom(parentNode)

		#domNode = ph
		# self.#replaceWith(ph,parentNode)
		self

	def #placeChild item, f, prev

		let type = typeof item

		if type === 'undefined' or item === null
			# what if the prev value was the same?
			if prev and prev isa Comment # check perf
				return prev

			let el = new Comment('')
			return prev ? prev.#replaceWith(el,self) : el.#insertInto(this,null)

		# dont reinsert again
		if item === prev
			return item

		# what if this is null or undefined -- add comment and return? Or blank text node?
		elif type !== 'object'
			let res
			let txt = item

			if (f & $TAG_FIRST_CHILD$) && (f & $TAG_LAST_CHILD$) and false
				# FIXME what if the previous one was not text? Possibly dangerous
				# when we set this on a fragment - it essentially replaces the whole
				# fragment?
				# log 'set textcontent raw',txt,prev
				self.textContent = txt
				return

			if prev
				if prev isa Text # check perf
					prev.textContent = txt
					return prev
				else
					res = document.createTextNode(txt)
					prev.#replaceWith(res,self)
					return res
			else
				self.appendChild(res = document.createTextNode(txt))
				return res

		else
			return prev ? prev.#replaceWith(item,this) : item.#insertInto(this,null)
		return

export class Text < Node

	def constructor str
		super()
		self.textContent = str ?? ''
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

	def emit name, detail, o = {bubbles: true}
		console.warn 'Element#emit not supported on node'
		return

	get classList
		##classList ||= new DOMTokenList(self)

	get style
		##style ||= new StyleDeclaration

	get dataset
		##dataset ||= DataSet.wrap(self)

	get richValue
		value

	set richValue value
		self.value = value

	set asset asset
		#asset = asset

	get asset
		#asset

	def appendChild child
		self.childNodes.push(child)
		child.parentNode = self
		return child

	def removeChild child
		let idx = self.childNodes.indexOf(child)
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
		let idx = self.childNodes.indexOf(before)
		self.childNodes.splice(idx, 0, node)
		self

	def setAttribute key, value
		self.attributes[key] = value
		self

	def setAttributeNS ns, key, value
		self.setAttribute(ns + ':' + key,value)

	def getAttribute key
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
		#innerHTML = value

	get innerHTML
		let o = ""
		if #innerHTML
			return #innerHTML

		if self.textContent != undefined
			return escapeTextContent(self.textContent)

		for item,i in self.childNodes
			if typeof item == 'string'
				o += escapeTextContent(item,self.nodeName)
			elif item isa Number
				o += "" + item
			elif item
				o += item.outerHTML
		return o

	get outerHTML
		let typ = self.nodeName
		let nativeType = #htmlNodeName
		let sel = "{typ}"

		if nativeType
			sel = "{nativeType} is='{typ}'"
			typ = nativeType

		let v
		let idattr = self.id
		let cls = self.classList.toString!

		if self.dehydrate
			cls = (cls ? ('_ssr_ ' + cls) : '_ssr_')
			self.dehydrate!

		sel += " id=\"{escapeAttributeValue(idattr)}\"" if idattr
		sel += " class=\"{escapeAttributeValue(cls)}\"" if cls

		for own key,value of self.attributes
			continue if key == 'id' and idattr

			sel += " {key}=\"{escapeAttributeValue(value)}\""

		if ##style
			sel += " style=\"{escapeAttributeValue(##style.toString())}\""

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

	# inline in files or remove all together?
	def text$ item
		self.textContent = item
		self

	def #beforeReconcile
		self

	def #afterReconcile
		self

	def #afterVisit
		self.render() if self.render
		##visitContext = null if ##visitContext
		return

	get #visitContext
		##visitContext ||= {}

	get flags
		unless $flags
			# unless deopted - we want to first cache the extflags
			$flags = new Flags(self)
			if flag$ == Element.prototype.flag$
				flags$ext = self.className
			flagDeopt$()
		return $flags

	def flag$ str
		# Potentially slow
		let ns = flags$ns
		self.className = ns ? (ns + (flags$ext = str)) : (flags$ext = str)
		return
	
	def flagIf$
		self

	def flagDeopt$
		self.flag$ = self.flagExt$ # do(str) self.flagSync$(flags$ext = str)
		self.flagSelf$ = do(str) self.flagSync$(flags$own = str)
		return

	def flagExt$ str
		self.flagSync$(flags$ext = str)

	def flagSelf$ str
		# if a tag receives flags from inside <self> we need to
		# redefine the flag-methods to later use both
		flagDeopt$()
		return flagSelf$(str)

	def flagSync$
		self.className = ((flags$ns or '') + (flags$ext or '') + ' ' + (flags$own || '') + ' ' + ($flags or ''))

	def set$ key, value
		let desc = getDeepPropertyDescriptor(this,key,Element)
		if !desc or !desc.set
			setAttribute(key,value)
		else
			self[key] = value
		return

# Element.prototype.appendChild$  = Element.prototype.appendChild
# Element.prototype.removeChild$  = Element.prototype.removeChild
# Element.prototype.insertBefore$ = Element.prototype.insertBefore
# Element.prototype.replaceChild$ = Element.prototype.replaceChild
Element.prototype.setns$ = Element.prototype.setAttributeNS
Element.prototype.#isRichElement = yes

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
	prop hmr

	get scripts
		#scripts ||= []

	get outerHTML
		# watch for assets that are collected etc
		let prev = HtmlContext
		HtmlContext = self
		let html = super.outerHTML
		# automatically include stylesheets?
		# add data-hmr yes or inject hmr script if hmr?
		let sheets = new Set
		let jsassets = []
		let inject = []

		if global.IMBA_HMR_PATH and hmr !== false
			inject.push("<script src='/__hmr__.js'></script>")

		if global.__vite_manifest__
			# in production
			for script, i in self.scripts when src = global.__vite_manifest__[script.src]
				inject.push "<script type=\"module\" src=\"{src.file}\"></script>"
				for css-file in src.css
					sheets.add url:css-file
		elif global.__vite__
			# in development
			inject.push '''
				<link rel='stylesheet' id='imba-dev-ssr' href='.dev-ssr/all.css'>
				<script>addEventListener('DOMContentLoaded', (event) => {
					document.getElementById("imba-dev-ssr").remove()
				});</script>
			'''
		# if we havent included any styles in the html at all
		unless self.styles
			# maybe only if there are no
			for script in self.scripts
				let src = script.src
				let asset = manifest[src]

				if asset and asset.css
					sheets.add(asset.css)
				# add preloads?

			for sheet of sheets
				inject.push("<link rel='stylesheet' href='{sheet.url}'>")
			# now go through the stylesheets?

		HtmlContext = prev

		if inject.length
			let pos = html.indexOf('</head>')
			pos = html.indexOf('<body>') if pos == -1
			pos = 0 if pos == -1
			html = html.slice(0,pos) + '\n' + inject.join('\n') + '\n' + html.slice(pos)
		return "<!DOCTYPE html>" + html

export class HTMLSelectElement < HTMLElement
export class HTMLInputElement < HTMLElement
export class HTMLTextAreaElement < HTMLElement
export class HTMLButtonElement < HTMLElement
export class HTMLOptionElement < HTMLElement

export class HTMLScriptElement < HTMLElement

	get outerHTML
		if HtmlContext
			(HtmlContext.scripts||=[]).push(self)
			if global.__vite_manifest__ and global.__vite_manifest__[self.src]
				# The HTMLElement will take care of resolving the entry
				# to js and css files as defined in the manifest
				return ''

		if #asset
			if #asset.js
				# add nomodule version as well?
				setAttribute('src',#asset.js.url)
				setAttribute('type','module')
			else
				console.warn "could not find browser entrypoint for {#asset.path}"

		super

export class HTMLLinkElement < HTMLElement

	get outerHTML
		if #asset
			let rel = getAttribute('rel')
			let href
			if rel == 'stylesheet'
				unless href = #asset.css.url
					console.warn "could not find stylesheet for {#asset.path}"

			if href
				setAttribute('href',href)
		super

export class HTMLStyleElement < HTMLElement

	set src value
		if #src =? value
			yes
		return

	get src
		#src

	get outerHTML
		if HtmlContext and src
			(HtmlContext.styles||=[]).push(self)

		if src
			# rewrite to a link? Too much magic?
			nodeName = 'link'
			setAttribute('rel','stylesheet')
			setAttribute('href',String(src))
			let out = super
			nodeName = 'style'
			return out

		super

### Event ###
export class Event
export class UIEvent < Event
export class FocusEvent < UIEvent
export class MouseEvent < UIEvent
export class PointerEvent < MouseEvent
export class KeyboardEvent < UIEvent
export class CustomEvent < Event

const descriptorCache = {}

def getDescriptor item,key,cache
	if !item
		return cache[key] = null

	if cache[key] !== undefined
		return cache[key]

	let desc = Object.getOwnPropertyDescriptor(item,key)

	if desc !== undefined or item == SVGElement
		return cache[key] = desc or null

	getDescriptor(Reflect.getPrototypeOf(item),key,cache)

export class SVGElement < Element

	def set$ key,value
		let cache = descriptorCache[nodeName] ||= {}
		let desc = getDescriptor(this,key,cache)

		if !desc or !desc.set
			setAttribute(key,value)
		else
			self[key] = value
		return

export class SVGSVGElement < SVGElement

	set src value
		if #src =? value
			if value and value.adoptNode
				value.adoptNode(self)
			elif value and value.type == 'svg'
				if value.attributes
					for own k,v of value.attributes
						setAttribute(k,v)
				innerHTML = value.content
		return

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
MAP['style'].klass = HTMLStyleElement
MAP['link'].klass = HTMLLinkElement

MAP['svg_svg'].klass = SVGSVGElement

getTagType('')
getTagType('HTML')
getTagType('SVG')

export def createElement name, parent, flags, text
	# struggling with this thing here
	let el = doc.createElement(name)
	el.className = flags if flags

	if text !== null
		el.text$(text)

	# FIXME
	if parent and parent.#appendChild
		parent.#appendChild(el)

	return el

export def createSVGElement name, parent, flags, text, ctx
	let el = doc.createElementNS("http://www.w3.org/2000/svg",name)

	if flags
		el.className = flags

	if parent and parent.#appendChild
		parent.#appendChild(el)

	if text
		el.textContent = text
	return el

export def createComment text
	doc.createComment(text)

export def createTextNode text
	doc.createTextNode(text)

export def createFragment
	doc.createDocumentFragment!

export def createComponent name, parent, flags, text, ctx
	# the component could have a different web-components name?
	let el

	if typeof name != 'string'

		if name.prototype isa HTMLElement
			el = new name()
			el.nodeName = name.nodeName

		elif name and name.nodeName
			name = name.nodeName

	el ||= doc.createElement(CustomTagToElementNames[name] or name)
	el.##parent = parent
	el.#__init__!

	if text !== null
		el.#getSlot('__').text$(text)

	if flags or el.flags$ns # or nsflag
		el.flag$(flags or '')
	return el

export def createDynamic value, parent, flags, text
	if value == null or value == undefined
		return createComment('')
	elif value isa Node
		# check if node already exists somewhere else in dom
		return value
	elif typeof value == 'string' or (value and value.prototype isa Node)
		return createComponent(value,parent,flags,text)

export def defineTag name, klass, options = {}
	TYPES[name] = CUSTOM_TYPES[name] = {
		idl: yes
		name: name
		klass: klass
	}
	let componentName = klass.nodeName = name
	let proto = klass.prototype

	if name.indexOf('-') == -1
		componentName = klass.nodeName = "{name}-tag"
		CustomTagToElementNames[name] = componentName

	if options.extends
		proto.#htmlNodeName = options.extends

	if options.cssns
		let ns = (proto._ns_ || '') + ' ' + options.cssns
		proto._ns_ = ns.trim! + ' '
		proto.#cssns = options.cssns

	if options.cssid
		let ids = (proto.flags$ns || '') + ' ' + options.cssid
		proto.#cssid = options.cssid
		proto.flags$ns = ids.trim! + ' '

	return klass

global.#dom = {
	Location: Location
	Document: Document
}