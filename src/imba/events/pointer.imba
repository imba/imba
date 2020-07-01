
import {Event,PointerEvent,Element} from '../dom'
import {parseDimension} from '../css'
	
class Pointer
	def constructor e, state
		state = state
		start = event = e
		id = e.pointerId
		t0 = Date.now!
		cx0 = cx = e.x
		cy0 = cy = e.y
		tx0 = ty0 = ax = ay = mx = my = ox = oy = 0
		raw = {x0: e.x, y0: e.y}
		e.touch = self
	
	def update e
		mx = e.x - x
		my = e.y - y
		cx = raw.x = e.x
		cy = raw.y = e.y
		event = e
		e.touch = self
		
	def round
		$round = yes
		cx0 = Math.round(cx0)
		cy0 = Math.round(cy0)
		cx = Math.round(cx)
		cy = Math.round(cy)
		self
		
	def frame frame,ax = 0,ay = ax
		if typeof frame == 'string'
			let sel = frame
			console.warn 'find frame?',sel,state
			if let el = state.element
				frame = el.closest(sel) or el.querySelector(sel)
				console.warn 'found frame?',frame

		if frame isa Element
			frame = frame.getBoundingClientRect!

		frame = frame
		ax = ax
		ay = ay
		ox = frame.left + frame.width * ax
		oy = frame.top + frame.height * ay
		self
		
	def transform rect,min,max,step
		let count = arguments.length
		
		if typeof rect == 'string'
			let sel = rect
			console.warn 'find rect?',sel,state
			if let el = state.element
				rect = el.closest(sel) or el.querySelector(sel)
				console.warn 'found frame?',rect
		elif typeof rect == 'number'
			step = max
			max = min
			min = rect
			rect = state.element
			count++
				
		console.warn 'transform!!',arguments

		if rect isa Element
			rect = rect.getBoundingClientRect!

		
		console.warn 'transform',rect,min,max,step,count

		if count == 2
			step = min
			count--

		xaxis = [rect.left,rect.width,min,max,step]
		yaxis = [rect.top,rect.height,min,max,step]
		
		if count == 1
			xaxis[2] = yaxis[2] = 0
			xaxis[3] = xaxis[1]
			yaxis[3] = yaxis[1]
		
		if min isa Array
			xaxis = xaxis.slice(0,2).concat(min)

		if max isa Array
			yaxis = yaxis.slice(0,2).concat(max)
			
		if typeof xaxis[4] == 'string'
			xaxis.splice(4,1,...parseDimension(xaxis[4]))

		if typeof yaxis[4] == 'string'
			yaxis.splice(4,1,...parseDimension(yaxis[4]))

			

	def $round val,step = 1
		let inv = 1.0 / step
		Math.round(val * inv) / inv
		
	def $conv value,trx,clamp
		return value unless trx
		let offset = trx[0]
		let size = trx[1]
		let out = value - offset
		let min = trx[2]
		let max = trx[3]
		let len = max - min
		let step = trx[4] or 0.1
		let stepunit = trx[5]

		if max != undefined
			out = min + len * (out / size)
		if clamp
			if min > max
				out = Math.max(max,Math.min(min,out))
			else
				out = Math.min(max,Math.max(min,out))

		if stepunit == '%'
			step = len * (step / 100)

		return $round(out,step)
		
	def $x value
		$conv(value,xaxis,clamped)
	
	def $y value
		$conv(value,yaxis,clamped)
		
	get x do $x(raw.x)
	get y do $y(raw.y)
	get x0 do $x(raw.x0)
	get y0 do $y(raw.y0)
	
	get dx
		x - x0
	
	get dy
		y - y0
		
	get tx
		tx0 + dx
	
	get ty
		ty0 + dy
		
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
	# how does clamping come into the picture?
	unless state.offset
		state.offset = {
			x: item.x
			y: item.y
		}
	console.log 'sync touch',state.touch.x,state.offset.x
	item.x = state.offset.x + state.touch.dx
	item.y = state.offset.y + state.touch.dy
	return yes

def Event.touch$round$mod item
	state.touch.round!
	return yes
	
def Event.touch$transform$mod ...params
	unless state.transformed
		state.transformed = yes
		state.touch.transform(...params)
	return yes

def Event.touch$reframe$mod ...params
	unless state.transformed
		state.transformed = yes
		state.touch.transform(...params)
		# state.touch.clamped = yes
	return yes
	
	
def Event.touch$fit$mod ...params
	unless state.transformed
		state.transformed = yes
		state.touch.transform(...params)
		state.touch.clamped = yes
	return yes
	
def Event.touch$clamp$mod ...params
	unless state.transformed
		state.transformed = yes
		state.touch.transform(...params)
		state.touch.clamped = yes
	return yes
	
	# state.touch.clamped = expr == undefined ? yes : (!!expr)
	# return yes
		
		
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
		state.offset = {
			x: origin and origin.x or 0
			y: origin and origin.y or 0
		}
		console.warn 'found sync modifier!!',state.offset

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