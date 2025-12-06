# imba$imbaPath=global
# imba$stdlib=1
import {Event,CustomEvent,Element} from '../dom/core'
import * as helpers from './helpers'

export def use_events_mutate
	global.imba.uses_events_mutate = yes
	yes

class MutationEvent < CustomEvent

extend class Element

	def on$mutate(mods, context, handler, opts)
		# only one observer per element?
		handler.observer ||= new MutationObserver do(mutations)
			let e = new CustomEvent('mutate', bubbles: (!!mods.bubble), detail: mutations)
			e.#extendType(MutationEvent)
			self.dispatchEvent(e)

		let o = handler.#options = {}

		if mods.subtree
			delete mods.subtree
			o.subtree = true

		if mods.text
			delete mods.text
			o.characterData = true
			o.characterDataOldValue = true

		if mods.childList
			delete mods.childList
			o.childList = true

		if mods.attributes
			delete mods.attributes
			o.attributes = true

		if !o.attributes and !o.childList
			o.childList = true

		handler.observer.observe(self,o)

		self.addEventListener('mutate',handler,opts)
		return handler