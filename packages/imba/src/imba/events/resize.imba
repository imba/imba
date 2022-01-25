# imba$imbaPath=global
import {Event,CustomEvent,Element} from '../dom/core'
import * as helpers from './helpers'

export def use_events_resize
	yes

let resizeObserver = null

class ResizeEvent < CustomEvent
	def @css wunit = '1elw', hunit = '1elh', sel = ''
		const target = target
		if target.offsetParent
			let wu = helpers.parseDimension(wunit)
			let hu = helpers.parseDimension(hunit)
			let el = helpers.toElement(sel,target)
			
			let wp = wu ? "--u_{wu[1]}" : "--{wunit}"
			let hp = hu ? "--u_{hu[1]}" : "--{hunit}"

			let wval = wu ? (self.width / wu[0]) : self.width
			let hval = hu ? (self.height / hu[0]) : self.height

			el.style.setProperty(wp,wval)
			el.style.setProperty(hp,hval)

		return yes

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
			# FIXME user is often throttling resize events - in which case accessing
			# offsetWidth and offsetHeight will invalidate layout w/o reason
			e.width = entry.target.offsetWidth
			e.height = entry.target.offsetHeight
			e.#extendType(ResizeEvent)
			
			entry.target.dispatchEvent(e)
			
			let e2 = new CustomEvent('resized', bubbles: true, detail: entry)
			entry.target.dispatchEvent(e2)
		return
# TODO Add modifier for only triggering when element is attached.
# resize triggers by default with w/h 0 when element is removed.

extend class Element
	def on$resize(chain, context, handler,o)
		getResizeObserver!.observe(this)
		self.addEventListener('resize',handler,o)
		return handler