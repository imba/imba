import {Flags} from './flags'

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

# export const document = global.window.document
const CustomTagConstructors = {}
const CustomTagToElementNames = {}
export const TYPES = {}
export const CUSTOM_TYPES = {}
export def get_document
	global.document

export def use_window
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

extend class Document
	get flags
		self.documentElement.flags

extend class Node
	get #parent
		##parent or this.parentNode or ##up # FIX

	get #context
		##context ||= new Proxy(self,contextHandler)

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

	get #placeholder__
		##placeholder__ ||= global.document.createComment("")

	set #placeholder__ value
		let prev = ##placeholder__
		##placeholder__ = value
		if prev and prev != value and prev.parentNode
			prev.replaceWith$(value)

	def #attachToParent
		let ph = #placeholder__
		if ph.parentNode and ph != self
			ph.replaceWith$(self)
		self

	def #detachFromParent route
		let ph = #placeholder__
		if parentNode and ph != self
			self.replaceWith$(ph)
			# TODO add detached flag?
		self

# Basic element extensions
extend class Element
	
	def log ...params
		console.log(...params)
		self

	def emit name, detail, o = {bubbles: true}
		o.detail = detail if detail != undefined
		let event = new CustomEvent(name, o)
		let res = self.dispatchEvent(event)
		return event

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

			let el = document.createComment('')
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
					res = document.createTextNode(txt)
					prev.replaceWith$(res,self)
					return res
			else
				self.appendChild$(res = document.createTextNode(txt))
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


Element.prototype.appendChild$  = Element.prototype.appendChild
Element.prototype.removeChild$  = Element.prototype.removeChild
Element.prototype.insertBefore$ = Element.prototype.insertBefore
Element.prototype.replaceChild$ = Element.prototype.replaceChild
Element.prototype.set$ = Element.prototype.setAttribute
Element.prototype.setns$ = Element.prototype.setAttributeNS

export def createElement name, parent, flags, text
	let el = document.createElement(name)
		
	el.className = flags if flags

	if text !== null
		el.text$(text)

	if parent and parent isa Node
		el.insertInto$(parent)

	return el


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
		self.className.baseVal = ns ? (ns + (flags$ext = str)) : (flags$ext = str)
		return

	def flagSelf$ str
		# if a tag receives flags from inside <self> we need to
		# redefine the flag-methods to later use both
		self.flag$ = do(str) self.flagSync$(flags$ext = str)
		self.flagSelf$ = do(str) self.flagSync$(flags$own = str)
		return flagSelf$(str)

	def flagSync$
		self.className.baseVal = ((flags$ns or '') + (flags$ext or '') + ' ' + (flags$own || '') + ' ' + ($flags or ''))


extend class SVGSVGElement

	set src value
		if #src =? value
			if value..adoptNode
				value.adoptNode(self)
			elif value..content
				for own k,v of value.attributes
					setAttribute(k,v)
				innerHTML = value.content
		return

		

export def createSVGElement name, parent, flags, text, ctx
	let el = document.createElementNS("http://www.w3.org/2000/svg",name)

	if flags
		el.className.baseVal = flags

	if parent and parent isa Node
		el.insertInto$(parent)
	return el

export def createComment text
	document.createComment(text)

export def createFragment
	document.createDocumentFragment!



const vendor = global.navigator..vendor or ''
const ua = global.navigator..userAgent or ''

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
			el = document.createElement(typ,is: name)
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
	el.#init!

	if text !== null
		el.slot$('__').text$(text)
		
	if flags or el.flags$ns # or nsflag
		el.flag$(flags or '')
	return el

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

export def defineTag name, klass, options = {}
	TYPES[name] = CUSTOM_TYPES[name] = klass

	klass.nodeName = name

	let componentName = name
	let proto = klass.prototype

	if name.indexOf('-') == -1
		componentName = "{name}-tag"
		CustomTagToElementNames[name] = componentName

	let basens = proto._ns_
	if options.ns
		let ns = options.ns
		let flags = ns + ' ' + ns + '_ '
		if basens
			flags += proto.flags$ns 
			ns += ' ' + basens
		proto._ns_ = ns
		proto.flags$ns = flags

	if proto.#htmlNodeName
		options.extends = proto.#htmlNodeName

	if options.extends
		proto.#htmlNodeName = options.extends
		CustomTagConstructors[name] = klass

		if supportsCustomizedBuiltInElements
			window.customElements.define(componentName,klass,extends: options.extends)
	else
		window.customElements.define(componentName,klass)

	return klass