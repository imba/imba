import {Element} from './core'
import {ImbaElement} from './component.imba'

class TeleportHook < ImbaElement
	prop to

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
				domTarget.appendChild(##slot)
				# const toElement = (doc.querySelector to) or doc.body
				# toElement.appendChild(##slot)
		##slot
		
	get domTarget
		#domTarget ||= (to isa Element ? to : (self.closest(to) or doc.querySelector(to)))
		
	get eventTarget
		domTarget
		
	get style
		##slot ? ##slot.style : super

	get classList
		##slot ? ##slot.classList : super
		
	get className
		##slot ? ##slot.className : super
		
	set className val
		##slot ? (##slot.className=val) : super

	def mount
		
		for [name,handler,o] in #listeners
			eventTarget.addEventListener(name,handler,o)
		# const toElement = (doc.querySelector to) or doc.body
		domTarget.appendChild(##slot) if ##slot
		return self

	def unmount
		for [name,handler,o] in #listeners
			eventTarget.removeEventListener(name,handler,o)
			
		if ##slot and ##slot.parentNode
			##slot.parentNode.removeChild(##slot)
		
		#domTarget = null
		return self
		
	def addEventListener name, handler, o = {}
		handler.#self = self
		#listeners.push([name,handler,o])
		if mounted? and eventTarget..addEventListener
			eventTarget.addEventListener(name,handler,o)
		

class GlobalHook < TeleportHook
	
	get domTarget
		doc.body
		
	get eventTarget
		win
	
if global.customElements
	global.customElements.define('i-teleport',TeleportHook)
	global.customElements.define('i-global',GlobalHook)
	
export def use_dom_teleport
	yes
