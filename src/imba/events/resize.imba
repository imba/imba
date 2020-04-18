
class ResizeEvent < CustomEvent

var resizeObserver = null

def getResizeObserver
	resizeObserver ||= ResizeObserver.new do |entries|
		for entry in entries
			let e = ResizeEvent.new('resize', bubbles: false, detail: entry)
			entry.target.dispatchEvent(e)
		return

extend class Element

	def on$resize(chain, context)
		getResizeObserver!.observe(this)