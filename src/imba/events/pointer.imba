import {Event,Element} from '../dom'

Event.pointerdown = {
	handle: do(s,args)
		let ev = s.event
		s.handler.x0 = ev.x
		s.handler.y0 = ev.y

	lock: do(state,args)
		let ev = state.event
		let el = state.element
		let handler = state.handler
		let canceller = do return false
		let selstart = document.onselectstart
		el.setPointerCapture(ev.pointerId)
		handler.pointerId = ev.pointerId
		handler.x0 = ev.x
		handler.y0 = ev.y
		ev.dx = ev.dy = 0

		el.addEventListener('pointermove',handler)
		el.addEventListener('pointerup',handler)
		document.onselectstart = canceller
		el.addEventListener('pointerup',&,once: true) do(e)
			el.releasePointerCapture(e.pointerId)
			el.removeEventListener('pointermove',handler)
			el.removeEventListener('pointerup',handler)
			handler.pointerId = null
			document.onselectstart = selstart
		yes
			
			
}
Event.pointermove = {
	handle: do(s,args)
		let h = s.handler
		let e = s.event
		let id = h.pointerId
		return false if id and e.pointerId != id
		if typeof h.x0 == 'number'
			e.dx = e.x - h.x0
			e.dy = e.y - h.y0
		return true
}
Event.pointerup = {
	handle: do(s,args)
		let h = s.handler
		let e = s.event
		let id = h.pointerId
		return false if id and e.pointerId != id
		if typeof h.x0 == 'number'
			e.dx = e.x - h.x0
			e.dy = e.y - h.y0
		return true
}


Element.prototype.on$touch = do(mods,context)
	return