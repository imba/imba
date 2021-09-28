# imba$imbaPath=global
import {Event,CustomEvent,Element} from '../dom/core'

export def use_events_resize
	yes

let resizeObserver = null

def getResizeObserver
	unless global.ResizeObserver
		unless resizeObserver
			console.warn(':resize not supported in this browser')
			resizeObserver = {observe: (do yes)}
		
	resizeObserver ||= new ResizeObserver do(entries)
		for entry in entries
			let e = new CustomEvent('resize', bubbles: false, detail: entry)
			e.entry = entry
			e.rect = entry.contentRect
			e.width = entry.target.offsetWidth
			e.height = entry.target.offsetHeight
			entry.target.dispatchEvent(e)
			let e2 = new CustomEvent('resized', bubbles: true, detail: entry)
			entry.target.dispatchEvent(e2)
		return

def Event.resize$css
	if element.offsetParent
		# element.style.setProperty("--width",event.width + 'px')
		# element.style.setProperty("--height",event.height + 'px')
		element.style.setProperty("--u_elw",event.width + 'px')
		element.style.setProperty("--u_elh",event.height + 'px')
	return true

# TODO Add modifier for only triggering when element is attached.
# resize triggers by default with w/h 0 when element is removed.

extend class Element
	def on$resize(chain, context, handler,o)
		getResizeObserver!.observe(this)
		self.addEventListener('resize',handler,o)
		return handler