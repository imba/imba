import {CustomEvent,Element} from '../dom'

const observers = {}

class IntersectEvent < CustomEvent
	def in$mod state
		let detail = state.event.detail
		let ratio = detail.intersectionRatio
		let last = state.handler.lastRatio
		state.handler.lastRatio = ratio
		return !last or last < ratio

	def out$mod state
		let detail = state.event.detail
		let ratio = detail.intersectionRatio
		let last = state.handler.lastRatio
		state.handler.lastRatio = ratio
		return !ratio or last > ratio

def callback name
	return do |entries|
		for entry in entries
			let e = IntersectEvent.new(name, bubbles: false, detail: entry)
			entry.target.dispatchEvent(e)

def getIntersectionObserver
	observers.intersect ||= IntersectionObserver.new(
		callback('intersect'),
		{threshold: [0,1]}
	)

Element.prototype.on$intersect = do |mods,context|
	let obs
	if mods.options
		let opts = Object.assign({event: 'intersect'},mods.options[0])
		if opts.root isa String
			opts.root = document.querySelector(opts.root)
		let ev = delete opts.event
		obs = mods.options.obs = IntersectionObserver.new(callback(ev),opts)
	else
		obs = getIntersectionObserver(mods)
	obs.observe(this)