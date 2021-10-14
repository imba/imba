# imba$imbaPath=global
import {Event,CustomEvent,Element} from '../dom/core'
import * as helpers from './helpers'

export def use_events_resize
	yes

let resizeObserver = null

extend class CustomEvent

	def @resize_css wunit = '1elw', hunit = '1elh', sel = ''
		const target = target
		if target.offsetParent
			let wu = helpers.parseDimension(wunit)
			let hu = helpers.parseDimension(hunit)
			let el = helpers.toElement(sel,target)
			
			let wp = wu ? "--u_{wu[1]}" : "--{wunit}"
			let hp = hu ? "--u_{hu[1]}" : "--{hunit}"

			el.style.setProperty(wp,self.width + 'px')
			el.style.setProperty(hp,self.height + 'px')

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
			e.width = entry.target.offsetWidth
			e.height = entry.target.offsetHeight
			
			e.@css = CustomEvent.prototype.@resize_css
			
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