import {Event,CustomEvent,Element} from '../dom/core'

let isApple = try (global.navigator.platform or '').match(/iPhone|iPod|iPad|Mac/)

export def use_events_hotkey
	yes

import {humanize,htmlify} from './hotkey.shared'

const Globals = {"esc": yes}

class HotkeyEvent < CustomEvent

	def @focus expr
		let el = #context.element
		let doc = el.ownerDocument

		if expr
			el = el.querySelector(expr) or el.closest(expr) or doc.querySelector(expr)

		if el == doc.body
			doc.activeElement.blur! unless doc.activeElement == doc.body
		else
			el.focus!

		return yes

	def @local
		return yes

	def @repeat
		return yes

import Mousetrap from './mousetrap'

const stopCallback = do |e,el,combo|	
	if el.tagName == 'INPUT' && (combo == 'down' or combo == 'up')
		return false

	if el.tagName == 'INPUT' || el.tagName == 'SELECT' || el.tagName == 'TEXTAREA'
		if Globals[combo]
			e.#inInput = yes
			e.#inEditable = yes
			return false
		return true

	if el.contentEditable && (el.contentEditable == 'true' || el.contentEditable == 'plaintext-only')
		if Globals[combo]
			e.#inEditable = yes
			return false
		return true

	return false

export const hotkeys = new class HotKeyManager
	def constructor
		combos = {'*': {}}
		identifiers = {}
		labels = {}
		handler = handle.bind(self)
		mousetrap = null
		hothandler = handle.bind(self)

	def addKeycodes obj
		Mousetrap.addKeycodes(obj)

	def trigger combo
		mousetrap..trigger(combo)

	def register key,mods = {}
		unless mousetrap
			mousetrap = Mousetrap(document)
			mousetrap.stopCallback = stopCallback

		unless combos[key]
			combos[key] = yes
			mousetrap.bind(key,handler)

		if mods.capture or mods.force
			Globals[key] = yes
		self

	def comboIdentifier combo
		identifiers[combo] ||= combo.replace(/\+/g,'_').replace(/\ /g,'-').replace(/\*/g,'all').replace(/\|/g,' ')

	def humanize combo, platform = 'auto'
		humanize(combo,platform)

	def htmlify combo, platform = 'auto'
		htmlify(combo,platform)

	def matchCombo str
		yes

	def handle e\Event, combo
		let source = e.target and e.target.#hotkeyTarget or e.target or global.document.body
		let targets\HTMLElement[] = Array.from(document.querySelectorAll('[data-hotkey]'))
		let root = source.ownerDocument
		let group = source

		# find the closest hotkey
		while group and group != root
			if group.hotkeys === true
				break
			group = group.parentNode

		targets = targets.reverse!.filter do |el|
			let combos = el.#hotkeyCombos
			return no unless combos and (combos[combo] or combos['*'])

			let par = el
			while par and par != root
				if par.hotkeys === false
					return no
				par = par.parentNode
			return yes

		# if there are multiple targets - only include the ones that are visible
		if targets.length > 1
			let visible = targets.filter do
				let rect = $1.getBoundingClientRect()
				$1.offsetParent or (rect.width > 0 or rect.height > 0)
			targets = visible if visible.length > 0

		return unless targets.length

		let detail = {combo: combo, originalEvent: e, targets: targets}
		let event = new CustomEvent('hotkey', bubbles: true, detail: detail)
		event.#extendType(HotkeyEvent)

		event.originalEvent = e
		event.hotkey = combo

		source.dispatchEvent(event)
		let handlers = []

		for receiver in targets
			for handler in receiver.#hotkeyHandlers
				if handler.#combos[combo] or handler.#combos['*']
					if handler.params.local and !handler.#target.contains(source)
						continue

					if !e.#inEditable or (handler.capture? or handler.params.force)
						let el = handler.#target
						if group.contains(el) or el.contains(group) or (handler.global?)
							handlers.push(handler)

		for handler,i in handlers
			if !e.repeat or handler.params.repeat
				handler.handleEvent(event)

			e..preventDefault! if !handler.passive? or event.#defaultPrevented
			break unless handler.passive?
		self

const DefaultHandler = do(e,state)
	let el = state.element

	if el isa Element
		if el.matches('input,textarea,select,option')
			el.focus!
		else
			el.click!
	return

DefaultHandler.passive = yes

extend class Element

	def on$hotkey mods, scope, handler, o
		#hotkeyHandlers ||= []
		#hotkeyHandlers.push(handler)
		# addEventListener('hotkey',handler,o)

		handler.#target = self
		# add a default handler
		mods.$_ ||= [DefaultHandler]

		mods.#visit = do #updateHotKeys!
		#updateHotKeys!
		return handler

	def #updateHotKeys
		let all = {}
		for handler in #hotkeyHandlers
			let mods = handler.params
			let key = mods.options[0]
			if handler.#key =? key
				handler.#combos = {}
				for combo in key.split('|')
					hotkeys.register(combo,mods)
					handler.#combos[combo] = yes
			Object.assign(all,handler.#combos)

		#hotkeyCombos = all
		dataset.hotkey = Object.keys(all).join(' ')
		self