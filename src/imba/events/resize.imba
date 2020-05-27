
import {CustomEvent,Element} from '../dom'

var resizeObserver = null

def getResizeObserver
	unless global.ResizeObserver
		unless resizeObserver
			console.warn(':resize not supported in this browser')
			resizeObserver = {observe: do yes}
		
	resizeObserver ||= new ResizeObserver do(entries)
		for entry in entries
			let e = new CustomEvent('resize', bubbles: false, detail: entry)
			e.rect = entry.contentRect
			entry.target.dispatchEvent(e)
		return

extend class Element

	def on$resize(chain, context)
		getResizeObserver!.observe(this)