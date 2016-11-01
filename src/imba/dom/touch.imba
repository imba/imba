# Imba.Touch
# Began	A finger touched the screen.
# Moved	A finger moved on the screen.
# Stationary	A finger is touching the screen but hasn't moved.
# Ended	A finger was lifted from the screen. This is the final phase of a touch.
# Canceled The system cancelled tracking for the touch.

###
Consolidates mouse and touch events. Touch objects persist across a touch,
from touchstart until end/cancel. When a touch starts, it will traverse
down from the innermost target, until it finds a node that responds to
ontouchstart. Unless the touch is explicitly redirected, the touch will
call ontouchmove and ontouchend / ontouchcancel on the responder when appropriate.

	tag draggable
		# called when a touch starts
		def ontouchstart touch
			flag 'dragging'
			self
		
		# called when touch moves - same touch object
		def ontouchmove touch
			# move the node with touch
			css top: touch.dy, left: touch.dx
		
		# called when touch ends
		def ontouchend touch
			unflag 'dragging'

@iname touch
###
class Imba.Touch
	self.LastTimestamp = 0
	self.TapTimeout = 50

	# var lastNativeTouchTimeout = 50

	var touches = []
	var count = 0
	var identifiers = {}

	def self.count
		count

	def self.lookup item
		return item and (item:__touch__ or identifiers[item:identifier])

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
	prop target
	prop handler
	prop updates
	prop suppress
	prop data
	prop bubble chainable: yes
	prop timestamp

	prop gestures

	###
	@internal
	@constructor
	###
	def initialize event, pointer
		# @native  = false
		self.event = event
		data = {}
		active = yes
		@button = event and event:button or 0
		@suppress = no # deprecated
		@captured = no
		bubble = no
		pointer = pointer
		updates = 0
		return self

	def capture
		@captured = yes
		@event and @event.stopPropagation
		unless @selblocker
			@selblocker = do |e| e.preventDefault
			Imba.document.addEventListener('selectstart',@selblocker,yes)
		self

	def isCaptured
		!!@captured

	###
	Extend the touch with a plugin / gesture. 
	All events (touchstart,move etc) for the touch
	will be triggered on the plugins in the order they
	are added.
	###
	def extend plugin
		# console.log "added gesture!!!"
		@gestures ||= []
		@gestures.push(plugin)
		self

	###
	Redirect touch to specified target. ontouchstart will always be
	called on the new target.
	@return {Number}
	###
	def redirect target
		@redirect = target
		self

	###
	Suppress the default behaviour. Will call preventDefault for
	all native events that are part of the touch.
	###
	def suppress
		# collision with the suppress property
		@active = no
		
		self

	def suppress= value
		console.warn 'Imba.Touch#suppress= is deprecated'
		@supress = value
		self

	def touchstart e,t
		@event = e
		@touch = t
		@button = 0
		@x = t:clientX
		@y = t:clientY
		began
		update
		e.preventDefault if e and isCaptured
		self

	def touchmove e,t
		@event = e
		@x = t:clientX
		@y = t:clientY
		update
		e.preventDefault if e and isCaptured
		self

	def touchend e,t
		@event = e
		@x = t:clientX
		@y = t:clientY
		ended

		Imba.Touch.LastTimestamp = e:timeStamp

		if @maxdr < 20
			var tap = Imba.Event.new(e)
			tap.type = 'tap'
			tap.process
			e.preventDefault if tap.@responder	

		if e and isCaptured
			e.preventDefault

		self

	def touchcancel e,t
		cancel

	def mousedown e,t
		@event = e
		@button = e:button
		@x = t:clientX
		@y = t:clientY
		began
		update
		@mousemove = (|e| mousemove(e,e) )
		Imba.document.addEventListener('mousemove',@mousemove,yes)
		self

	def mousemove e,t
		@x = t:clientX
		@y = t:clientY
		@event = e
		e.preventDefault if isCaptured
		update
		move
		self

	def mouseup e,t
		@x = t:clientX
		@y = t:clientY
		ended
		self

	def idle
		update

	def began
		@timestamp = Date.now
		@maxdr = @dr = 0
		@x0 = @x
		@y0 = @y

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
		return self if !@active or @cancelled

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
			return update if @redirect # possibly redirecting again


		@updates++
		if @gestures
			g.ontouchupdate(self) for g in @gestures

		target?.ontouchupdate(self)
		update if @redirect
		self

	def move
		return self if !@active or @cancelled

		if @gestures
			for g in @gestures
				g.ontouchmove(self,@event) if g:ontouchmove

		target?.ontouchmove(self,@event)
		self

	def ended
		return self if !@active or @cancelled

		@updates++

		if @gestures
			g.ontouchend(self) for g in @gestures

		target?.ontouchend(self)
		cleanup_
		self

	def cancel
		unless @cancelled
			@cancelled = yes
			cancelled
			cleanup_
		self

	def cancelled
		return self unless @active

		@cancelled = yes
		@updates++

		if @gestures
			for g in @gestures
				g.ontouchcancel(self) if g:ontouchcancel

		target?.ontouchcancel(self)
		self
		
	def cleanup_
		if @mousemove
			Imba.document.removeEventListener('mousemove',@mousemove,yes)
			@mousemove = null
		
		if @selblocker
			Imba.document.removeEventListener('selectstart',@selblocker,yes)
			@selblocker = null
		
		self

	###
	The absolute distance the touch has moved from starting position 
	@return {Number}
	###
	def dr do @dr

	###
	The distance the touch has moved horizontally
	@return {Number}
	###
	def dx do @x - @x0

	###
	The distance the touch has moved vertically
	@return {Number}
	###
	def dy do @y - @y0

	###
	Initial horizontal position of touch
	@return {Number}
	###
	def x0 do @x0

	###
	Initial vertical position of touch
	@return {Number}
	###
	def y0 do @y0

	###
	Horizontal position of touch
	@return {Number}
	###
	def x do @x

	###
	Vertical position of touch
	@return {Number}
	###
	def y do @y

	###
	Horizontal position of touch relative to target
	@return {Number}
	###
	def tx do
		@targetBox ||= @target.dom.getBoundingClientRect
		@x - @targetBox:left

	###
	Vertical position of touch relative to target
	@return {Number}
	###
	def ty
		@targetBox ||= @target.dom.getBoundingClientRect
		@y - @targetBox:top

	###
	Button pressed in this touch. Native touches defaults to left-click (0)
	@return {Number}
	###
	def button do @button # @pointer ? @pointer.button : 0

	def sourceTarget
		@sourceTarget

	def elapsed
		Date.now - @timestamp


class Imba.TouchGesture

	prop active default: no

	def ontouchstart e
		self

	def ontouchupdate e
		self

	def ontouchend e
		self

