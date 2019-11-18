var Imba = require("../imba")

if $node$
	var serverDom = require './server'
	var Element = ImbaServerElement
	var document = ImbaServerDocument.new


var keyCodes = {
	esc: [27],
	tab: [9],
	enter: [13],
	space: [32],
	up: [38],
	down: [40],
	del: [8,46]
}

var el = Element.prototype

# add the modifiers to event instead of Element?
extend class Event
	def stopModifier e do e.stopPropagation() || true
	def preventModifier e do e.prevent() || true
	def silenceModifier e do e.silence() || true
	def bubbleModifier e do e.bubble(yes) || true
	def ctrlModifier e do e.event.ctrlKey == true
	def altModifier e do e.event.altKey == true
	def shiftModifier e do e.event.shiftKey == true
	def metaModifier e do e.event.metaKey == true
	def keyModifier key, e do e.keyCode ? (e.keyCode == key) : true
	def delModifier e do e.keyCode ? (e.keyCode == 8 or e.keyCode == 46) : true
	def selfModifier e do e.event.target == @dom
	def leftModifier e do e.button != undefined ? (e.button === 0) : el.keyModifier(37,e)
	def rightModifier e do e.button != undefined ? (e.button === 2) : el.keyModifier(39,e)
	def middleModifier e do e.button != undefined ? (e.button === 1) : true

# could cache similar event handlers with the same parts
class EventHandler
	def initialize params
		@params = params

	def getHandlerForMethod path, name
		for item,i in path
			if item[name]
				console.log "found handler",name,item
				return item
		return null

	def handleEvent event
		console.log "handling event!",event,@params

		var target = event.target
		var parts = @params
		var i = 0

		for part,i in @params
			let handler = part
			let args = [event]
			let checkSpecial = false

			if handler isa Array
				args = handler.slice(1)
				handler = handler[0]
				checkSpecial = yes

				for param,i in args
					# what about fully nested arrays and objects?
					if typeof param == 'string' && param[0] == '~' && param[1] == '$'
						let name = param.slice(2)
						if name == 'event'
							args[i] = event
						elif name == 'this'
							args[i] = @element
						else
							args[i] = event[name]

			# check if it is an array?
			if handler == 'stop'
				event.stopPropagation()

			elif handler == 'prevent'
				console.log "preventing default!"
				event.preventDefault()

			elif handler == 'ctrl'
				break unless event.ctrlKey
			elif handler == 'alt'
				break unless event.altKey
			elif handler == 'shift'
				break unless event.shiftKey
			elif handler == 'meta'
				break unless event.metaKey

			elif keyCodes[handler]
				unless keyCodes[handler].indexOf(event.keyCode) >= 0
					break

			elif typeof handler == 'string'
				let context = @getHandlerForMethod(event.path,handler)
				if context
					console.log "found context?!"
					let res = context[handler].apply(context,args)
		return



extend class Element

	def on$ type, parts
		console.log "add listener",type,parts
		var handler = EventHandler.new(parts)
		@addEventListener(type,handler)
		return handler

	def text$ item
		@textContent = item
		self

	def insert$ item, index, prev
		let type = typeof item

		if type !== 'object'
			let res
			let txt = item === undefined or item === null ? '' : item
			if index == -1
				@textContent = txt
			else
				@appendChild(res = document.createTextNode(txt))
				return res
		elif item isa Element
			@appendChild(item)
		return

	def flag$ str
		@className = str
		return

	def flagIf$ flag, bool
		bool ? @classList.add(flag) : @classList.remove(flag)
		return

	def render
		if self.template$
			self.template$()
		return

	def open$
		self

	def close$
		self

	def end$
		@render()
		return

def Imba.createElement name, parent, index, flags, text
	var type = name
	var el

	if name isa Function
		type = name
	else
		el = document.createElement(name)
		# console.log 'created element',name,el

	if el
		el.className = flags if flags
		el.text$(text) if text !== null

		if parent and index != null  and parent isa Element
			parent.insert$(el,index)
	return el

def Imba.createElementFactory ns
	return Imba.createElement unless ns

	return do |name,ctx,ref,pref|
		var node = Imba.createElement(name,ctx,ref,pref)
		node.dom.classList.add('_' + ns)
		return node

def Imba.createTagScope ns
	return TagScope.new(ns)

def Imba.createFragment type, parent, slot, options
	if type == 2
		return KeyedTagFragment.new(parent,slot,options)
	elif type == 1
		return IndexedTagFragment.new(parent,slot,options)

export class TagFragment
	
export class KeyedTagFragment < TagFragment
	def initialize parent, slot
		@parent = parent
		@slot = slot
		@$ = {} # this is the map
		@array = []
		@prev = []
		@index = 0
		@taglen = 0
		@starter = Imba.document.createComment('')
		@reconciled = no

	def reset
		@index = 0
		var curr = @array
		@array = @prev
		@prev = curr
		@prev.taglen = @taglen
		@index = 0

		return self

	def $iter
		@reset()

	def prune items
		return self

	def push item
		let prev = @prev[@index]
		@array[@index] = item
		@index++
		return

	def insertInto parent, index
		# console.log "inserting into!!",parent,index
		var fragment = Imba.document.createDocumentFragment()
		var i = 0
		var len = @index
		while i < len
			let item = @array[i++]
			fragment.appendChild(item.dom)

		parent.dom.appendChild(fragment)
		self

	def reconcile parent, siblings, index
		console.log "reconciling fragment!",self
		# reconcile this now?
		self

	get length
		@taglen

export class IndexedTagFragment < TagFragment
	def initialize parent, slot
		@parent = parent
		@$ = []
		@length = 0

	def push item, idx
		return

	def reconcile len
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

class TagScope
	def initialize ns
		@ns = ns
		@flags = ns ? ['_'+ns] : []

	def defineTag name, supr, &body
		var superklass = HTMLElement

		if supr isa String
			superklass = window.customElements.get(supr)
			console.log "get new superclass",supr,superklass

		var klass = `class extends superklass {

			constructor(){
				super();
				if(this.initialize) this.initialize();
			}

			}`
		if body
			body(klass)

		if klass.prototype.$mount
			klass.prototype.connectedCallback = klass.prototype.$mount

		if klass.prototype.$unmount
			klass.prototype.disconnectedCallback = klass.prototype.$unmount

		window.customElements.define(name,klass)
		return klass
		# return Imba.TAGS.defineTag({scope: self},name,supr,body)

	def extendTag name, body
		return Imba.TAGS.extendTag({scope: self},name,body)
