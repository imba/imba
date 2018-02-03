var Imba = require("../imba")
require("./pointer")

###

Manager for listening to and delegating events in Imba. A single instance
is always created by Imba (as `Imba.Events`), which handles and delegates all
events at the very root of the document. Imba does not capture all events
by default, so if you want to make sure exotic or custom DOMEvents are delegated
in Imba you will need to register them in `Imba.Events.register(myCustomEventName)`

@iname manager

###
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

	def self.activate
		return Imba.Events if Imba.Events

		if $web$
			Imba.POINTER ||= Imba.Pointer.new

			Imba.Events = Imba.EventManager.new(Imba.document, events: [
				:keydown, :keyup, :keypress,
				:textInput, :input, :change, :submit,
				:focusin, :focusout, :focus, :blur,
				:contextmenu, :dblclick,
				:mousewheel, :wheel, :scroll,
				:beforecopy, :copy,
				:beforepaste, :paste,
				:beforecut, :cut
			])

			# should listen to dragdrop events by default
			Imba.Events.register([
				:dragstart,:drag,:dragend,
				:dragenter,:dragover,:dragleave,:dragexit,:drop
			])

			var hasTouchEvents = window && window:ontouchstart !== undefined

			if hasTouchEvents
				Imba.Events.listen(:touchstart) do |e|
					Imba.Touch.ontouchstart(e)

				Imba.Events.listen(:touchmove) do |e|
					Imba.Touch.ontouchmove(e)

				Imba.Events.listen(:touchend) do |e|
					Imba.Touch.ontouchend(e)

				Imba.Events.listen(:touchcancel) do |e|
					Imba.Touch.ontouchcancel(e)

			Imba.Events.register(:click) do |e|
				# Only for main mousebutton, no?
				if (e:timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout
					e.@imbaSimulatedTap = yes
					var tap = Imba.Event.new(e)
					tap.type = 'tap'
					tap.process
					if tap.@responder
						return e.preventDefault
				# delegate the real click event
				Imba.Events.delegate(e)

			Imba.Events.listen(:mousedown) do |e|
				if (e:timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout
					Imba.POINTER.update(e).process if Imba.POINTER

			Imba.Events.listen(:mouseup) do |e|
				if (e:timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout
					Imba.POINTER.update(e).process if Imba.POINTER

			Imba.Events.register([:mousedown,:mouseup])
			Imba.Events.enabled = yes
			return Imba.Events


	def initialize node, events: []
		@shimFocusEvents = $web$ && window:netscape && node:onfocusin === undefined
		root = node
		listeners = []
		delegators = {}
		delegator = do |e| 
			delegate(e)
			return true

		for event in events
			register(event)

		return self

	###

	Tell the current EventManager to intercept and handle event of a certain name.
	By default, Imba.Events will register interceptors for: *keydown*, *keyup*, 
	*keypress*, *textInput*, *input*, *change*, *submit*, *focusin*, *focusout*, 
	*blur*, *contextmenu*, *dblclick*, *mousewheel*, *wheel*

	###
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
		var event = Imba.Event.wrap(e)
		event.process
		if @shimFocusEvents
			if e:type == 'focus'
				Imba.Event.wrap(e).setType('focusin').process
			elif e:type == 'blur'
				Imba.Event.wrap(e).setType('focusout').process
		self

	###

	Create a new Imba.Event

	###
	def create type, target, data: null, source: null
		var event = Imba.Event.wrap type: type, target: target
		event.data = data if data
		event.source = source if source
		event

	###

	Trigger / process an Imba.Event.

	###
	def trigger
		create(*arguments).process

	def onenable
		for own name,handler of delegators
			root.addEventListener(name,handler,yes)

		for item in listeners
			root.addEventListener(item[0],item[1],item[2])
			
		window.addEventListener('hashchange',Imba:commit)
		self

	def ondisable
		for own name,handler of delegators
			root.removeEventListener(name,handler,yes)

		for item in listeners
			root.removeEventListener(item[0],item[1],item[2])

		window.removeEventListener('hashchange',Imba:commit)
		self