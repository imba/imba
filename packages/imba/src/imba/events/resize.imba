# imba$imbaPath=global
# imba$stdlib=1
import {Event,CustomEvent,Element} from '../dom/core'
import * as helpers from './helpers'

export def use_events_resize
	global.imba.uses_events_resize = yes
	yes

let resizeObserver = null


class ResizeEvent < CustomEvent
	def @css wunit = '1elw', hunit = '1elh', sel = '', unit = ''
		const target = entry..target

		if sel == 'px'
			unit = sel
			sel = ''

		if target and target.offsetParent
			let wu = helpers.parseDimension(wunit)
			let hu = helpers.parseDimension(hunit)
			let el = helpers.toElement(sel,target)

			let wp = wu ? "--u_{wu[1]}" : "--{wunit}"
			let hp = hu ? "--u_{hu[1]}" : "--{hunit}"

			let wval = wu ? (self.width / wu[0]) : self.width
			let hval = hu ? (self.height / hu[0]) : self.height

			el.style.setProperty(wp,wval + unit)
			el.style.setProperty(hp,hval + unit)

		return yes

	get width
		#width ??= entry.target.offsetWidth

	get height
		#height ??= entry.target.offsetHeight

def getResizeObserver
	unless global.ResizeObserver
		unless resizeObserver
			console.warn(':resize not supported in this browser')
			resizeObserver = {observe: (do yes)}

	global.imbaResizeObserver = resizeObserver ||= new ResizeObserver do(entries)
		# console.warn('resized',entries)
		# setTimeout(&,0) do
		for entry in entries
			let e = new CustomEvent('resize', bubbles: false, detail: entry)
			e.entry = entry
			e.rect = entry.contentRect
			e.#extendType(ResizeEvent)
			entry.target.dispatchEvent(e)

			let e2 = new CustomEvent('resized', bubbles: true, detail: entry)
			entry.target.dispatchEvent(e2)
		return
# TODO Add modifier for only triggering when element is attached.
# resize triggers by default with w/h 0 when element is removed.

extend class Element
	def on$resize(chain, context, handler,o)
		# Are references kept here?
		let observer = getResizeObserver!
		observer.observe(this)
		# oh, should we not remove the listener on unmount?!
		self.addEventListener('resize',handler,o)
		return handler