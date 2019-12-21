
var root = (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null))

var imba = {
	version: '2.0.0',
	global: root,
	ctx: null,
	document: root.document
}

root.imba = imba

var raf = root.requestAnimationFrame || (do |blk| setTimeout(blk,1000 / 60))

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

def activateSelectionHandler
	imba.document.addEventListener('selectionchange') do |e|
		return if e.handled$
		e.handled$ = yes
		
		let target = imba.document.activeElement
		if target and target.matches('input,textarea')
			let custom = CustomEvent.new('selection',{
				detail: {
					start: target.selectionStart
					end: target.selectionEnd
				}
			})
			target.dispatchEvent(custom)
	activateSelectionHandler = do yes


def imba.q$ query, ctx
	(ctx isa Element ? ctx : document).querySelector(query)

def imba.q$$ query, ctx
	(ctx isa Element ? ctx : document).querySelectorAll(query)

def imba.inlineStyles styles
	var el = document.createElement('style')
	# styles = styles.replace(/\}/g,'}\n')
	# console.log "add styles",styles,JSON.stringify(styles)
	el.textContent = styles
	# el.innerHTML = styles
	# el.appendChild(document.createTextNode(styles))
	document.head.appendChild(el)
	return

var dashRegex = /-./g

def imba.toCamelCase str
	if str.indexOf('-') >= 0
		str.replace(dashRegex) do |m| m.charAt(1).toUpperCase()
	else
		str

def imba.createLiveFragment bitflags, options
	var el = imba.document.createDocumentFragment()
	el.setup$(bitflags, options)
	return el

var setterCache = {}

# not to be used anymore?
def imba.toSetter str
	setterCache[str] ||= Imba.toCamelCase('set-' + str)

# Basic events - move to separate file?
var emit__ = do |event, args, node|
	# var node = cbs[event]
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


# Scheduler
class Scheduler
	def constructor
		@queue = []
		@stage = -1
		@batch = 0
		@scheduled = no
		@listeners = {}

		#ticker = do |e|
			@scheduled = no
			@tick(e)
		self

	def add item, force
		if force or @queue.indexOf(item) == -1
			@queue.push(item)

		@schedule() unless @scheduled

	def listen ns, item
		@listeners[ns] ||= Set.new()
		@listeners[ns].add(item)

	def unlisten ns, item
		@listeners[ns] ||= Set.new()
		@listeners[ns].remove(item)

	get promise
		Promise.new do |resolve| @add(resolve)

	def tick timestamp
		var items = @queue
		@ts = timestamp unless @ts
		@dt = timestamp - @ts
		@ts = timestamp
		@queue = []
		@stage = 1
		@batch++

		if items.length
			for item,i in items
				if typeof item === 'string' && @listeners[item]
					@listeners[item].forEach do |item|
						if item.tick isa Function
							item.tick(self)
						elif item isa Function
							item(self)
				elif item isa Function
					item(@dt,self)
				elif item.tick
					item.tick(@dt,self)
		@stage = 2
		@stage = @scheduled ? 0 : -1
		self

	def schedule
		if !@scheduled
			@scheduled = yes
			if @stage == -1
				@stage = 0
			raf(#ticker)
		self

imba.scheduler = Scheduler.new()
imba.commit = do imba.scheduler.add('render')

###
DOM
###
		

def imba.mount element, into
	# automatic scheduling of element - even before
	element.__schedule = yes
	(into or document.body).appendChild(element)



class ImbaElementRegistry

	def get name
		return ImbaElement unless name
		root.customElements.get(name)

	def define name, klass
		# console.log "define element",name,klass
		root.customElements.define(name,klass)
		# klass.prototype.__sfc = options && options.id || null
		return klass

root.imbaElements = ImbaElementRegistry.new()

import {EventHandler} from './events'

extend class Node
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

		if type == 'selection'
			activateSelectionHandler()

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
Element.prototype.insertBefore$ = Element.prototype.insertBefore
Element.prototype.replaceChild$ = Element.prototype.replaceChild

# import './fragment'
import {createLiveFragment,createFragment} from './fragment'

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
		# if the component has no render method
		# we can simply pass through
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

var isArray = do |val|
	val and val:splice and val:sort

var isGroup = do |obj|
	return obj isa Array or (obj && obj.has isa Function)

var bindHas = do |object,value|
	if object isa Array
		object.indexOf(value) >= 0
	elif object and object.has isa Function
		object.has(value)
	elif object and object.contains isa Function
		object.contains(value)
	elif object == value
		return true
	else
		return false

var bindAdd = do |object,value|
	if object isa Array
		object.push(value)
	elif object and object.add isa Function
		object.add(value)

var bindRemove = do |object,value|
	if object isa Array
		let idx = object.indexOf(value)
		object.splice(idx,1) if idx >= 0
	elif object and object.delete isa Function
		object.delete(value)

###
Data binding
###
extend class Element
	def getRichValue
		@value

	def setRichValue value
		@value = value
	
	def bind$ key, mods, value
		let o = value or []

		if key == 'model'
			unless #f & $TAG_BIND_MODEL$
				#f |= $TAG_BIND_MODEL$
				@on$('change',{'@change$': true},this) if @change$
				@on$('input',{capture: true,'@input$': true},this) if @input$

		Object.defineProperty(self,key,o isa Array ? imba.createProxyProperty(o) : o)
		return o

Object.defineProperty(Element.prototype,'richValue',{
	def get
		@getRichValue()
	def set v
		@setRichValue(v)
})

extend class HTMLSelectElement

	def change$ e
		return unless #f & $TAG_BIND_MODEL$

		let model = @model
		let prev = #richValue
		#richValue = undefined
		let values = self.getRichValue()

		if @multiple
			if prev
				for value in prev when values.indexOf(value) == -1
					bindRemove(model,value)

			for value in values
				if !prev or prev.indexOf(value) == -1
					bindAdd(model,value)
		else
			@model = values[0]
		self

	def getRichValue
		if #richValue
			return #richValue

		#richValue = for o in @selectedOptions
			o.richValue

	def syncValue
		let model = @model

		if @multiple
			let vals = []
			for option,i in @options
				let val = option.richValue
				let sel = bindHas(model,val)
				option.selected = sel
				vals.push(val) if sel
			#richValue = vals

		else
			for option,i in @options
				let val = option.richValue
				if val == model
					#richValue = [val]
					break @selectedIndex = i
		return

	def end$
		@syncValue()

extend class HTMLOptionElement
	def setRichValue value
		#richValue = value
		self.value = value

	def getRichValue
		if #richValue !== undefined
			return #richValue
		return self.value

extend class HTMLTextAreaElement
	def setRichValue value
		#richValue = value
		self.value = value

	def getRichValue
		if #richValue !== undefined
			return #richValue
		return self.value

	def input$ e
		@model = @value

	def end$
		@value = @model

extend class HTMLInputElement
	
	def input$ e
		return unless #f & $TAG_BIND_MODEL$
		let typ = @type

		if typ == 'checkbox' or typ == 'radio'
			return

		#richValue = undefined
		@model = @richValue

	def change$ e
		return unless #f & $TAG_BIND_MODEL$

		let model = @model
		let val = @richValue

		if @type == 'checkbox' or @type == 'radio'
			let checked = @checked
			if isGroup(model)
				checked ? bindAdd(model,val) : bindRemove(model,val)
			else
				@model = checked ? val : false

	def setRichValue value
		#richValue = value
		self.value = value

	def getRichValue
		if #richValue !== undefined
			return #richValue

		let value = @value
		let typ = @type

		if typ == 'range' or typ == 'number'
			value = @valueAsNumber
			value = null if Number.isNaN(value)
		elif typ == 'checkbox'
			value = true if value == undefined or value === 'on'

		return value

	def end$
		if #f & $TAG_BIND_MODEL$
			if @type == 'checkbox' or @type == 'radio'
				@checked = bindHas(@model,@richValue)
			else
				@richValue = @model



def imba.createElement name, bitflags, parent, flags, text, sfc
	var el = root.document.createElement(name)

	if (bitflags & $TAG_CUSTOM$) or (bitflags === undefined and el.__f != undefined)
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
	var el = root.document.createElementNS("http://www.w3.org/2000/svg",name)
	el.className.baseVal = flags if flags
	if parent and parent isa Node
		el.insertInto$(parent)
	return el
