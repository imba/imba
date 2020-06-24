import {Event,Element} from '../dom'

class Touch
	def constructor e
		id = e.pointerId
		t0 = Date.now!
		x0 = x = e.x
		y0 = y = e.y
		mx = my = 0
		e.touch = self
	
	def update e
		mx = e.x - x
		my = e.y - x
		x = e.x
		y = e.y
		e.touch = self
	
	get dx
		x - x0
	
	get dy
		y - y0
		
	get dt
		Date.now! - t0

def Event.pointerdown$handle
	let e = event
	let el = element
	let handler = handler
	return true if handler.type != 'touch'
	
	e.dx = e.dy = 0
	handler.x0 = e.x
	handler.y0 = e.y
	handler.pointerId = e.pointerId
	
	handler.touch = new Touch(e)

	let canceller = do return false
	let selstart = document.onselectstart
	el.setPointerCapture(e.pointerId)

	el.addEventListener('pointermove',handler)
	el.addEventListener('pointerup',handler)
	document.onselectstart = canceller

	el.flags.add('_touch_')

	el.addEventListener('pointerup',&,once: true) do(e)
		el.releasePointerCapture(e.pointerId)
		el.removeEventListener('pointermove',handler)
		el.removeEventListener('pointerup',handler)
		handler.pointerId = null
		if handler.pointerFlag
			el.flags.remove(handler.pointerFlag)
		el.flags.remove('_touch_')
		document.onselectstart = selstart
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