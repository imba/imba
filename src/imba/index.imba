var root = (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null))

var imba = {
	version: '2.0.0',
	global: root,
	ctx: null,
	document: root.document
}

root.imba = imba

root.customElements ||= {
	define: do yes # console.log('no custom elements')
	get: do yes # console.log('no custom elements')
}

imba.setTimeout = do |fn,ms|
	setTimeout(&,ms) do
		fn()
		imba.$commit()

imba.setInterval = do |fn,ms|
	setInterval(&,ms) do
		fn()
		imba.$commit()

imba.clearInterval = root.clearInterval
imba.clearTimeout = root.clearTimeout

Object.defineProperty(imba,'flags',get:(do imba.document.documentElement.classList))

# if $node$
import {Document,Node,Text,Comment,Element,HTMLElement,DocumentFragment,ShadowRoot,document,getElementType} from './dom'
imba.document = document

def imba.q$ query, ctx
	(ctx isa Element ? ctx : document).querySelector(query)

def imba.q$$ query, ctx
	(ctx isa Element ? ctx : document).querySelectorAll(query)

import * as styles from './css'

def imba.toStyleValue value, unit, key
	styles.toValue(value,unit,key)

def imba.inlineStyles content, id
	styles.register(content,id)
	return

def imba.getAllStyles
	return styles.toStyleSheet!

var dashRegex = /-./g

def imba.toCamelCase str
	if str.indexOf('-') >= 0
		str.replace(dashRegex) do |m| m.charAt(1).toUpperCase()
	else
		str
		


# Basic events - move to separate file?
var emit__ = do |event, args, node|
	let prev, cb, ret

	while (prev = node) and (node = node.next)
		if cb = node.listener
			if node.path and cb[node.path]
				ret = args ? cb[node.path].apply(cb,args) : cb[node.path]()
			else
				# check if it is a method?
				ret = args ? cb.apply(node, args) : cb.call(node)

		if node.times && --node.times <= 0
			prev.next = node.next
			node.listener = null
	return

# method for registering a listener on object
def imba.listen obj, event, listener, path
	let cbs, list, tail
	cbs = obj.__listeners__ ||= {}
	list = cbs[event] ||= {}
	tail = list.tail || (list.tail = (list.next = {}))
	tail.listener = listener
	tail.path = path
	list.tail = tail.next = {}
	return tail

# register a listener once
def imba.once obj, event, listener
	let tail = imba.listen(obj,event,listener)
	tail.times = 1
	return tail

# remove a listener
def imba.unlisten obj, event, cb, meth
	let node, prev
	let meta = obj.__listeners__
	return unless meta

	if node = meta[event]
		while (prev = node) and (node = node.next)
			if node == cb || node.listener == cb
				prev.next = node.next
				# check for correct path as well?
				node.listener = null
				break
	return

# emit event
def imba.emit obj, event, params
	if let cb = obj.__listeners__
		emit__(event,params,cb[event]) if cb[event]
		emit__(event,[event,params],cb.all) if cb.all
	return


import {Flags} from './internal/flags'
import {Scheduler} from './internal/scheduler'

imba.scheduler = new Scheduler()
imba.$commit = do imba.scheduler.add('render')

imba.commit = do
	imba.scheduler.add('render')
	return imba.scheduler.promise

imba.tick = do
	imba.commit()
	return imba.scheduler.promise

###
DOM
###

def imba.mount mountable, into
	let parent = into or document.body
	let element = mountable
	if mountable isa Function
		let ctx = {_: parent}
		let tick = do
			imba.ctx = ctx
			mountable(ctx)
		element = tick()
		imba.scheduler.listen('render',tick)
	else
		# automatic scheduling of element - even before
		# element.__schedule = yes
		element.__F |= $EL_SCHEDULE$

	parent.appendChild(element)

var proxyHandler =
	def get target, name
		let ctx = target
		let val = undefined
		while ctx and val == undefined
			if ctx = ctx.$parent
				val = ctx[name]
		return val

import {EventHandler} from './events'
import './events/pointer'

extend class Node

	get $context
		$context_ ||= new Proxy(self,proxyHandler)

	get $parent
		this.up$ or this.parentNode

	def init$
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

extend class Comment
	# replace this with something else
	def replaceWith$ other
		if other and other.joinBefore$
			other.joinBefore$(this)
		else
			self.parentNode.insertBefore$(other,this)
		# other.insertBeforeBegin$(this)
		self.parentNode.removeChild(this)
		# self.parentNode.replaceChild(other,this)
		return other

# what if this is in a webworker?
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

	def on$ type, mods, scope

		let check = 'on$' + type
		let handler

		# check if a custom handler exists for this type?
		if self[check] isa Function
			handler = self[check](mods,scope)

		handler = new EventHandler(mods,scope)
		let capture = mods.capture
		let passive = mods.passive

		let o = capture

		if passive
			o = {passive: passive, capture: capture}
		
		if (/^(pointerdrag|touch)$/).test(type)
			handler.type = type
			type = 'pointerdown'
			

		self.addEventListener(type,handler,o)
		return handler

	# inline in files or remove all together?
	def text$ item
		self.textContent = item
		self

	def insert$ item, f, prev
		let type = typeof item

		if type === 'undefined' or item === null
			# what if the prev value was the same?
			if prev and prev isa Comment
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
				if prev isa Text
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
		
		# let existing = (flags$ext ||= self.className)
		# self.flag$ = do(str) self.flagSync$(flags$ext = str)
		# self.flagSelf$ = do(str) self.flagSync$(flags$own = str)
		# self.className = (existing ? existing + ' ' : '') + (flags$own = str)
		# return

	def flagSync$
		self.className = ((flags$ns or '') + (flags$ext or '') + ' ' + (flags$own || '') + ' ' + ($flags or ''))

	def open$
		self

	def close$
		self

	def end$
		self.render() if self.render
		return

	def css$ key, value, mods
		self.style[key] = value
		
	def css$var name, value, unit, key
		let cssval = imba.toStyleValue(value,unit,key)
		self.style.setProperty(name,cssval)
		return

Element.prototype.appendChild$ = Element.prototype.appendChild
Element.prototype.removeChild$ = Element.prototype.removeChild
Element.prototype.insertBefore$ = Element.prototype.insertBefore
Element.prototype.replaceChild$ = Element.prototype.replaceChild
Element.prototype.set$ = Element.prototype.setAttribute
Element.prototype.setns$ = Element.prototype.setAttributeNS

ShadowRoot.prototype.insert$ = Element.prototype.insert$
ShadowRoot.prototype.appendChild$ = Element.prototype.appendChild$

# import './fragment'
import {createLiveFragment,createIndexedFragment,createKeyedFragment} from './internal/fragment'

imba.createLiveFragment = createLiveFragment
imba.createIndexedFragment = createIndexedFragment
imba.createKeyedFragment = createKeyedFragment

# Create custom tag with support for scheduling and unscheduling etc

import {ImbaElement} from './internal/component'

const CustomTagConstructors = {}

class ImbaElementRegistry

	def constructor
		types = {}

	def lookup name
		return types[name]

	def get name, klass
		return ImbaElement if !name or name == 'component'
		return types[name] if types[name]
		return getElementType(name) if $node$
		return root[klass] if klass and root[klass]
		root.customElements.get(name) or ImbaElement

	def create name
		if types[name]
			# TODO refactor
			return types[name].create$()
		else
			document.createElement(name)

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
			root.customElements.define(name,klass)
		return klass

imba.tags = new ImbaElementRegistry()

# asset handling
import * as assets from './assets'

imba.registerAsset = assets.register
imba.createAssetElement = assets.create

# root.customElements.define('imba-element',ImbaElement)

def imba.createElement name, parent, flags, text, ctx
	var el = document.createElement(name)
		
	el.className = flags if flags

	if text !== null
		el.text$(text)

	if parent and parent isa Node
		el.insertInto$(parent)

	return el

def imba.createComponent name, parent, flags, text, ctx
	# the component could have a different web-components name?
	var el
	
	if typeof name != 'string'
		if name and name.nodeName
			name = name.nodeName

	if CustomTagConstructors[name]
		el = CustomTagConstructors[name].create$(el)
		el.slot$ = ImbaElement.prototype.slot$
		el.__slots = {}
	else
		el = document.createElement(name)

	el.up$ = parent
	el.init$()

	if text !== null
		el.slot$('__').text$(text)
		
	if flags or el.flags$ns # or nsflag
		el.flag$(flags or '')
	return el

import './svg'

def imba.createSVGElement name, parent, flags, text, ctx
	var el = document.createElementNS("http://www.w3.org/2000/svg",name)

	if flags
		if $node$
			el.className = flags
		else
			el.className.baseVal = flags

	if parent and parent isa Node
		el.insertInto$(parent)
	return el

# currently needed for richValue override
import './internal/bind'

# import './intersect'
