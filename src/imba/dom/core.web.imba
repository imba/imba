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
	customElements,
	document
} = window

const CustomTagConstructors = {}
const TYPES = {}

export def getTagType name, klass
	# TODO follow same structure as ssr TYPES
	if TYPES[name]
		return TYPES[name]

	if window[klass]
		return window[klass]

	if window[name]
		return window[name]

# Basic node extensions

const contextHandler =
	def get target, name
		let ctx = target
		let val = undefined
		while ctx and val == undefined
			if ctx = ctx.#parent
				val = ctx[name]
		return val

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

# Basic element extensions
extend class Element
	
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

export def createSVGElement name, parent, flags, text, ctx
	let el = document.createElementNS("http://www.w3.org/2000/svg",name)

	if flags
		el.className.baseVal = flags

	if parent and parent isa Node
		el.insertInto$(parent)
	return el


export def createAssetElement asset, parent, flags
	unless asset
		console.warn "asset {name} not included in bundle"
		return null
		
	if !asset.#node
		let el = document.createElementNS("http://www.w3.org/2000/svg",'svg')
		for own k,v of asset.attributes
			el.setAttribute(k,v)
		el.innerHTML = asset.content
		el.className.baseVal = asset.flags.join(' ')
		asset.#node = el
	
	let el = asset.#node.cloneNode(yes)
	let cls = el.flags$ns = el.className.baseVal + ' '
	el.className.baseVal = cls + flags
	if parent and parent isa Node
		el.insertInto$(parent)
	return el

export def createComment text
	document.createComment(text)

# Registry
export def createComponent name, parent, flags, text, ctx
	# the component could have a different web-components name?
	let el
	
	if typeof name != 'string'
		if name and name.nodeName
			name = name.nodeName

	if CustomTagConstructors[name]
		el = CustomTagConstructors[name].create$(el)
		console.warn "slot not implemented"
		# el.slot$ = proto.slot$
		el.__slots = {}
	else
		el = document.createElement(name)

	el.##parent = parent
	el.#init!

	if text !== null
		el.slot$('__').text$(text)
		
	if flags or el.flags$ns # or nsflag
		el.flag$(flags or '')
	return el

export def defineTag name, klass, options = {}
	TYPES[name] = klass
	console.log 'defineTag',name

	klass.nodeName = name

	let proto = klass.prototype

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
	else
		window.customElements.define(name,klass)

	return klass
