# imba$imbaPath=global
import {Event,CustomEvent,Element} from '../dom/core'
import * as helpers from './helpers'

export def use_events_mutate
	yes

class MutationEvent < CustomEvent

extend class Element

	def on$mutate(mods, context, handler, opts)
		# only one observer per element?
		handler.observer ||= new MutationObserver do(mutations)
			let e = new CustomEvent('mutate', bubbles: false, detail: mutations)
			e.#extendType(MutationEvent)
			self.dispatchEvent(e)

		let o = handler.#options = {}

		if mods.subtree
			o.subtree = true

		if mods.childList
			o.childList = true

		if !o.attributes and !o.childList
			o.childList = true

		handler.observer.observe(self,o)

		self.addEventListener('mutate',handler,opts)
		return handler