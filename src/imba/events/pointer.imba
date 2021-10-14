# imba$imbaPath=global

import {Event,PointerEvent,Element} from '../dom/core'
import {listen,once,emit,unlisten} from '../utils'

import * as helpers from './helpers'

export def use_events_pointer
	yes

# Adding the pointerevent modifiers
extend class PointerEvent
	
	def @primary
		return !!isPrimary
	
	def @mouse
		return pointerType == 'mouse'
	
	def @pen
		return pointerType == 'pen'
	
	def @touch
		return pointerType == 'touch'
	
	def @pressure threshold = 0
		return pressure > threshold

	def @lock
		return yes

class Touch
	def constructor e,handler,el
		phase = 'init'
		events = []
		originalEvent = e
		handler = handler
		target = currentTarget = el
		#mods = {}
	
	set event value
		events.push(value)

	get ctrlKey do originalEvent.ctrlKey
	get altKey do originalEvent.altKey
	get shiftKey do originalEvent.shiftKey
	get metaKey do originalEvent.metaKey
	get isPrimary do originalEvent.isPrimary
	get pointerType do originalEvent.pointerType
	
	get start
		originalEvent

	get originalTarget
		originalEvent.target
		
	get event
		events[events.length - 1]
	
	get elapsed
		event.timeStamp - events[0].timeStamp
	
	get type do event.type
	get pointerId do originalEvent.pointerId
	get pressure do event.pressure
	get clientX do event.clientX
	get clientY do event.clientY
	get offsetX do event.offsetX
	get offsetY do event.offsetY
	get active? do phase != 'ended'
	get ended? do phase == 'ended'
		
	get dx
		#dx == undefined ? event.x - start.x : #dx
	
	get dy
		#dy == undefined ? event.y - start.y : #dy

	def stopImmediatePropagation
		cancelBubble = yes
		event.stopImmediatePropagation!
		self

	def stopPropagation
		cancelBubble = yes
		event.stopPropagation!
		self

	def preventDefault
		defaultPrevented = yes
		event.preventDefault!
		
	def emit name, ...params do emit(self,name,params)
	def on name, ...params do listen(self,name,...params)
	def once name, ...params do once(self,name,...params)
	def un name, ...params do unlisten(self,name,...params)
		
	def @flag name, sel
		const {element} = #context
		const ts = Date.now!

		if #step.setup =? yes
			element.flags.incr(name)
			once(self,'end') do
				element.flags.decr(name)

		return yes

	
	def @lock
		#capture!
		yes
		
	def #capture
		if #locked =? yes
			#context.element.setPointerCapture(pointerId)
		
	get #step
		#mods[#context.step] ||= {}

	def #cancel
		#teardown!
		
	def @moved a,b
		let o = #step
		const {element,state,event} = #context

		unless o.setup
			let th = a or 4
			if typeof a == 'string' and a.match(/^(up|down|left|right|x|y)$/)
				o.dir = a
				th = b or 4

			o.setup = yes
			let [tv,tu] = helpers.parseDimension(th)
			o.threshold = tv
			o.sy = tv
			o.x0 = x
			o.y0 = y
			if (tu and tu != 'px')
				console.warn 'only px threshold allowed in @touch.moved'

		if o.active
			return yes
		
		let th = o.threshold
		let dx = x - o.x0
		let dy = y - o.y0
		let hit = no
		
		if dx > th and (o.dir == 'right' or o.dir == 'x')
			hit = yes
			
		if !hit and dx < -th and (o.dir == 'left' or o.dir == 'x')
			hit = yes
			
		if !hit and dy > th and (o.dir == 'down' or o.dir == 'y')
			hit = yes
		
		if !hit and dy < -th and (o.dir == 'up' or o.dir == 'y')
			hit = yes
			
		if !hit and !o.dir
			let dr = Math.sqrt(dx*dx + dy*dy)
			if dr > th
				hit = yes
		
		if hit
			o.active = yes
			let pinned = state.pinTarget
			element.flags.incr('_move_')
			pinned.flags.incr('_move_') if pinned
			self['αlock']()

			once(self,'end') do
				pinned.flags.decr('_move_') if pinned
				element.flags.decr('_move_')

		return !!o.active
	
	def @hold time = 250
		let o = #step
		let el = #context.element
		
		return no if o.cancelled
		# cancel the actual event!!
		
		if o.setup and !o.active
			let x = clientX
			let y = clientY
			
			let dx = x - o.x
			let dy = y - o.y
			let dr = Math.sqrt(dx*dx + dy*dy)
			# cancel
			if dr > 5 and !o.cancelled
				o.cancelled = yes
				#cancel!
			
		if o.setup =? yes
			o.active = no
			o.x = clientX
			o.y = clientY
			o.timeout = setTimeout(&,time) do
				o.active = yes
				# let pinned = state.pinTarget
				el.flags.incr("_hold_")
				#capture!
			
			once(self,'end') do
				if o.active
					el.flags.decr("_hold_")
				clearTimeout(o.timeout)
				
			# Should this also cancel if starting to move before this?

		return o.active
		
	def @sync item,xalias='x',yalias='y'
		let o = #step

		if o.setup =? yes
			o.x = item[xalias] or 0
			o.y = item[yalias] or 0
			o.tx = x
			o.ty = y
		else
			item[xalias] = o.x + (x - o.tx) if xalias
			item[yalias] = o.y + (y - o.ty) if yalias
			
		#context.commit = yes
		return yes
		
	def @apply item,xalias='x',yalias='y'
		item[xalias] = x if xalias
		item[yalias] = y if yalias
		#context.commit = yes
		return yes
		
	def @css xalias='x',yalias='y'
		
		let o = #step
		if o.setup =? yes
			o.el = #context.element
			o.x = o.el.#x or 0
			o.y = o.el.#y or 0
			o.tx = x
			o.ty = y
		
		else
			o.el.style.setProperty("--x",o.x + (x - o.tx) + 'px') if xalias
			o.el.style.setProperty("--y",o.y + (y - o.ty) + 'px') if yalias			
		return yes
			
	def @end
		return phase == 'ended'
		
	def @shift
		return !!shiftKey

	def @alt
		return !!altKey

	def @ctrl
		return !!ctrlKey

	def @meta
		return !!metaKey
		
	def @primary
		return !!isPrimary
	
	def @mouse
		return pointerType == 'mouse'
	
	def @pen
		return pointerType == 'pen'
	
	def @touch
		return pointerType == 'touch'
	
	def @pressure threshold = 0
		return pressure > threshold
		
	def @round sx=1,sy=sx 
		x = helpers.round(x,sx)
		y = helpers.round(y,sy)
		return yes
		
	def #reframe ...params
		let o = #step
		
		if o.setup =? yes
			let el = target
			let len = params.length
			let box = params[0]
			let min = 0
			let max = 100%
			let snap = 1
			let typ = typeof box
			
			if typ == 'number' or (typ == 'string' and (/^([-+]?\d[\d\.]*)(%|\w+)$/).test(box)) or box isa Array
				box = null

			elif typ == 'string'
				if box == 'this' or box == ''
					box = el
				elif box == 'up'
					box = el.parentNode
				elif box == 'op'
					box = el.offsetParent
				else
					box = el.closest(box) or el.querySelector(box)

			if box == null
				len++
				params.unshift(box = el)
			
			if len == 2
				snap = params[1]
			elif len > 2
				[min,max,snap=1] = params.slice(1)

			let rect = box.getBoundingClientRect!
			min = [min,min] unless min isa Array
			max = [max,max] unless max isa Array
			snap = [snap,snap] unless snap isa Array

			o.rect = rect
			o.x = helpers.createScale(rect.left,rect.right,min[0],max[0],snap[0])
			o.y = helpers.createScale(rect.top,rect.bottom,min[1],max[1],snap[1])
			# state.scaleX = o.x
			# state.scaleY = o.y
			x0 = x = o.x(x,o.clamp)
			y0 = y = o.y(y,o.clamp)
		else
			let x = x = o.x(x,o.clamp)
			let y = y = o.y(y,o.clamp)
			#dx = x - x0
			#dy = y - y0

		return yes
	
	def @fit ...params
		#step.clamp = yes
		#reframe(...params)
	
	def @reframe ...params
		#reframe(...params)
	
	###
	Allow pinning the touch to a certain point in an element, so that
	all future x,y values are relative to this pinned point.
	You can include relative anchors for x and y

	Make x,y relative to the center of the parent:
		<box.target> <div.handle @touch.pin('.target',0.5,0.5)>

	(targetElement,anchorX?, anchorY?)
	###
	def @pin ...params
		let o = #step
		
		# TODO warn if pin comes after reframe

		if o.setup =? yes
			let box = helpers.toElement(params[0],target)

			unless box isa Element
				params.unshift(box = target)
			
			let ax = params[1] or 0
			let ay = params[2] ?= ax
			let rect = box.getBoundingClientRect!
			
			o.x = clientX - (rect.left + rect.width * ax)
			o.y = clientY - (rect.top + rect.height * ay)

			if box
				#pinTarget = box
				box.flags.incr('_touch_')
				once(self,'end') do box.flags.decr('_touch_')
			console.log 'pinning',o,box
		
		x -= o.x
		y -= o.y
		return yes

def Event.touch$lock$mod ...params
	let o = state[step]
	
	unless o
		o = state[step] = state.target.style
		let prev = o.touchAction
		o.touchAction = 'none'
		state.once('end') do o.removeProperty('touch-action')
	return yes

extend class Element
	def on$touch(mods,context,handler,o)
		handler.type = 'touch'
		self.addEventListener('pointerdown',handler,o)
		if helpers.navigator.ios? and !mods.passive
			self.addEventListener('touchstart',handler)
		return handler
		
def Event.touch$handle
	let e = event
	let el = element
	let id = state.pointerId
	let m = modifiers
	let handler = self.handler

	current = state

	if e.type == 'touchstart'
		# to make PointerEvents work well on ios we need to capture
		# the touchstart for the linked touch and cancel that
		try 
			if id and id == e.targetTouches[0].identifier
				e.preventDefault!
		return false

	if id != undefined
		return id == e.pointerId

	# reject the touch before creation for certain modifiers
	# TODO should allow specifying pen OR mouse etc
	return if m.ctrl and !e.ctrlKey
	return if m.alt and !e.altKey
	return if m.meta and !e.metaKey
	return if m.shift and !e.shiftKey
	return if m.if and !!m.if[0] == false
	return if m.self and e.target != el
	return if m.primary and !e.isPrimary
	return if m.pen and e.pointerType != 'pen'
	return if m.mouse and e.pointerType != 'mouse'
	return if m.touch and e.pointerType != 'touch'
	return if m.sel and !e.target.matches(String(m.sel[0]))
	
	let t = state = handler.state = current = new Touch(e,handler,el)
	
	console.log 'first event for touch',t,e
	let canceller = do(e)
		e.preventDefault!
		return false
		
	let teardown = null
	let sym = Symbol!
	
	let onclick = do(e)
		# console.log "ONCLICK!",e,e.pointerId,t.clientX,t.clientY,e.clientX,e.clientY
		let tx = t.clientX
		let ty = t.clientY
		let ex = e.clientX
		let ey = e.clientY

		if t.#locked and ((e.pointerId == t.pointerId) or (tx == ex and ty == ey))
			e.preventDefault!
			e.stopPropagation!
		return
		
	let listener = do(e)
		let typ = e.type
		let ph = t.phase
		
		if e[sym]
			# console.log 'already handled event!',e.type,e
			return

		if e.pointerId and t.pointerId != e.pointerId
			console.log 'events for a different pointer!',t.pointerId,e.pointerId
			return

		e[sym] = yes
		
		t.event = e
		# console.log 'event',e.type,e
		# console.log 'event for pointer',e.type,e
		
		let end = typ == 'pointerup' or typ == 'pointercancel' or typ == 'lostpointercapture'

		unless typ == 'pointercancel' or typ == 'lostpointercapture'
			t.x = e.clientX
			t.y = e.clientY

		# console.log 'pointer',typ,ph,t.target..nodeName,e.x,e.y
		if end
			# if already ended - dont end again?
			t.phase = 'ended'
			
		# if typ == 'pointerup' and t.#locked
		#	console.log "prevent pointerup!!"
		#	e.preventDefault!
		
		try handler.handleEvent(t)
		
		if ph == 'init' and !end
			t.phase = 'active'


		if end and !helpers.navigator.ios?
			el.releasePointerCapture(e.pointerId)
			
		if end and teardown
			teardown(e)
	
	let disposed = no
	
	# Add a global listener for a pointercancel or pointerup with the same pointerId?
	
	teardown = do(e)
		return if disposed
		el.flags.decr('_touch_')

		if t.phase != 'ended'
			t.phase = 'ended'
			t.x = t.clientX
			t.y = t.clientY
			handler.handleEvent(t)

		t.emit('end')
		unless m.passive
			if (--handler.prevents) == 0
				el.style.removeProperty('touch-action')
		handler.state = {}
		
		el.removeEventListener('pointermove',listener)
		el.removeEventListener('pointerup',listener)
		el.removeEventListener('pointercancel',listener)
		el.removeEventListener('lostpointercapture',teardown)
		
		global.removeEventListener('pointermove',listener)
		global.removeEventListener('pointerup',listener)
		global.removeEventListener('pointercancel',listener)
		
		setTimeout(&,100) do
			if onclick
				global.removeEventListener('click',onclick,capture:true)
				onclick = null

		global.document.removeEventListener('selectstart',canceller,capture:true)
		
		disposed = yes
		
	t.#teardown = teardown
	
	unless m.passive
		handler.prevents ||= 0
		handler.prevents++
		el.style.setProperty('touch-action','none')
		el.offsetWidth # force reflow for touch-action none to take effect

	el.flags.incr('_touch_')
	el.addEventListener('pointermove',listener)
	el.addEventListener('pointerup',listener)
	el.addEventListener('pointercancel',listener)
	el.addEventListener('lostpointercapture',teardown)
	
	global.addEventListener('pointermove',listener)
	global.addEventListener('pointerup',listener)
	global.addEventListener('pointercancel',listener)
	global.addEventListener('click',onclick,capture:true)

	if !helpers.navigator.ios?
		yes
		# el.setPointerCapture(e.pointerId)

	global.document.addEventListener('selectstart',canceller,capture:true)

	listener(e)
	return false