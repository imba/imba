import {Event,PointerEvent,Element} from '../dom'

class Pointer
	def constructor e, state
		state = state
		start = e
		id = e.pointerId
		t0 = Date.now!
		cx0 = cx = e.x
		cy0 = cy = e.y
		tx0 = ty0 = ax = ay = mx = my = ox = oy = 0
		e.touch = self
	
	def update e
		mx = e.x - x
		my = e.y - y
		cx = e.x
		cy = e.y
		e.touch = self
		
	def round
		$round = yes
		cx0 = Math.round(cx0)
		cy0 = Math.round(cy0)
		cx = Math.round(cx)
		cy = Math.round(cy)
		self
		
	def frame frame,ax = 0,ay = ax
		if frame isa Element
			frame = frame.getBoundingClientRect!

		frame = frame
		ax = ax
		ay = ay
		ox = frame.left + frame.width * ax
		oy = frame.top + frame.height * ay
		self
		
	get x
		cx - ox
		
	get y
		cy - oy
	
	get dx
		cx - cx0
	
	get dy
		cy - cy0
		
	get tx # target x
		tx0 + dx
	
	get ty
		ty0 + dy
		
	get xa
		frame ? (x / frame.width) : 0
	
	get ya
		frame ? (y / frame.height) : 0
		
	get dt
		Date.now! - t0

extend class PointerEvent
	
	def primary$mod
		return !!event.isPrimary
	
	def mouse$mod
		return event.pointerType == 'mouse'
	
	def pen$mod
		return event.pointerType == 'pen'
	
	def touch$mod
		return event.pointerType == 'touch'
	
	def pressure$mod threshold = 0
		return event.pressure > threshold

	def lock$mod dr
		return yes
		
def Event.touch$threshold$mod dr
	if !state[step] and event.dr > dr
		console.warn 'moved past threshold!'
		state[step] = yes
	return !!state[step]

def Event.touch$sync$mod item
	item.x = state.ox + state.touch.dx
	item.y = state.oy + state.touch.dy
	return yes
	
def Event.touch$round$mod item
	state.touch.round!
	return yes
	
def Event.touch$anchor$mod ...params
	unless state.frame
		state.frame = yes
		console.warn 'reframe',state
		state.touch.frame(...params)
	return yes
		
def Event.touch$handle o = {}
	let e = event
	let el = element
	if state.id
		return state.id == e.pointerId
		
	if modifiers.self and element != event.target
		return false
	
	# console.warn self

	let t  = e.touch = new Pointer(e,self)
	let x0 = e.x
	let y0 = e.y

	if o isa Element
		t.originRect = o.getBoundingClientRect!
		console.warn 'adding origin rect',t.originRect
		
	if typeof o.x == 'number'
		t.tx0 = o.x
	
	if typeof o.y == 'number'
		t.ty0 = o.y

	handler.state = state = {id: e.pointerId, touch: t}

	if modifiers.sync
		let origin = modifiers.sync[0]
		state.ox = origin and origin.x or 0
		state.oy = origin and origin.y or 0
		console.warn 'found sync modifier!!',origin

	let canceller = do return false
	let selstart = document.onselectstart
		
	let listener = do(e)
		let typ = e.type
		let dx = e.dx = e.x - x0
		let dy = e.dy = e.y - y0
		let dr = e.dr = Math.sqrt(dx*dx + dy*dy)
		let ph = t.phase

		t.update(e)
		e.tx = t.tx
		e.ty = t.ty
		handler.handleEvent(e)

		if typ == 'pointerup' or typ == 'pointercancel'
			el.releasePointerCapture(e.pointerId)
			el.flags.remove('_touch_')
			document.onselectstart = selstart

			
	let teardown = do(e)
		console.warn 'teardown pointer'
		handler.state = {}
		el.removeEventListener('pointermove',listener)
		el.removeEventListener('pointerup',listener)
		el.removeEventListener('pointercancel',listener)
		if document.onselectstart == canceller
			document.onselectstart = selstart
		# el.removeEventListener('pointercancel',listener)
	
	el.setPointerCapture(e.pointerId)
	el.addEventListener('pointermove',listener)
	el.addEventListener('pointerup',listener)
	el.addEventListener('pointercancel',listener)
	el.addEventListener('lostpointercapture',teardown,once:true)
	document.onselectstart = canceller

	listener(e)

	return false

	yes			

def Event.pointermove$handle
	let h = handler
	let e = event
	let id = h.pointerId
	return false if id and e.pointerId != id
	h.touch.update(e) if h.touch
	if typeof h.x0 == 'number'
		e.dx = e.x - h.x0
		e.dy = e.y - h.y0
	return true


def Event.pointerup$handle
	let h = handler
	let e = event
	let id = h.pointerId
	return false if id and e.pointerId != id
	h.touch.update(e) if h.touch
	if typeof h.x0 == 'number'
		e.dx = e.x - h.x0
		e.dy = e.y - h.y0
	return true