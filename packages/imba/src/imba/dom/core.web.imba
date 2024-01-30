# imba$stdlib=1

import {Flags} from './flags'
import {getDeepPropertyDescriptor} from '../utils'
import {RenderContext,createRenderContext} from './context'

const IEvent = window.Event
const IUIEvent = window.UIEvent
const IMouseEvent = window.MouseEvent
const IPointerEvent = window.PointerEvent
const IKeyboardEvent = window.KeyboardEvent
const ICustomEvent = window.CustomEvent
const INode = window.Node
const IComment = window.Comment
const IText = window.Text
const IElement = window.Element
const IHTMLElement = window.HTMLElement
const IHTMLHtmlElement = window.HTMLHtmlElement
const IHTMLSelectElement = window.HTMLSelectElement
const IHTMLInputElement = window.HTMLInputElement
const IHTMLTextAreaElement = window.HTMLTextAreaElement
const IHTMLButtonElement = window.HTMLButtonElement
const IHTMLOptionElement = window.HTMLOptionElement
const IHTMLScriptElement = window.HTMLScriptElement
const ISVGElement = window.SVGElement
const IDocumentFragment = window.DocumentFragment
const IShadowRoot = window.ShadowRoot
const IDocument = window.Document
const IWindow = window.Window
const IcustomElements = window.customElements

export {
	IEvent as Event,
	IUIEvent as UIEvent,
	IMouseEvent as MouseEvent,
	IPointerEvent as PointerEvent,
	IKeyboardEvent as KeyboardEvent,
	ICustomEvent as CustomEvent,
	INode as Node,
	IComment as Comment,
	IText as Text,
	IElement as Element,
	IHTMLElement as HTMLElement,
	IHTMLHtmlElement as HTMLHtmlElement,
	IHTMLSelectElement as HTMLSelectElement,
	IHTMLInputElement as HTMLInputElement,
	IHTMLTextAreaElement as HTMLTextAreaElement,
	IHTMLButtonElement as HTMLButtonElement,
	IHTMLOptionElement as HTMLOptionElement,
	IHTMLScriptElement as HTMLScriptElement,
	ISVGElement as SVGElement,
	IDocumentFragment as DocumentFragment,
	IShadowRoot as ShadowRoot,
	IDocument as Document,
	IWindow as Window,
	IcustomElements as customElements
}

###
export const {
	Event,
	UIEvent,
	MouseEvent,
	PointerEvent,
	KeyboardEvent,
	CustomEvent,
	Node,
	Comment,
	Text,
	Element,
	HTMLElement,
	HTMLHtmlElement,
	HTMLSelectElement,
	HTMLInputElement,
	HTMLTextAreaElement,
	HTMLButtonElement,
	HTMLOptionElement,
	HTMLScriptElement,
	SVGElement,
	DocumentFragment,
	ShadowRoot,
	Document,
	Window,
	customElements
} = global.window
###

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

# export const document = global.window.document
const CustomTagConstructors = {}
const CustomTagToElementNames = {}
export const TYPES = {}
export const CUSTOM_TYPES = {}
export def get_document
	global.document

export def use_window
	global.imba.uses_window = yes
	yes

# Basic node extensions

const contextHandler =
	def get target, name
		let ctx = target
		let val = undefined
		while ctx and val == undefined
			if ctx = ctx.#parent
				val = ctx[name]
		return val

	def set target, name, value
		let ctx = target
		let val = undefined
		while ctx and val == undefined
			let desc = getDeepPropertyDescriptor(ctx,name,Element)
			if desc
				ctx[name] = value
				return yes
			else
				ctx = ctx.#parent
		return yes

extend class Document
	get flags
		self.documentElement.flags

	def emit ...params
		self.documentElement.emit(...params)

# @ts-ignore
Node.prototype.#__init__ = do this

extend class Node

	###
	@custom
	@summary Reference to the parentNode even before element has been attached
	###
	get #parent\ParentNode
		##parent or self.parentNode or ##up

	get #closestNode
		self

	get #parentNode\ParentNode
		#parent.#closestNode

	get #context
		##context ||= new Proxy(self,contextHandler)

	def ##inited
		self

	def #getRenderContext sym
		createRenderContext(self,sym)

	def #getDynamicContext sym,key
		#getRenderContext(sym).#getRenderContext(key)

	def #insertChild newnode, refnode
		newnode.#insertInto(self,refnode)

	def #appendChild newnode
		newnode.#insertInto(self,null)

	def #replaceChild newnode, oldnode
		let res = #insertChild(newnode,oldnode)
		#removeChild(oldnode)
		return res

	def #removeChild node
		node.#removeFrom(self)

	# can override if the element itself wants ot deal with this
	def #insertInto parent, before = null
		if before
			parent.insertBefore(self,before)
		else
			parent.appendChild(self)
		return self

	def #insertIntoDeopt parent, before
		# log '#insertIntoDeopt',parent,before
		if before
			parent.insertBefore(#domNode or self,before)
		else
			parent.appendChild(#domNode or self)
		return self

	def #removeFrom parent
		parent.removeChild(self)

	def #removeFromDeopt parent
		parent.removeChild(#domNode or self)

	def #replaceWith other, parent
		parent.#replaceChild(other,self)

	def #replaceWithDeopt other, parent
		parent.#replaceChild(other,#domNode or self)

	get #placeholderNode
		let c
		##placeholderNode ||= (c = global.document.createComment("placeholder"),c.#forNode = self,c)

	set #placeholderNode value
		let prev = ##placeholderNode
		##placeholderNode = value
		value.#forNode = self
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
			##up ||= #parent

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

			let el = document.createComment('')
			return prev ? prev.#replaceWith(el,self) : el.#insertInto(this,null)

		# dont reinsert again
		if item === prev
			return item

		# what if this is null or undefined -- add comment and return? Or blank text node?
		elif type !== 'object'
			let res
			let txt = item

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
			# Coerce the object to string if it is not
			if !item.#insertInto
				return #placeChild( String(item),f,prev )

			return prev ? prev.#replaceWith(item,this) : item.#insertInto(this,null)
		return

# Basic element extensions
extend class Element

	def log ...params
		console.log(...params)

	get hidden?
		let style = global.getComputedStyle(self)
		if style.display == 'none' or style.visibility == 'hidden'
			return true
		if offsetParent or self === global.document.body
			return false
		return parentElement..hidden? ?? true

	get focus?
		document.activeElement == self

	get focin?
		contains(document.activeElement)

	def emit name, detail\any?, o = {bubbles: true, cancelable: true, detail: null}
		o.detail = detail if detail != undefined
		let event = new CustomEvent(name, o)
		let res = self.dispatchEvent(event)
		return event

	# inline in files or remove all together?
	def text$ item
		self.textContent = item
		self

	def #beforeReconcile
		self

	def #afterReconcile
		self

	def #afterVisit
		##visitContext = null if ##visitContext
		return

	get #visitContext
		##visitContext ||= {}

	get flags\Flags
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

	def set$ key,value
		# FIXME relatively slow
		let desc = getDeepPropertyDescriptor(this,key,Element)
		if !desc or !desc.set
			setAttribute(key,value)
		else
			self[key] = value
		return

	get richValue
		value

	set richValue value
		self.value = value

# Element.prototype.set$ = Element.prototype.setAttribute
Element.prototype.setns$ = Element.prototype.setAttributeNS
Element.prototype.#isRichElement = yes

export def createElement name, parent, flags, text
	let el = document.createElement(name)

	el.className = flags if flags

	if text !== null
		el.text$(text)

	if parent and parent.#appendChild
		parent.#appendChild(el)
		# el.#insertInto(parent)

	return el

extend class SVGElement

	def set$ key,value
		let cache = descriptorCache[nodeName] ||= {}
		let desc = getDescriptor(this,key,cache)

		if !desc or !desc.set
			setAttribute(key,value)
		else
			self[key] = value
		return

	def flag$ str
		let ns = flags$ns
		self.setAttribute('class',ns ? (ns + (flags$ext = str)) : (flags$ext = str))
		return

	def flagSelf$ str
		# if a tag receives flags from inside <self> we need to
		# redefine the flag-methods to later use both
		self.flag$ = do(str) self.flagSync$(flags$ext = str)
		self.flagSelf$ = do(str) self.flagSync$(flags$own = str)
		return flagSelf$(str)

	def flagSync$
		self.setAttribute('class',(flags$ns or '') + (flags$ext or '') + ' ' + (flags$own || '') + ' ' + ($flags or ''))

extend class SVGSVGElement

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

export def createSVGElement name, parent, flags, text, ctx
	let el = document.createElementNS("http://www.w3.org/2000/svg",name)

	if flags
		el.className.baseVal = flags

	if parent and parent.#appendChild
		parent.#appendChild(el) # .#appendChild(parent)

	if text
		el.textContent = text

	return el

export def createComment text
	document.createComment(text)

export def createTextNode text
	document.createTextNode(text)

export def createFragment
	document.createDocumentFragment!

const navigator = global.navigator
const vendor = navigator and navigator.vendor or ''
const ua = navigator and navigator.userAgent or ''

const isSafari = vendor.indexOf('Apple') > -1 || ua.indexOf('CriOS') >= 0 || ua.indexOf('FxiOS') >= 0
const supportsCustomizedBuiltInElements = !isSafari
const CustomDescriptorCache = new Map

class CustomHook < HTMLElement
	def connectedCallback
		if supportsCustomizedBuiltInElements
			parentNode.removeChild(self)
		else
			parentNode.connectedCallback!

	def disconnectedCallback
		if !supportsCustomizedBuiltInElements
			parentNode.disconnectedCallback!

window.customElements.define('i-hook',CustomHook)

def getCustomDescriptors el, klass
	let props = CustomDescriptorCache.get(klass)

	unless props
		props = {}
		let proto = klass.prototype
		let protos = [proto]
		while proto = (proto and Object.getPrototypeOf(proto))
			break if proto.constructor == el.constructor
			protos.unshift(proto)

		for item in protos
			let desc = Object.getOwnPropertyDescriptors(item)
			Object.assign(props,desc)
		CustomDescriptorCache.set(klass,props)

	return props

# Registry
export def createComponent name, parent, flags, text, ctx
	# the component could have a different web-components name?
	let el

	if typeof name != 'string'
		if name and name.nodeName
			name = name.nodeName

	let cmpname = CustomTagToElementNames[name] or name

	if CustomTagConstructors[name]
		let cls = CustomTagConstructors[name]
		let typ = cls.prototype.#htmlNodeName
		if typ and supportsCustomizedBuiltInElements
			el = document.createElement(typ,is: cmpname)
		elif cls.create$ and typ
			el = document.createElement(typ)
			el.setAttribute('is',cmpname)
			let props = getCustomDescriptors(el,cls)
			Object.defineProperties(el,props)
			el.__slots = {}
			# check if we need a hook though?
			el.appendChild(document.createElement('i-hook'))
		elif cls.create$
			el = cls.create$(el)
			el.__slots = {}
		else
			console.warn "could not create tag {name}"
	else
		el = document.createElement(CustomTagToElementNames[name] or name)

	el.##parent = parent
	el.#__init__!
	el.##inited! # .inited(el) if el.#__hooks__

	# potentially

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
	elif value.#isRichElement
		return value
	else
		return createComponent(value,parent,flags,text)

export def getTagType name, klass
	# TODO follow same structure as ssr TYPES
	if TYPES[name]
		return TYPES[name]

	if window[klass]
		return window[klass]

	if window[name]
		return window[name]

export def getSuperTagType name, klass, cmp
	let typ = getTagType(name,klass)
	if !typ
		console.warn "could not inherit from undefined tag type {name}"

	let custom = typ == cmp or (typ.prototype instanceof cmp) or typ.prototype.#htmlNodeName

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

export def defineTag name, klass, options = {}
	TYPES[name] = CUSTOM_TYPES[name] = klass

	klass.nodeName = name

	let componentName = name
	let proto = klass.prototype

	if name.indexOf('-') == -1
		componentName = "{name}-tag"
		CustomTagToElementNames[name] = componentName

	# if options.cssns
	if options.cssns
		let ns = (proto._ns_ || proto.#cssns || '') + ' ' + (options.cssns or '')
		proto._ns_ = ns.trim! + ' '
		proto.#cssns = options.cssns

	if options.cssid
		let ids = (proto.flags$ns || '') + ' ' + options.cssid
		proto.#cssid = options.cssid
		proto.flags$ns = ids.trim! + ' '

	if proto.#htmlNodeName and !options.extends
		options.extends = proto.#htmlNodeName

	if options.extends
		proto.#htmlNodeName = options.extends
		CustomTagConstructors[name] = klass

		if supportsCustomizedBuiltInElements
			window.customElements.define(componentName,klass,extends: options.extends)
	else
		window.customElements.define(componentName,klass)

	return klass

let instance = global.imba ||= {}
instance.document = global.document

declare extend class Element
	###
	Gives dynamic elements and elements inside lists a stable identity.
	Any value (both objects and primitive values) may be used as a key.
	@idl
	###
	set key value\any
		self

	declare data\any