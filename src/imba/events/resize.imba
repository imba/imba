
import {CustomEvent,Element} from '../dom'

class ResizeEvent < CustomEvent


var resizeObserver = null

def getResizeObserver
	unless global.ResizeObserver
		unless resizeObserver
			console.warn(':resize not supported in this browser')
			resizeObserver = {observe: do yes}
		
	resizeObserver ||= ResizeObserver.new do |entries|
		for entry in entries
			let e = ResizeEvent.new('resize', bubbles: false, detail: entry.contentRect)
			entry.target.dispatchEvent(e)
		return

extend class Element

	def on$resize(chain, context)
		getResizeObserver!.observe(this)