
extern window, document


var doc = global:document
var win = global:window

# hmm -- this is probably wrong
var hasTouchEvents = win && win:ontouchstart !== undefined # .hasOwnProperty('ontouchstart')


# Ringbuffer for events?

class Imba.RingBuffer

	prop head

	def initialize len = 10
		@array  = []
		@keep = len
		@head = 0
		self

	def push obj
		var i = @head++
		@array[i % @keep] = obj
		i

	def last
		@array[@head % @keep]

# button-states. Normalize ringbuffer to contain reuseable
# normalized events?

# really more like a pointer?
class Imba.Pointer

	# began, moved, stationary, ended, cancelled
	prop phase # change: update
	prop prevEvent
	prop button
	prop event
	prop dirty
	prop events
	prop touch

	def initialize
		button = -1
		events = Imba.RingBuffer.new(10)
		self

	def update e
		# console.log(e)
		event = e
		# normalize the event / touch?
		events.push(e)
		dirty = yes
		self

	# this is just for regular mouse now
	def process
		var phase = phase
		var e0,e1 = prevEvent,event

		if dirty
			prevEvent = e1
			dirty = no
			# button should only change on mousedown etc
			if e1:type == 'mousedown'
				# this is correct when we know it is a mousedown(!)
				button = e1:button
				# console.log('button-state changed!!!',button)
				touch = Imba.Touch.new(e1,self)
				touch.mousedown(e1,e1)
				# trigger pointerdown
			elif e1:type == 'mousemove'
				touch.mousemove(e1,e1) if touch

			elif e1:type == 'mouseup'
				# console.log('mouseup!!!')
				button = -1
				# console.log('button-state changed!!!',button)
				touch.mouseup(e1,e1) if touch
				touch = nil # reuse?
				# trigger pointerup

			# if !e0 || e0:button != e1:button
			# 	console.log('button-state changed!!!',e0,e1)
			# see if button has transitioned?
			# console.log e:type
		else
			# set type to stationary?
			# update always?
			touch.idle if touch
		

		self

	def emit name, target, bubble: yes
		yes
		
		
	def cleanup
		Imba.POINTERS

	def x do event:x
	def y do event:y

	def self.update 
		# console.log('update touch')
		for ptr,i in Imba.POINTERS
			ptr.process
		# need to be able to prevent the default behaviour of touch, no?
		win.requestAnimationFrame(Imba.Pointer:update)

		self


# Imba.Touch
# Began	A finger touched the screen.
# Moved	A finger moved on the screen.
# Stationary	A finger is touching the screen but hasn't moved.
# Ended	A finger was lifted from the screen. This is the final phase of a touch.
# Canceled The system cancelled tracking for the touch.
class Imba.Touch

	var multi = yes
	var touches = []
	var count = 0
	var identifiers = {}

	def self.count
		count

	def self.lookup item
		# return touch if var touch = item:__touch__
		return item and (item:__touch__ or identifiers[item:identifier])
		# look for lookup
		# var id = item:identifier
		# if id != undefined and (touch = IMBA_TOUCH_IDENTIFIERS{id})
		# 	return touch 

	def self.release item,touch
		delete identifiers[item:identifier]
		delete item:__touch__
		return

	def self.ontouchstart e
		log "ontouchstart",e
		for t in e:changedTouches
			continue if lookup(t)
			var touch = identifiers[t:identifier] = self.new(e) # (e)
			t:__touch__ = touch
			touches.push(touch)
			count++
			touch.touchstart(e,t)
		self

	def self.ontouchmove e
		for t in e:changedTouches
			if var touch = lookup(t)
				touch.touchmove(e,t)

		self

	def self.ontouchend e
		for t in e:changedTouches
			if var touch = lookup(t)
				touch.touchend(e,t)
				release(t,touch)
				count--
				# not always supported!
				# touches = touches.filter(||)
		self

	def self.ontouchcancel e
		for t in e:changedTouches
			if var touch = lookup(t)
				touch.touchcancel(e,t)
				release(t,touch)
				count--
		self



	prop phase
	prop active
	prop event
	prop pointer
	prop target # if 'safe' we can cache multiple uses
	prop handler
	prop updates
	prop data
	prop bubble chainable: yes

	prop gestures
	# prop preventDefault

	prop x0
	prop y0

	# duration etc -- important

	def initialize e, ptr
		# @native  = false
		event = e
		data = {}
		active = yes
		bubble = no
		pointer = ptr
		updates = 0

	def preventDefault
		event and event.preventDefault
		# pointer.event.preventDefault
		self

	def extend gesture
		# console.log "added gesture!!!"
		@gestures ||= []
		@gestures.push(gesture) # hmmm
		self

	def redirect target
		@redirect = target
		self

	def suppress
		@active = no
		self

	def touchstart e,t
		@touch = t
		@x = t:clientX
		@y = t:clientY
		began
		self

	def touchmove e,t
		@x = t:clientX
		@y = t:clientY
		update
		self

	def touchend e,t
		# log "touchend"
		@x = t:clientX
		@y = t:clientY
		ended
		self

	def touchcancel e,t
		# log "touchcancel"
		self


	def mousedown e,t
		# log "mousedown"
		@x = t:clientX
		@y = t:clientY
		began
		self

	def mousemove e,t
		# log "mousemove"
		@x = t:clientX
		@y = t:clientY
		update
		self

	def mouseup e,t
		# log "mousemove"
		@x = t:clientX
		@y = t:clientY
		ended
		self

	def idle
		update

	def began
		# console.log "begaN??"
		@x0 = @x
		@y0 = @y

		var e = event
		# var ptr = pointer # hmmm
		var dom = event:target
		var node = nil
		# need to find the 
		while dom
			node = tag(dom)
			if node && node:ontouchstart
				@bubble = no
				target = node
				target.ontouchstart(self)
				console.log "hello?!?!?"
				break unless @bubble
			dom = dom:parentNode

		# console.log('target??',target)
		@updates++
		# if target
		# 	target.ontouchstart(self)
		# 	# ptr.event.preventDefault unless @native
		# 	# prevent default?

		#  = e:clientX
		#  = e:clientY
		self

	def update
		return self unless @active
		# catching a touch-redirect?!?
		if @redirect
			if @target and @target:ontouchcancel
				@target.ontouchcancel(self)
			target = @redirect
			@redirect = nil
			target.ontouchstart(self) if target:ontouchstart


		@updates++
		if @gestures
			g.ontouchupdate(self) for g in @gestures

		target.ontouchupdate(self) if target and target:ontouchupdate
		self

	def ended
		return self unless @active

		@updates++

		if @gestures
			g.ontouchend(self) for g in @gestures

		target.ontouchend(self) if target and target:ontouchend

		# simulate tap -- need to be careful about this(!)
		# must look at timing and movement(!)
		if @touch
			ED.trigger('tap',event:target)
		self

	def cancelled
		self

	def dx
		@x - @x0
		# pointer.x - @x0

	def dy
		@y - @y0
		# pointer.y - @y0
	
	def x do @x # pointer.x
	def y do @y # pointer.y

	def button do @pointer ? @pointer.button : 0 # hmmmm


class Imba.TouchGesture

	prop active default: no

	def ontouchstart e
		self

	def ontouchupdate e
		self

	def ontouchend e
		self
		
		

# should be possible
# def Imba.Pointer.update


# A Touch-event is created on mousedown (always)
# and while it exists, mousemove and mouseup will
# be delegated to this active event.
Imba.POINTER = Imba.Pointer.new
Imba.POINTERS = [Imba.POINTER]

	
Imba.Pointer.update



# regular event stuff
Imba.KEYMAP = {
	"8": 'backspace'
	"9": 'tab'
	"13": 'enter'
	"16": 'shift'
	"17": 'ctrl'
	"18": 'alt'
	"19": 'break'
	"20": 'caps'
	"27": 'esc'
	"32": 'space'
	"35": 'end'
	"36": 'home'
	"37": 'larr'
	"38": 'uarr'
	"39": 'rarr'
	"40": 'darr'
	"45": 'insert'
	"46": 'delete'
	"107": 'plus'
	"106": 'mult'
	"91": 'meta'
}

Imba.CHARMAP = {
	"%": 'modulo'
	"*": 'multiply'
	"+": 'add'
	"-": 'sub'
	"/": 'divide'
	".": 'dot'
}


class Imba.Event

	prop event
	prop target
	prop prefix
	prop data
	prop source
	prop bubble # getset: yes

	def self.wrap e
		self.new(e)
	
	def initialize e
		event = e
		bubble = yes

	def name
		event:type.toLowerCase.replace(/\:/g,'')

	# mimc getset
	def bubble v
		if v != undefined
			self.bubble = v
			return self
		return @bubble

	def halt
		bubble = no
		self

	def cancel
		event.preventDefault if event:preventDefault
		self

	def target
		tag(event:_target or event:target)

	def redirect node
		@redirect = node
		self

	def keychar
		if event isa TextEvent
			return event:data

		if event isa KeyboardEvent
			var ki = event:keyIdentifier
			var sym = Imba.KEYMAP[event:keyCode]

			# p 'keysym!',ki,sym

			if !sym and ki.substr(0,2) == "U+"
				sym = String.fromCharCode(global.parseInt(ki.substr(2), 16))
			return sym

		return nil

	def keycombo
		return unless var sym = keychar
		sym = Imba.CHARMAP[sym] or sym
		var combo = []
		combo.push(:ctrl) if event:ctrlKey
		combo.push(:shift) if event:shiftKey
		combo.push(:alt) if event:altKey
		combo.push(:cmd) if event:metaKey
		combo.push(sym)
		return combo.join("_").toLowerCase

	def process
		var meth = "on{@prefix or ''}{name}"
		var domtarget = event:_target or event:target		
		# var node = <{domtarget:_responder or domtarget}> # hmm

		var domnode = domtarget:_responder or domtarget
		# need to stop infinite redirect-rules here??!?
		while domnode
			@redirect = nil
			var node = tag(domnode)
			if node and node[meth] isa Function
				node[meth](self,data)
			# log "hit?",domnode
			break unless bubble and domnode = (@redirect or (node ? node.parent : domnode:parentNode))

		return self

	def x do event:x
	def y do event:y


class Imba.EventManager

	prop root
	prop enabled default: no, watch: yes
	prop listeners
	prop delegators
	prop delegator

	def enabled-did-set bool
		bool ? onenable : ondisable
		self


	def initialize node, events: []
		root = node
		listeners = []
		delegators = {}
		delegator = do |e| 
			# console.log "delegating event?! {e}"
			delegate(e)
			return true

		for event in events
			register(event)
		self

	def register name, handler = true
		if name isa Array
			register(v,handler) for v in name
			return self

		return self if delegators[name]
		# console.log("register for event {name}")
		var fn = delegators[name] = handler isa Function ? handler : delegator
		root.addEventListener(name,fn,yes) if enabled

	def listen name, handler, capture = yes
		listeners.push([name,handler,capture])
		root.addEventListener(name,handler,capture) if enabled
		self

	def delegate e
		# console.log "delegate event {e and e:type}"
		# really? wrap all events? Quite expensive unless we reuse them
		var event = Imba.Event.wrap(e)
		# console.log "delegate event {e:type}"
		event.process
		# name = e:type.toLowerCase.replace(/\:/g,'')
		# create our own event here?
		self

	def create type, target, data: nil, source: nil
		var event = Imba.Event.wrap type: type, target: target
		event.data = data if data
		event.source = source if source
		event

	# use create instead?
	def trigger type, target, data: nil, source: nil
		var event = Imba.Event.wrap type: type, target: target
		event.data = data if data
		event.source = source if source
		event.process

	def emit obj, event, data, dom: yes, ns: 'object' 
		# log "emit event for",obj,event,data
		var fn = "on{ns}"
		var nodes = DOC:querySelectorAll(".{obj.uid}")
		for node in nodes
			# log "found node {node:className}"
			if node.@tag and node.@tag[fn]
				node.@tag[fn](event,data)
			# now we simply link to onobject event
		self

	def onenable
		for own name,handler of delegators
			root.addEventListener(name,handler,yes)

		for item in listeners
			root.addEventListener(item[0],item[1],item[2])
		self

	def ondisable
		for own name,handler of delegators
			root.removeEventListener(name,handler,yes)

		for item in listeners
			root.removeEventListener(item[0],item[1],item[2])
		self
		


ED = Imba.EventManager.new(document, events: [
	:keydown,:keyup,:keypress,:textInput,:input,
	:focusin,:focusout,:contextmenu,:submit,
	:mousedown,:mouseup
])


# ED.listen(:click) do |e|
# 	# console.log('onclick',e)
# 	ED.trigger('tap',e:target)


if hasTouchEvents
	ED.listen(:touchstart) do |e| Imba.Touch.ontouchstart(e)
	ED.listen(:touchmove) do |e| Imba.Touch.ontouchmove(e)
	ED.listen(:touchend) do |e| Imba.Touch.ontouchend(e)
	ED.listen(:touchcancel) do |e| Imba.Touch.ontouchcancel(e)
else
	# ...
	ED.listen(:click) do |e|
		# console.log('onclick',e)
		ED.trigger('tap',e:target)


	ED.listen(:mousedown) do |e|
		Imba.POINTER.update(e).process if Imba.POINTER

	ED.listen(:mousemove) do |e|
		Imba.POINTER.update(e) if Imba.POINTER # .process if touch # should not happen? We process through 

	ED.listen(:mouseup) do |e|
		Imba.POINTER.update(e).process if Imba.POINTER


# console.log "Imba touches",hasTouchEvents

# set up the events for touches

# var onmousedown = do |e|
# 
# doc.addEventListener("mousedown",)
# 
# var onmousedown = do |e|
# 	console.log('mousedown',e)
# 	# var touch = Imba.Pointer.new
# 	# a single pointer -- update
# 	var touch = Imba.POINTER
# 	touch.update(e).process if touch
# 	# Imba.POINTERS.push(touch) # Should this not always be active?
# 	# touch
# 
# def doc.onmousemove e
# 	var touch = Imba.POINTER
# 	touch.update(e) if touch
# 
# def doc.onmouseup e
# 	console.log('mouseup',e)
# 	var touch = Imba.POINTER
# 	touch.update(e).process if touch
# 	# should reuse pointers?
# 	# Imba.POINTERS = []
# 
# def doc.onclick e
# 	console.log('onclick',e)
# 	ED.trigger('tap',e:target)
# 	# should reuse pointers?
# 	# Imba.POINTERS = []

# register some basic events

# [:keydown,:keyup,:keypress,:textInput,:input].forEach do |e| ED.register(e)
# [:focusin,:focusout,:contextmenu,:submit].forEach do |e| ED.register(e)

# Now setup the the other event-delegators
# Possibly wrap events in our own for convenience instead of extending regular event




