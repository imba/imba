var doc = document
var win = window

var hasTouchEvents = window && window:ontouchstart !== undefined # .hasOwnProperty('ontouchstart')

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
		event = {x: 0, y: 0, type: 'uninitialized'}
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
		var e0 = prevEvent
		var e1 = event

		if dirty
			prevEvent = e1
			dirty = no
			# button should only change on mousedown etc
			if e1:type == 'mousedown'
				button = e1:button
				touch = Imba.Touch.new(e1,self)
				touch.mousedown(e1,e1)
			elif e1:type == 'mousemove'
				touch.mousemove(e1,e1) if touch
			elif e1:type == 'mouseup'
				button = -1
				touch.mouseup(e1,e1) if touch
				touch = null # reuse?
				# trigger pointerup
		else
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

var lastNativeTouchTimeStamp = 0
var lastNativeTouchTimeout = 50

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

		# e.preventDefault
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

	def self.onmousedown e
		self

	def self.onmousemove e
		self

	def self.onmouseup e
		self

	prop phase
	prop active
	prop event
	prop pointer
	prop target # if 'safe' we can cache multiple uses
	prop handler
	prop updates
	prop suppress
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
		@suppress = no
		bubble = no
		pointer = ptr
		updates = 0

	def preventDefault
		@preventDefault = yes
		event and event.preventDefault
		# pointer.event.preventDefault
		self

	def extend gesture
		# console.log "added gesture!!!"
		@gestures ||= []
		@gestures.push(gesture)
		self

	def redirect target
		@redirect = target
		self

	def suppress
		# collision with the suppress property
		@active = no
		self

	def touchstart e,t
		# console.log 'native ontouchstart',e,t
		@event = e
		@touch = t
		@x = t:clientX
		@y = t:clientY
		began
		e.preventDefault if e and @suppress
		self

	def touchmove e,t
		# console.log 'native ontouchmove',e,t
		@event = e
		@x = t:clientX
		@y = t:clientY
		update
		e.preventDefault if e and @suppress
		self

	def touchend e,t
		# console.log 'native ontouchend',e,t,e:timeStamp
		@event = e
		# log "touchend"
		@x = t:clientX
		@y = t:clientY
		ended

		lastNativeTouchTimeStamp = e:timeStamp

		if @maxdr < 20
			var tap = Imba.Event.new(e)
			tap.type = 'tap'
			tap.process
			e.preventDefault if tap.@responder	

		if e and @suppress
			e.preventDefault

		self

	def touchcancel e,t
		# log "touchcancel"
		self


	def mousedown e,t
		# log "mousedown"
		@x = t:clientX
		@y = t:clientY
		began

		@mousemove = (|e| mousemove(e,e) )
		doc.addEventListener('mousemove',@mousemove,yes)
		# inside here -- start tracking mousemove directly

		self

	def mousemove e,t
		@x = t:clientX
		@y = t:clientY
		@event = e
		e.preventDefault if @suppress
		update
		move
		self

	def mouseup e,t
		@x = t:clientX
		@y = t:clientY
		ended
		doc.removeEventListener('mousemove',@mousemove,yes)
		@mousemove = null
		self

	def idle
		update

	def began
		@maxdr = @dr = 0
		@x0 = @x
		@y0 = @y

		var e = event
		# var ptr = pointer
		var dom = event:target
		var node = null

		@sourceTarget = dom and tag(dom)

		while dom
			node = tag(dom)
			if node && node:ontouchstart
				@bubble = no
				target = node
				target.ontouchstart(self)
				break unless @bubble
			dom = dom:parentNode

		@updates++
		self

	def update
		return self unless @active

		var dr = Math.sqrt(dx*dx + dy*dy)
		@maxdr = dr if dr > @dr
		@dr = dr

		# catching a touch-redirect?!?
		if @redirect
			if @target and @target:ontouchcancel
				@target.ontouchcancel(self)
			target = @redirect
			@redirect = null
			target.ontouchstart(self) if target:ontouchstart


		@updates++
		if @gestures
			g.ontouchupdate(self) for g in @gestures

		target.ontouchupdate(self) if target and target:ontouchupdate
		self

	def move
		return self unless @active

		if @gestures
			for g in @gestures
				g.ontouchmove(self,@event) if g:ontouchmove

		target.ontouchmove(self,@event) if target and target:ontouchmove
		self

	def ended
		return self unless @active

		@updates++

		if @gestures
			g.ontouchend(self) for g in @gestures

		target.ontouchend(self) if target and target:ontouchend

		self

	def cancelled
		self

	def dr do @dr
	def dx do @x - @x0
	def dy do @y - @y0
	def x do @x
	def y do @y

	def button do @pointer ? @pointer.button : 0

	def sourceTarget
		@sourceTarget


class Imba.TouchGesture

	prop active default: no

	def ontouchstart e
		self

	def ontouchupdate e
		self

	def ontouchend e
		self


# A Touch-event is created on mousedown (always)
# and while it exists, mousemove and mouseup will
# be delegated to this active event.
Imba.POINTER = Imba.Pointer.new
Imba.POINTERS = [Imba.POINTER]


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

###
Imba handles all events in the dom through a single manager,
listening at the root of your document. If Imba finds a tag
that listens to a certain event, the event will be wrapped 
in an `Imba.Event`, which normalizes some of the quirks and 
browser differences.
###
class Imba.Event

	### reference to the native event ###
	prop event

	### reference to the native event ###
	prop prefix

	prop data

	###
	should remove this alltogether?
	@deprecated
	###
	prop source

	### A {Boolean} indicating whether the event bubbles up or not ###
	prop bubble type: Boolean, chainable: yes

	def self.wrap e
		self.new(e)
	
	def initialize e
		event = e
		bubble = yes

	def type= type
		@type = type
		self

	###
	@returns {String} The name of the event (case-insensitive)
	###
	def type
		@type || event:type

	def name
		@name ||= type.toLowerCase.replace(/\:/g,'')

	# mimc getset
	def bubble v
		if v != undefined
			self.bubble = v
			return self
		return @bubble

	###
	Prevents further propagation of the current event.

	@returns {Imba.Event} The instance on which this method was called
	###
	def halt
		bubble = no
		self

	###
	Cancel the event (if cancelable). In the case of native events it
	will call `preventDefault` on the wrapped event object.

	@returns {Imba.Event} The instance on which this method was called
	###
	def cancel
		event.preventDefault if event:preventDefault
		@cancel = yes
		self

	###
	Indicates whether or not event.cancel has been called.

	@returns {Boolean}
	###
	def isPrevented
		event and event:defaultPrevented or @cancel

	###
	A reference to the initial target of the event.
	###
	def target
		tag(event:_target or event:target)

	###
	A reference to the object responding to the event.
	###
	def responder
		@responder

	###
	Redirect the event to new target
	###
	def redirect node
		@redirect = node
		self

	###
	@return {String} normalized character for KeyboardEvent/TextEvent
	###
	def keychar
		if event isa TextEvent
			return event:data

		if event isa KeyboardEvent
			var ki = event:keyIdentifier
			var sym = Imba.KEYMAP[event:keyCode]

			# p 'keysym!',ki,sym

			if !sym and ki.substr(0,2) == "U+"
				sym = String.fromCharCode(parseInt(ki.substr(2), 16))
			return sym

		return null

	###
	@deprecated
	###
	def keycombo
		return unless var sym = keychar
		sym = Imba.CHARMAP[sym] or sym
		var combo = [], e = event
		combo.push(:ctrl) if e:ctrlKey
		combo.push(:shift) if e:shiftKey
		combo.push(:alt) if e:altKey
		combo.push(:cmd) if e:metaKey
		combo.push(sym)
		combo.join("_").toLowerCase


	def process
		var meth = "on{@prefix or ''}{name}"
		var args = null
		var domtarget = event:_target or event:target		
		# var node = <{domtarget:_responder or domtarget}>
		# need to clean up and document this behaviour
		var domnode = domtarget:_responder or domtarget
		var rerouter = null
		var rerouted = no

		# need to stop infinite redirect-rules here??!?

		while domnode
			@redirect = null
			if var node = tag(domnode) # not only tag 

				if node[meth] isa String
					# should remember the receiver of the event
					meth = node[meth]
					continue

				if node[meth] isa Array
					args = node[meth].concat(node)
					meth = args.shift
					continue

				if node[meth] isa Function
					@responder ||= node
					# should autostop bubble here?
					var res = args ? node[meth].apply(node,args) : node[meth](self,data)
					
			# add node.nextEventResponder as a separate method here?
			unless bubble and domnode = (@redirect or (node ? node.parent : domnode:parentNode))
				break

		processed
		return self


	def processed
		Imba.emit(Imba,'event',[self])
		self

	###
	Return the x/left coordinate of the mouse / pointer for this event
	@return {Number} x coordinate of mouse / pointer for event
	###
	def x do event:x

	###
	Return the y/top coordinate of the mouse / pointer for this event
	@return {Number} y coordinate of mouse / pointer for event
	###
	def y do event:y

	###
	Returns a Number representing a system and implementation
	dependent numeric code identifying the unmodified value of the
	pressed key; this is usually the same as keyCode.

	For mouse-events, the returned value indicates which button was
	pressed on the mouse to trigger the event.

	@return {Number}
	###
	def which do event:which

class Imba.EventManager

	prop root
	prop count
	prop enabled default: no, watch: yes
	prop listeners
	prop delegators
	prop delegator

	def enabled-did-set bool
		bool ? onenable : ondisable
		self

	def initialize node, events: []
		root = node
		count = 0
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
		count++
		var event = Imba.Event.wrap(e)
		event.process
		self

	def create type, target, data: null, source: null
		var event = Imba.Event.wrap type: type, target: target
		event.data = data if data
		event.source = source if source
		event

	# use create instead?
	def trigger
		create(*arguments).process

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
		

ED = Imba.Events = Imba.EventManager.new(document, events: [
	:keydown,:keyup,:keypress,:textInput,:input,:change,:submit,
	:focusin,:focusout,:blur,:contextmenu,:dblclick,
	:mousewheel,:wheel
])

# should set these up inside the Imba.Events object itself
# so that we can have different EventManager for different roots

if hasTouchEvents
	Imba.Events.listen(:touchstart) do |e|
		Imba.Events.count++
		Imba.Touch.ontouchstart(e)

	Imba.Events.listen(:touchmove) do |e|
		Imba.Events.count++
		Imba.Touch.ontouchmove(e)

	Imba.Events.listen(:touchend) do |e|
		Imba.Events.count++
		Imba.Touch.ontouchend(e)

	Imba.Events.listen(:touchcancel) do |e|
		Imba.Events.count++
		Imba.Touch.ontouchcancel(e)

Imba.Events.register(:click) do |e|

	if (e:timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout
		var tap = Imba.Event.new(e)
		tap.type = 'tap'
		tap.process
		if tap.@responder
			return e.preventDefault
	# delegate the real click event
	Imba.Events.delegate(e)

Imba.Events.listen(:mousedown) do |e|
	if (e:timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout
		Imba.POINTER.update(e).process if Imba.POINTER

# Imba.Events.listen(:mousemove) do |e|
# 	# console.log 'mousemove',e:timeStamp
# 	if (e:timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout
# 		Imba.POINTER.update(e).process if Imba.POINTER # .process if touch # should not happen? We process through 

Imba.Events.listen(:mouseup) do |e|
	# console.log 'mouseup',e:timeStamp
	if (e:timeStamp - lastNativeTouchTimeStamp) > lastNativeTouchTimeout
		Imba.POINTER.update(e).process if Imba.POINTER


Imba.Events.register([:mousedown,:mouseup])
Imba.Events.enabled = yes