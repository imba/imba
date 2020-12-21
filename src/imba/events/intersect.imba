# imba$imbaPath=global

import {Event,CustomEvent,Element} from '../dom/core'

export def events_intersect
	yes

const observers = new (global.WeakMap || Map)
const defaults = {threshold: [0]}
const rootTarget = {}

def Event.intersect$handle
	let obs = event.detail.observer
	return modifiers._observer == obs

def Event.intersect$in
	return event.delta >= 0 and event.entry.isIntersecting

def Event.intersect$out
	return event.delta < 0

def callback name, key
	return do(entries,observer)
		let map = observer.prevRatios ||= new WeakMap
		
		for entry in entries
			let prev = map.get(entry.target) or 0
			let ratio = entry.intersectionRatio
			let detail = {entry: entry, ratio: ratio, from: prev, delta: (ratio - prev), observer: observer }
			let e = new CustomEvent(name, bubbles: false, detail: detail)
			e.entry = entry
			e.isIntersecting = entry.isIntersecting
			e.delta = detail.delta
			e.ratio = detail.ratio
			map.set(entry.target,ratio)
			entry.target.dispatchEvent(e)
		return

def getIntersectionObserver opts = defaults
	let key = opts.threshold.join('-') + opts.rootMargin
	let target = opts.root or rootTarget
	let map = observers.get(target)
	map || observers.set(target,map = {})
	map[key] ||= new IntersectionObserver(callback('intersect',key),opts)

extend class Element
	def on$intersect mods,context
		let obs
		if mods.options
			let th = [] 
			let opts = {threshold:th}

			for arg in mods.options
				if arg isa Element
					opts.root = arg
				elif typeof arg == 'number'
					th.push(arg)
					
			if th.length == 1
				let num = th[0]
				if num > 1
					th[0] = 0
					while th.length < num
						th.push(th.length / (num - 1))

			th.push(0) if th.length == 0
			obs = getIntersectionObserver(opts)
		else
			obs = getIntersectionObserver()

		mods._observer = obs
		obs.observe(this)