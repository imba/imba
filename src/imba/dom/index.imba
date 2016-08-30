require './manager'

Imba.TagManager = Imba.TagManagerClass.new

require './tag'
require './html'
require './svg'
require './pointer'
require './touch'
require './event'
require './event-manager'
require './selector'

if $web$
	require './reconciler'

if $node$
	require './server'

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