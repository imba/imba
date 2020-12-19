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

export getTagType name
	if window[name]
		return window[name]

# Basic node extensions

extend class Node
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
					res = doc.createTextNode(txt)
					prev.replaceWith$(res,self)
					return res
			else
				self.appendChild$(res = doc.createTextNode(txt))
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


# Registry

const CustomTagConstructors = {}

class ImbaElementRegistry

	def constructor
		types = {}

	def lookup name
		return types[name]

	def get name, klass
		return ImbaElement if !name or name == 'component'
		return types[name] if types[name]
		return DOM.getElementType(name) if $node$
		return DOM[klass] if klass and DOM[klass]
		DOM.customElements.get(name) or DOM.ImbaElement

	def create name
		if types[name]
			# TODO refactor
			return types[name].create$()
		else
			doc.createElement(name)

	def define name, klass, options = {}
		types[name] = klass
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
		else
			DOM.customElements.define(name,klass)
		return klass

export const tags = new ImbaElementRegistry


export def defineTag name, klass, options = {}
	TYPES[name] = klass
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