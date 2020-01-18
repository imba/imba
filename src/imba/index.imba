
var root = (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null))

var imba = {
	version: '2.0.0',
	global: root,
	ctx: null,
	document: root.document
}

root.imba = imba

root.customElements ||= {
	define: do console.log('no custom elements')
	get: do console.log('no custom elements')
}

imba.setTimeout = do |fn,ms|
	setTimeout(&,ms) do
		fn()
		imba.commit()

imba.setInterval = do |fn,ms|
	setInterval(&,ms) do
		fn()
		imba.commit()

imba.clearInterval = root.clearInterval
imba.clearTimeout = root.clearTimeout

if $node$
	import {Document,Node,Text,Comment,Element,HTMLElement,DocumentFragment,document,getElementType} from './ssr'
	imba.document = document

def imba.q$ query, ctx
	(ctx isa Element ? ctx : document).querySelector(query)

def imba.q$$ query, ctx
	(ctx isa Element ? ctx : document).querySelectorAll(query)

def imba.inlineStyles styles
	var el = document.createElement('style')
	el.textContent = styles
	document.head.appendChild(el)
	return

var dashRegex = /-./g

def imba.toCamelCase str
	if str.indexOf('-') >= 0
		str.replace(dashRegex) do |m| m.charAt(1).toUpperCase()
	else
		str

# Basic events - move to separate file?
var emit__ = do |event, args, node|
	var prev, cb, ret

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
	var cbs, list, tail
	cbs = obj.__listeners__ ||= {}
	list = cbs[event] ||= {}
	tail = list.tail || (list.tail = (list.next = {}))
	tail.listener = listener
	tail.path = path
	list.tail = tail.next = {}
	return tail

# register a listener once
def imba.once obj, event, listener
	var tail = imba.listen(obj,event,listener)
	tail.times = 1
	return tail

# remove a listener
def imba.unlisten obj, event, cb, meth
	var node, prev
	var meta = obj.__listeners__
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
	if var cb = obj.__listeners__
		emit__(event,params,cb[event]) if cb[event]
		emit__(event,[event,params],cb.all) if cb.all
	return


import {Scheduler} from './internal/scheduler'

imba.scheduler = Scheduler.new()
imba.commit = do imba.scheduler.add('render')
imba.tick = do
	imba.commit()
	return imba.scheduler.promise

###
DOM
###

def imba.mount element, into
	# automatic scheduling of element - even before
	element.__schedule = yes
	(into or document.body).appendChild(element)


const CustomTagConstructors = {}

class ImbaElementRegistry

	def constructor
		#types = {}

	def lookup name
		return #types[name]

	def get name
		return ImbaElement unless name
		return #types[name] if #types[name]
		return getElementType(name) if $node$
		root.customElements.get(name) or ImbaElement

	def create name
		if #types[name]
			# TODO refactor
			return #types[name].create$()
		else
			document.createElement(name)

	def define name, klass, options
		#types[name] = klass
		if options and options.extends
			CustomTagConstructors[name] = klass

		let proto = klass.prototype
		if proto.render && proto.end$ == Element.prototype.end$
			proto.end$ = proto.render

		root.customElements.define(name,klass)
		return klass

imba.tags = ImbaElementRegistry.new()

var proxyHandler =
	def get target, name
		let ctx = target
		let val = undefined
		while ctx and val == undefined
			if ctx = ctx.parentContext
				val = ctx[name]
		return val

import {EventHandler} from './events'

extend class Node

	get __context
		this.context$ ||= Proxy.new(self,proxyHandler)

	get parentContext
		this.up$ or this.parentNode

	def init$
		self

	# replace this with something else
	def replaceWith$ other
		@parentNode.replaceChild(other,this)
		return other

	def insertInto$ parent
		parent.appendChild$(this)
		return this

	def insertBefore$ el, prev
		this.insertBefore(el,prev)

	def insertBeforeBegin$ other
		@parentNode.insertBefore(other,this)

	def insertAfterEnd$ other
		if @nextSibling
			@nextSibling.insertBeforeBegin$(other)
		else
			@parentNode.appendChild(other)

extend class Comment
	# replace this with something else
	def replaceWith$ other
		if other and other.joinBefore$
			other.joinBefore$(this)
		else
			@parentNode.insertBefore$(other,this)
		# other.insertBeforeBegin$(this)
		@parentNode.removeChild(this)
		# @parentNode.replaceChild(other,this)
		return other

# what if this is in a webworker?
extend class Element

	def emit name, detail, o = {bubbles: true}
		o.detail = detail if detail != undefined
		let event = CustomEvent.new(name, o)
		let res = @dispatchEvent(event)
		return event

	def slot$ name, ctx
		return self

	def on$ type, mods, scope

		var check = 'on$' + type
		var handler

		# check if a custom handler exists for this type?
		if self[check] isa Function
			handler = self[check](mods,scope)

		handler = EventHandler.new(mods,scope)
		var capture = mods.capture
		var passive = mods.passive

		var o = capture

		if passive
			o = {passive: passive, capture: capture}

		@addEventListener(type,handler,o)
		return handler

	# inline in files or remove all together?
	def text$ item
		@textContent = item
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
				@textContent = txt
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
				@appendChild$(res = document.createTextNode(txt))
				return res	

		else
			prev ? prev.replaceWith$(item,self) : item.insertInto$(self)
			return item
		return

	def flag$ str
		@className = str
		return

	def flagSelf$ str
		# if a tag receives flags from inside <self> we need to
		# redefine the flag-methods to later use both
		self.flag$ = do |str| self.flagSync$(#extflags = str)
		self.flagSelf$ = do |str| self.flagSync$(#ownflags = str)
		@className = (@className || '') + ' ' + (#ownflags = str)
		return

	def flagSync$
		@className = ((#extflags or '') + ' ' + (#ownflags || ''))

	def open$
		self

	def close$
		self

	def end$
		@render() if @render
		return

	def css$ key, value, mods
		@style[key] = value

Element.prototype.appendChild$ = Element.prototype.appendChild
Element.prototype.removeChild$ = Element.prototype.removeChild
Element.prototype.insertBefore$ = Element.prototype.insertBefore
Element.prototype.replaceChild$ = Element.prototype.replaceChild

# import './fragment'
import {createLiveFragment,createFragment} from './internal/fragment'

imba.createLiveFragment = createLiveFragment
imba.createFragment = createFragment

# Create custom tag with support for scheduling and unscheduling etc

class ImbaElement < HTMLElement
	def constructor
		super()
		this.setup$()
		this.build() if this.build

	def setup$
		#slots = {}
		#f = 0

	def init$
		self

	# returns the named slot - for context
	def slot$ name, ctx
		if name == '__' and !self.render
			return self

		#slots[name] ||= imba.createLiveFragment()

	def schedule
		imba.scheduler.listen('render',self)
		#scheduled = yes
		@tick()

	def unschedule
		imba.scheduler.unlisten('render',self)
		#scheduled = no

	def connectedCallback
		unless #f
			#f = 8
			this.awaken()
		this.schedule() if #schedule
		this.mount() if this.mount

	def disconnectedCallback
		this.unschedule() if #scheduled
		this.unmount() if this.unmount

	def tick
		this.render && this.render()

	def awaken
		#schedule = true

root.customElements.define('imba-element',ImbaElement)


def imba.createProxyProperty target
	def getter
		target[0] ? target[0][target[1]] : undefined

	def setter v
		target[0] ? (target[0][target[1]] = v) : null

	return {
		get: getter
		set: setter
	}


def imba.createElement name, bitflags, parent, flags, text, sfc
	var el = document.createElement(name)

	if (bitflags & $TAG_CUSTOM$) or (bitflags === undefined and el.__f != undefined)
		if CustomTagConstructors[name]
			el = CustomTagConstructors[name].create$(el)
			el.slot$ = ImbaElement.prototype.slot$
			el.__slots = {}

		el.__f = bitflags
		el.init$()

		if text !== null
			el.slot$('__').text$(text)
			text = null

	el.className = flags if flags

	if sfc
		el.setAttribute('data-'+sfc,'')

	if text !== null
		el.text$(text)

	if parent and parent isa Node
		el.insertInto$(parent)

	return el

import './svg'

def imba.createSVGElement name, bitflags, parent, flags, text, sfc
	var el = document.createElementNS("http://www.w3.org/2000/svg",name)
	el.className.baseVal = flags if flags
	if parent and parent isa Node
		el.insertInto$(parent)
	return el

# import './intersect'
