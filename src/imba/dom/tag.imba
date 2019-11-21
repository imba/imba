var Imba = require("../imba")

if $node$
	var serverDom = require './server'
	var Element = ImbaServerElement
	var document = ImbaServerDocument.new

def Imba.mount element, parent
	(parent || document.body).appendChild(element)

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
	def initialize params,closure,file
		@params = params
		@closure = closure
		@file = file

	def getHandlerForMethod path, name
		if @closure && @closure[name]
			return @closure
		if @file && @file[name]
			return @file
		for item,i in path
			if item[name]
				return item
		return null

	def handleEvent event
		var target = event.target
		var parts = @params
		var i = 0

		for part,i in @params
			let handler = part
			let args = [event]

			if handler isa Array
				args = handler.slice(1)
				handler = handler[0]

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
				let context = @getHandlerForMethod(event.path,handler)
				if context
					# console.log "found context?!"
					let res = context[handler].apply(context,args)

		Imba.commit()
		return


extend class Element

	def on$ type, parts, scope, file
		var handler = EventHandler.new(parts,scope,file)
		@addEventListener(type,handler)
		return handler

	def text$ item
		@textContent = item
		self

	def schedule
		Imba.scheduled.add(self)

	def unschedule
		Imba.scheduled.remove(self)

	def insert$ item, index, prev
		let type = typeof item

		if type === 'undefined' or item === null
			let el = document.createComment('')
			prev ? @replaceChild(el,prev) : @appendChild(el)
			return el

		# what if this is null or undefined -- add comment and return? Or blank text node?
		elif type !== 'object'
			let res
			let txt = item

			if index == -1
				@textContent = txt
				return

			if prev
				if prev isa Text
					prev.textContent = txt
					return prev
				else
					res = document.createTextNode(txt)
					@replaceChild(res,prev)
					return res
			else
				@appendChild(res = document.createTextNode(txt))
				return res

		elif item isa Element
			# if we are the only child we want to replace it?
			prev ? @replaceChild(item,prev) : @appendChild(item)
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
		@array = []
		@remove = Set.new
		@map = WeakMap.new

		@$ = {}

	def push item, idx
		let toReplace = @array[idx]

		# console.log("push dom item",item,idx,item.innerHTML,toReplace && toReplace.innerHTML,toReplace === item)

		# do nothing
		if toReplace === item
			yes
		else
			let prevIndex = @map.get(item)

			if prevIndex === undefined
				# this is a new item
				console.log "added item"
				@array.splice(idx,0,item)
				@appendChild(item,idx)
			elif true
				# console.log("moving item?!",idx,prevIndex,item)
				let prev = @array.indexOf(item)
				@array.splice(prev,1) if prev >= 0
				@array.splice(idx,0,item)
				@appendChild(item,idx)


			elif prevIndex < idx
				# this already existed earlier in the list
				# no need to do anything?
				@map.set(item,idx)

			elif prevIndex > idx
				# was further ahead
				@array.splice(prevIndex,1)
				@appendChild(item,idx)
				@array.splice(idx,0,item)

			# if @remove.has(item)
			# 	@remove.delete(item)

			# this is a new item to be inserted
			# if prevIndex == -1
			# 	console.log 'was not in loop before',item,idx
			# 	@array.splice(idx,0,item)
			# 	@appendChild(item,idx)

			# elif lastIndex == idx + 1
			# 	# console.log 'was originally one step ahead'
			# 	@array.splice(idx,1) # just remove the previous slot?
			# 	# mark previous index of previous item?
			# else
			# 	@array[idx] = item
			# 	@appendChild(item,idx)
			# 	@remove.add(prev) if prev

			# mark previous element as something to remove?
			# if prev is now further ahead - dont care?
			
		return

	def appendChild item, index
		# we know that these items are dom elements
		# console.log "append child",item,index
		@map.set(item,index)

		if index > 0
			let other = @array[index - 1]
			other.insertAdjacentElement('afterend',item)
		else
			@parent.insertAdjacentElement('afterbegin',item)
			# if there are no new items?
			# @parent.appendChild(item)
		return

	def removeChild item, index
		@map.delete(item)
		if item.parentNode == @parent
			@parent.removeChild(item)

		return

	def open$
		return self

	def close$ index
		if @remove.size
			# console.log('remove items from keyed tag',@remove.entries())
			@remove.forEach do |item| @removeChild(item)
			@remove.clear()

		# there are some items we should remove now
		if @array.length > index
			# remove the children below
			while @array.length > index
				let item = @array.pop()
				# console.log("remove child",item.data.id)
				@removeChild(item)
			# @array.length = index
		return self

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

# Create custom tag with support for scheduling and unscheduling etc
var TagComponent = `class extends HTMLElement { }`
extend class TagComponent
	def connectedCallback
		this.mount()

	def disconnectedCallback
		this.unmount()

	def mount
		this.schedule()

	def unmount
		this.unschedule()

	def tick
		this.render && this.render()

if $web$
	window.customElements.define('imba-component',TagComponent)

# TagComponent.prototype.mount = do this.schedule()
# TagComponent.prototype.unmount = do this.unschedule()
# TagComponent.prototype.tick = do this.render && this.render()

class TagScope
	def initialize ns
		@ns = ns
		@flags = ns ? ['_'+ns] : []

	def defineTag name, supr, &body
		var superklass = HTMLElement

		if supr isa String
			if supr == 'component'
				supr = 'imba-component'

			superklass = window.customElements.get(supr)

		var klass = `class extends superklass {

			constructor(){
				super();
				if(this.initialize) this.initialize();
			}

			}`
		if body
			body(klass)

		var proto = klass.prototype

		if proto.mount
			proto.connectedCallback ||= do this.mount()

		if proto.unmount
			proto.disconnectedCallback ||= do this.unmount()
			# proto.unmount

		window.customElements.define(name,klass)
		return klass
		# return Imba.TAGS.defineTag({scope: self},name,supr,body)

	def extendTag name, body
		return Imba.TAGS.extendTag({scope: self},name,body)
