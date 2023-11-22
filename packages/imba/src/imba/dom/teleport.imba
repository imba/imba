# imba$stdlib=1
import {Element} from './core'
import {Component} from './component.imba'
import {createSlot} from './fragment'

class TeleportHook < Component
	prop to

	def build
		#listeners = []
		win = global
		doc = global.document

	def setup
		setAttribute('style',"display:none !important;")

	def #getSlot name, ctx
		#slot ||= createSlot(0,#parent)
		return #slot

	get #container
		# FIXME the outer container is currently disabled
		unless ##container
			let classes = self.className
			##container = doc.createElement('div')
			##container.className = classes
			##container.style.cssText = "display:contents !important;"
		return ##container

	get domTarget
		#domTarget ||= (to isa Element ? to : (self.closest(to) or doc.querySelector(to)))

	get eventTarget
		domTarget

	get style
		##container ? ##container.style : super

	get classList
		##container ? ##container.classList : super

	get className
		##container ? ##container.className : super

	set className val
		##container ? (##container.className=val) : super

	def #afterVisit
		if mounted? and #slot and !#slot.parentNode
			#slot.#insertInto(target)

	def mount
		for [name,handler,o] in #listeners
			eventTarget.addEventListener(name,handler,o)

		let target = domTarget

		if #slot
			#slot.#insertInto(target)
		return self

	def unmount
		for [name,handler,o] in #listeners
			eventTarget.removeEventListener(name,handler,o)

		if #slot
			#slot.#removeFrom(domTarget)

		#domTarget = null
		return self

	def addEventListener name, handler, o = {}
		handler.#teleport = self
		handler.#self = self

		#listeners.push([name,handler,o])
		if mounted? and eventTarget..addEventListener
			eventTarget.addEventListener(name,handler,o)

class GlobalHook < TeleportHook

	get domTarget
		doc.body

	get eventTarget
		win

	def addEventListener name, handler, o = {}
		handler.#target = domTarget.parentNode
		super

	def on$resize mods,scope, handler, o
		self.addEventListener('resize',handler,o)
		return handler

if global.customElements
	global.customElements.define('i-teleport',TeleportHook)
	global.customElements.define('i-global',GlobalHook)

export def use_dom_teleport
	global.imba.uses_dom_teleport = yes
	yes
