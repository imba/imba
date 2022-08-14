# imba$imbaPath=global

import {Event,Element} from '../dom/core'
import {listen,once,emit,unlisten} from '../utils'

import * as helpers from './helpers'

export def use_events_touch
	yes
	
let iosMoveIframeFix = null

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
		let el = sel isa Element ? sel : (sel ? element.closest(sel) : element)

		if #step.setup =? yes
			el.flags.incr(name)
			once(self,'end') do
				el.flags.decr(name)

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
				
			if typeof b == 'string' and b.match(/^(up|down|left|right|x|y)$/)
				o.dir = b

			o.setup = yes
			let [tv,tu] = helpers.parseDimension(th)
			o.threshold = tv
			o.sy = tv
			o.x0 = x
			o.y0 = y
			o.dir ||= 'dist'
			o.x = o.left = o.right = o.y = o.up = o.down = o.dist = 0
			if (tu and tu != 'px')
				console.warn 'only px threshold allowed in @touch.moved'

		if o.active
			return yes
			
		if o.cancelled
			return no
		
		let th = o.threshold
		let dx = x - o.x0
		let dy = y - o.y0
		
		o.x = Math.max(o.x,Math.abs(dx))
		o.y = Math.max(o.y,Math.abs(dy))
		o.left = Math.max(o.left,-dx)
		o.right = Math.max(o.right,dx)
		o.up = Math.max(o.up,-dy)
		o.down = Math.max(o.down,dy)
		o.dist = Math.max(o.dist,Math.sqrt(dx*dx + dy*dy))
		
		let val = o[o.dir]

		if val > th and val >= o.x and val >= o.y
			o.active = yes
			let pinned = state.pinTarget
			element.flags.incr('_move_')
			pinned.flags.incr('_move_') if pinned
			preventDefault!

			once(self,'end') do
				pinned.flags.decr('_move_') if pinned
				element.flags.decr('_move_')
			return true
			
		elif o.x > th or o.y > th
			o.cancelled = yes
			# #cancel!
			return no
			
		return no
	
	def @hold time = 250
		let o = #step
		let el = #context.element
		
		return no if o.cancelled
		
		if o.setup and !o.active
			let x = clientX
			let y = clientY
			
			let dx = x - o.x
			let dy = y - o.y
			let dr = Math.sqrt(dx*dx + dy*dy)
			# cancel
			if dr > 5 and !o.cancelled
				clearTimeout(o.timeout)
				o.cancelled = yes
				# #cancel!
			
		if o.setup =? yes
			o.active = no
			o.x = clientX
			o.y = clientY

			let resolve

			o.timeout = setTimeout(&,time) do
				o.active = yes
				preventDefault!
				el.flags.incr("_hold_")
				resolve(yes) if resolve
				resolve = null
			
			once(self,'end') do
				if o.active
					el.flags.decr("_hold_")
				clearTimeout(o.timeout)
				resolve(no) if resolve
				resolve = null
			
			return new Promise do resolve = $1

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
			let x = o.el.#x = o.x + (x - o.tx)
			let y = o.el.#y = o.y + (y - o.ty)

			o.el.style.setProperty("--x",x + 'px') if xalias
			o.el.style.setProperty("--y",y + 'px') if yalias			
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
	
	def @pressure threshold = 0.5
		return pressure >= threshold
		
	def @log ...params
		console.info(...params)
		return true
		
	def @left do originalEvent.button == 0

	def @middle do originalEvent.button == 1

	def @right do originalEvent.button == 2
		
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
			let snap = 0
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
				[min,max,snap=0] = params.slice(1)

			let rect = box.getBoundingClientRect!
			min = [min,min] unless min isa Array
			max = [max,max] unless max isa Array
			snap = [snap,snap] unless snap isa Array

			o.rect = rect
			o.x = helpers.createScale(rect.left,rect.right,min[0],max[0],snap[0])
			o.y = helpers.createScale(rect.top,rect.bottom,min[1],max[1],snap[1])
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
			# console.log 'pinning',o,box
		
		x -= o.x
		y -= o.y
		return yes

extend class Element
	def on$touch(mods,context,handler,o)
		handler.type = 'touch'
		self.addEventListener('pointerdown',handler,{passive: false})
		if helpers.navigator.ios? and global.parent != global
			if iosMoveIframeFix =? true
				global.parent.postMessage('setupTouchFix')

		return handler
		
if $web$ and global.parent == global and helpers.navigator.ios?
	let fix = do(e)
		if e.data == 'setupTouchFix'
			global.addEventListener('touchmove',&,{passive: false}) do false
			global.removeEventListener('message',fix)
	global.addEventListener('message',fix)
		
def Event.touch$handle
	let e = event
	let el = element
	let id = state.pointerId
	let m = modifiers
	let handler = self.handler
	let ios = helpers.navigator.ios?

	current = state

	if id != undefined
		return id == e.pointerId
		
	
	# reject the touch before creation for certain modifiers
	# TODO should allow specifying pen OR mouse etc
	# FIXME these will not work with negated modifiers
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
	id = t.pointerId

	let canceller = do(e)
		e.preventDefault!
		return false

	let teardown = null
	let sym = Symbol!
	
	let onclick = do(e)
		# console.debug "ONCLICK!",e,e.pointerId,t.clientX,t.clientY,e.clientX,e.clientY
		let tx = t.clientX
		let ty = t.clientY
		let ex = e.clientX
		let ey = e.clientY

		if (t.#locked or t.defaultPrevented) and ((e.pointerId == t.pointerId) or (tx == ex and ty == ey))
			e.preventDefault!
			e.stopPropagation!
			
		if onclick
			global.removeEventListener('click',onclick,capture:true)
			onclick = null
		return
		
	let ontouch = do(e)
		if t.type == 'touchmove' and e.changedTouches[0].identifier != id
			return 	
		# console.debug 'ontouch',e.type,t.defaultPrevented,e.changedTouches
		if t.defaultPrevented or t.#locked
			e.preventDefault!
		
	let listener = do(e)
		let typ = e.type
		let ph = t.phase
		# console.debug "listen",e.type,e.pointerId
		return if e.pointerId and t.pointerId != e.pointerId
		
		if e[sym]
			return

		e[sym] = yes
		
		
		let end = typ == 'pointerup' or typ == 'pointercancel'
		
		# if the pressure is suddenly 0 it indicates there has been a
		# pointerup event not captured by the browser
		if e.pressure == 0 and e.pointerType == 'mouse' and typ == 'pointermove' and t.originalEvent.pressure > 0
			return teardown(e)
		
		if typ == 'pointercancel'
			t.x = t.clientX
			t.y = t.clientY
		else
			t.x = e.clientX
			t.y = e.clientY
			
		t.event = e

		if end
			t.phase = 'ended'
			
		try handler.handleEvent(t)
		
		if ph == 'init' and !end
			t.phase = 'active'
			
		if end and teardown
			teardown(e)
	
	let disposed = no

	teardown = do(e)
		return if disposed
		disposed = yes
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

		global.removeEventListener('pointermove',listener,passive:!!m.passive)
		global.removeEventListener('pointerup',listener)
		global.removeEventListener('pointercancel',listener)

		setTimeout(&,100) do
			if onclick
				global.removeEventListener('click',onclick,capture:true)
				onclick = null
				
			if ios and ontouch
				global.removeEventListener('touchend',ontouch)
				global.removeEventListener('touchmove',ontouch,{passive: false})
				ontouch = null

		if !m.passive
			global.document.removeEventListener('selectstart',canceller,capture:true)
		
	t.#teardown = teardown
	
	if !m.passive
		handler.prevents ||= 0
		handler.prevents++
		el.style.setProperty('touch-action','none')
		el.offsetWidth

	el.flags.incr('_touch_')
	global.addEventListener('pointermove',listener,passive:!!m.passive)
	global.addEventListener('pointerup',listener)
	global.addEventListener('pointercancel',listener)
	global.addEventListener('click',onclick,capture:true)

	if ios and !m.passive
		global.addEventListener('touchend',ontouch)
		global.addEventListener('touchmove',ontouch,{passive: false})

	if !m.passive
		global.document.addEventListener('selectstart',canceller,capture:true)

	listener(e)
	return false