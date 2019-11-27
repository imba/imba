
var root = (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null))

var imba = {
	version: '2.0.0',
	global: root,
	ctx: null 
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

def imba.inlineStyles styles
	var el = document.createElement('style')
	el.textContent = styles
	document.head.appendChild(el)
	return

# remove
def root.$subclass obj, sup
	for k,v of sup
		obj[k] = v if sup.hasOwnProperty(k)

	obj.prototype = Object.create(sup.prototype)
	obj.__super__ = obj.prototype.__super__ = sup.prototype
	obj.prototype.initialize = obj.prototype.constructor = obj
	return obj

var dashRegex = /-./g

def imba.toCamelCase str
	if str.indexOf('-') >= 0
		str.replace(dashRegex) do |m| m.charAt(1).toUpperCase()
	else
		str

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
	def initialize
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

def imba.createDocumentFragment bitflags
	var el = root.document.createDocumentFragment()
	el.setup$(bitflags)
	return el

def imba.createElement name, bitflags, parent, flags, text, sfc
	var el = root.document.createElement(name)

	# only for custom elements
	if el.__sfc
		el.setAttribute('data-'+el.__sfc,'')

	el.className = flags if flags

	if sfc and sfc.id
		el.setAttribute('data-'+sfc.id,'')

	if bitflags
		el.__f = bitflags

	if text !== null
		el.text$(text)

	if parent and parent isa Node
		# not working well with the 
		# what if parent is a IndexedTagFragment?
		parent.insert$(el,bitflags)
	return el

def imba.createFragment bitflags, parent
	if bitflags & $TAG_INDEXED$
		return IndexedTagFragment.new(bitflags,parent)
	else
		return KeyedTagFragment.new(bitflags,parent)
	# elif type == 1
	# 	return IndexedTagFragment.new(parent,slot,options)
	# elif type == 4
	# 	return BranchedTagFragment.new(parent,slot,options)


def imba.mount element, into
	# automatic scheduling of element - even before
	element.__schedule = yes
	(into or document.body).appendChild(element)

class ImbaElementRegistry

	def get name
		root.customElements.get(name)

	def define name, supr, body, options
		supr ||= 'imba-element'

		var superklass = HTMLElement

		if supr isa String
			if supr == 'component'
				supr = 'imba-component'

			superklass = self.get(supr)

		var klass = `class extends superklass {}`

		# call supplied body
		body(klass) if body

		var proto = klass.prototype

		# sfc stuff
		# if options and options.id
		proto.__sfc = options && options.id || null

		if proto.mount
			proto.connectedCallback ||= do this.mount()

		if proto.unmount
			proto.disconnectedCallback ||= do this.unmount()

		root.customElements.define(name,klass)
		return klass

root.imbaElements = ImbaElementRegistry.new()

var keyCodes = {
	esc: [27],
	tab: [9],
	enter: [13],
	space: [32],
	up: [38],
	down: [40],
	del: [8,46]
}

# could cache similar event handlers with the same parts
class EventHandler
	def initialize params,closure
		@params = params
		@closure = closure

	def getHandlerForMethod el, name
		return null unless el
		el[name] ? el : @getHandlerForMethod(el.parentNode,name)

	def handleEvent event
		var target = event.target
		var parts = @params
		var i = 0

		for part,i in @params
			let handler = part
			let args = [event]
			let res
			let context = null

			if handler isa Array
				args = handler.slice(1)
				handler = handler[0]

				for param,i in args
					# what about fully nested arrays and objects?
					# ought to redirect this
					if typeof param == 'string' && param[0] == '~'
						let name = param.slice(2)

						if param[1] == '$'
							# reference to a cache slot
							args[i] = this[name]

						elif param[1] == '@'
							if name == 'event'
								args[i] = event
							elif name == 'this'
								args[i] = @element
							else
								args[i] = event[name]

			# check if it is an array?
			if handler == 'stop'
				event.stopImmediatePropagation()
			elif handler == 'prevent'
				event.preventDefault()
			elif handler == 'ctrl'
				break unless event.ctrlKey
			elif handler == 'alt'
				break unless event.altKey
			elif handler == 'shift'
				break unless event.shiftKey
			elif handler == 'meta'
				break unless event.metaKey
			elif handler == 'self'
				break unless target == event.currentTarget

			elif keyCodes[handler]
				unless keyCodes[handler].indexOf(event.keyCode) >= 0
					break

			elif typeof handler == 'string'
				if handler[0] == '@'
					handler = handler.slice(1)
					context = closure
				else
					context = @getHandlerForMethod(event.currentTarget,handler)

			if context
				res = context[handler].apply(context,args)
			elif handler isa Function
				res = handler.apply(event.currentTarget,args)

		imba.commit()

		return

extend class Node
	# replace this with something else
	def replaceWith$ other
		@parentNode.replaceChild(other,this)
		return other

	def insertInto$ parent
		parent.appendChild$(this)
		return this

	def insertAdjacent$ pos, other
		if pos == 'beforebegin'
			@parentNode.insertBefore(other,this)
		elif pos == 'afterend'
			if @nextSibling
				@nextSibling.insertAdjacent$('beforebegin',other)
			else
				@parentNode.appendChild$(other)

# what if this is in a webworker?
extend class Element

	def insertAdjacent$ pos, other
		@insertAdjacentElement(pos,other)
	
	def on$ type, parts, scope
		var handler = EventHandler.new(parts,scope)
		@addEventListener(type,handler)
		return handler

	# inline in files or remove all together?
	def text$ item
		@textContent = item
		self

	def render$ prev, item, options
		let type = typeof item

		if type === 'undefined' or item === null
			while self.firstChild
				self.removeChild(self.firstChild)
			return

		elif type !== 'object'
			if prev and prev.replaceWith$
				return prev.replaceWith$(item)

			self.textContent = item

		elif item isa Node
			prev ? prev.replaceWith$(item,self) : item.insertInto$(self)

		return

	def schedule
		imba.scheduler.listen('render',self)
		#scheduled = yes
		@tick()

	def unschedule
		imba.scheduler.unlisten('render',self)
		#scheduled = no

	def insert$ item, bitflags, prev
		let type = typeof item

		if type === 'undefined' or item === null
			let el = document.createComment('')
			prev ? prev.replaceWith$(el) : el.insertInto$(this)
			return el

		# what if this is null or undefined -- add comment and return? Or blank text node?
		elif type !== 'object'
			let res
			let txt = item

			if (bitflags & $TAG_FIRST_CHILD$) && (bitflags & $TAG_LAST_CHILD$)
				# FIXME what if the previous one was not text? Possibly dangerous
				@textContent = txt
				return

			if prev
				if prev isa Text
					prev.textContent = txt
					return prev
				else
					res = document.createTextNode(txt)
					prev.replaceWith$(item,self)
					return res
			else
				@appendChild$(res = document.createTextNode(txt))
				return res	

		elif item isa Node
			prev ? prev.replaceWith$(item,self) : item.insertInto$(self)
			return item
		return

	def flag$ str
		@className = str
		return

	def flagIf$ flag, bool
		bool ? @classList.add(flag) : @classList.remove(flag)
		return

	def open$
		self

	def close$
		self

	def end$
		@render() if @render
		return

Element.prototype.appendChild$ = Element.prototype.appendChild
Element.prototype.insertBefore$ = Element.prototype.insertBefore
Element.prototype.replaceChild$ = Element.prototype.replaceChild$

extend class DocumentFragment
	
	def setup$
		#start = document.createComment('start')
		#end = document.createComment('end')
		#start.__fragment = this
		#end.__fragment = this

		#end.replaceWith$ = do |other|
			this.parentNode.insertBefore(other,this)
			return other

		@appendChild(#start)
		@appendChild(#end)

	def insert$ item, options, prev
		if #parentNode
			#parentNode.insert$(item,options,prev or #end)
		else
			Element.prototype.insert$.call(self,item,options,prev or #end)

	def text$ text
		self

	def replaceWith$ other
		#start.insertAdjacent$('beforebegin',other)
		var el = #start
		while el
			let next = el.nextSibling
			@appendChild(el)
			break if el == #end
			el = next
			
		return other

	def appendChild$ child
		#end.parentNode.insertBefore(child,#end)
		return child

	def removeChild$ child
		child.parentNode && child.parentNode.removeChild(child)
		self


class TagFragment

class BranchedTagFragment < TagFragment
	def initialize parent
		#parent = parent
		@array = []

	def push item, idx
		let toReplace = @array[idx]
		if item === toReplace
			return
		else
			@array[idx] = item
		self

	def close$ len
		let from = @length
		return if from == len
		let array = @array

		if from > len
			while from > len
				var item = array[--from]
				# what if this is a 
				@removeChild(item,from)
		elif len > from
			while len > from
				let node = array[from++]
				@appendChild(node,from - 1)
		@length = len
		return
		self


class KeyedTagFragment < TagFragment
	def initialize bitflags,parent
		@parent = parent
		@array = []
		@changes = Map.new
		@dirty = no
		@$ = {}

	def push item, idx
		let toReplace = @array[idx]

		if toReplace === item
			yes
		else
			@dirty = yes
			# if this is a new item
			let prevIndex = @array.indexOf(item)
			let changed = @changes.get(item)

			if prevIndex === -1
				# should we mark the one currently in slot as removed?
				@array.splice(idx,0,item)
				@appendChild(item,idx)

			elif prevIndex === idx + 1
				if toReplace
					@changes.set(toReplace,-1)
				@array.splice(idx,1)

			else
				@array.splice(prevIndex,1) if prevIndex >= 0
				@array.splice(idx,0,item)
				@appendChild(item,idx)

			if changed == -1
				@changes.delete(item)
		return

	def appendChild item, index
		if index > 0
			let other = @array[index - 1]
			# will fail with text nodes
			other.insertAdjacentElement('afterend',item)
		else
			@parent.insertAdjacentElement('afterbegin',item)
			# if there are no new items?
			# @parent.appendChild(item)
		return

	def removeChild item, index
		# @map.delete(item)
		if item.parentNode == @parent
			@parent.removeChild(item)
		return

	def end$ index
		if @dirty
			@changes.forEach do |pos,item|
				if pos == -1
					@removeChild(item)
			@changes.clear()
			@dirty = no

		# there are some items we should remove now
		if @array.length > index
			
			# remove the children below
			while @array.length > index
				let item = @array.pop()
				@removeChild(item)
			# @array.length = index
		return self

class IndexedTagFragment < TagFragment
	def initialize bitflags,parent
		@parent = parent
		@$ = []
		@length = 0

	def push item, idx
		return

	def end$ len
		let from = @length
		return if from == len
		let array = @$

		if from > len
			# items should have been added automatically
			while from > len
				var item = array[--from]
				@removeChild(item,from)
		elif len > from
			while len > from
				let node = array[from++]
				@appendChild(node,from - 1)
		@length = len
		return

	def insertInto parent, slot
		self

	def appendChild item, index
		# we know that these items are dom elements
		@parent.appendChild(item)
		return

	def removeChild item, index
		@parent.removeChild(item)
		return

# Create custom tag with support for scheduling and unscheduling etc
var ImbaElement = `class extends HTMLElement {
	constructor(){
		super();
		if(this.initialize) this.initialize();
		if(this.build) this.build();
	}
}`

var ImbaComponent = `class extends ImbaElement {
	
}`

extend class ImbaElement
	def connectedCallback
		unless #f
			# FIXME
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
root.customElements.define('imba-component',ImbaComponent)


def imba.createProxyProperty target
	var def getter
		target[0] ? target[0][target[1]] : undefined

	var def setter v
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
				@on$('change',[@change$],this) if @change$
				@on$('input',['capture',@input$],this) if @input$

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

