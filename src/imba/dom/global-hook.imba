import {ImbaElement} from './component'

class GlobalHook < ImbaElement
	def build
		#listeners = []
		win = global
		doc = global.document
		
	def setup
		setAttribute('style',"display:none !important;")
	
	def slot$ name, ctx
		return #slot
	
	get #slot
		unless ##slot
			let classes = self.className
			##slot = doc.createElement('div')
			##slot.className = classes
			##slot.style.cssText = "display:contents !important;"
			
			if mounted?
				doc.body.appendChild(##slot)
		##slot
		
	get style
		##slot ? ##slot.style : super

	get classList
		##slot ? ##slot.classList : super
		
	get className
		##slot ? ##slot.className : super
		
	set className val
		##slot ? (##slot.className=val) : super
		
	def setup
		setAttribute('style',"display:none !important;")
	
	def mount
		for [name,handler,o] in #listeners
			win.addEventListener(name,handler,o)
			
		doc.body.appendChild(##slot) if ##slot
		return

	def unmount
		for [name,handler,o] in #listeners
			win.removeEventListener(name,handler,o)
			
		if ##slot and ##slot.parentNode
			##slot.parentNode.removeChild(##slot)

		return
		
	def addEventListener name, handler, o = {}
		handler.#self = self
		#listeners.push([name,handler,o])
		if !mounted? and win.addEventListener
			win.addEventListener(name,handler,o)

if global.customElements
	global.customElements.define('i-global',GlobalHook)
	
export def use_dom_global_hook
	yes