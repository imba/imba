# imba$stdlib=1
import {Event,CustomEvent,Element} from '../dom/core'

let isApple = try (global.navigator.platform or '').match(/iPhone|iPod|iPad|Mac/)

export def use_events_hotkey
	global.imba.uses_events_hotkey = yes
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

class HotKeyManager
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

	def handleEvent e
		let res = mousetrap..handleKeyEvent(e)
		return res

	def handle e\Event, combo
		let source = e.target and e.target.#hotkeyTarget or e.target or global.document.body
		let targets\HTMLElement[] = Array.from(document.querySelectorAll('[data-hotkey]'))
		let root = source.ownerDocument
		let group = source
		let handlers = []

		# find the closest hotkey
		while group and group != root
			if group.hotkeys === true
				break
			group = group.parentNode

		targets = targets.reverse!.filter do |el|
			let combos = el.#hotkeyCombos
			let exact = combos and combos[combo]
			let catchall = combos and combos['*']
			return no unless exact or catchall
			let handlers = el.#hotkeyHandlers

			let par = el
			while par and par != root
				if par.hotkeys === false
					return no
				elif par.hotkeys === true # this is a group
					if !par.contains(source)
						let skip = yes
						for handler in handlers
							if (handler.#combos[combo] or handler.#combos['*'])
								skip = no if handler.global?
								# FIXME Inconsistent if group contains one non-global as well
						return no if skip
				par = par.parentNode
			return yes

		let focus = document.activeElement

		# if there are multiple targets - prefer the ones that are visible
		if targets.length > 1
			# see if some of the handlers are contained by 
			
			let infocus = targets.filter do focus.contains($1)
			if infocus.length
				targets = infocus

			let visible = targets.filter do try !$1.hidden?
			targets = visible if visible.length > 0

		return unless targets.length

		let beforeevent = new CustomEvent('beforehotkey', bubbles: true, detail: detail)
		beforeevent.#extendType(HotkeyEvent)
		beforeevent.hotkey = combo
		source.dispatchEvent(beforeevent)

		if beforeevent.#defaultPrevented
			return

		let detail = {combo: combo, originalEvent: e, targets: targets}
		let event = new CustomEvent('hotkey', bubbles: true, detail: detail)
		event.#extendType(HotkeyEvent)

		event.originalEvent = e
		event.hotkey = combo

		source.dispatchEvent(event)

		for receiver in targets
			for handler in receiver.#hotkeyHandlers
				if handler.#combos[combo] or handler.#combos['*']
					if handler.params.local and !handler.#target.contains(source)
						continue

					if handler.params.unobstructed
						continue unless receiver.unobstructed?

					if !e.#inEditable or (handler.capture? or handler.params.force)
						let el = handler.#target
						if (group and (group.contains(el) or el.contains(group))) or (handler.global?)
							handlers.push(handler)

		let handled = []

		for handler,i in handlers
			let res
			if !e.repeat or handler.params.repeat
				res = handler.handleEvent(event)

			let last = handler.lastState or {}

			handled.push(last)

			e..preventDefault! if (!handler.passive? and last.called) or event.#defaultPrevented

			break unless (handler.passive? or (last.called == no and !event.#stopPropagation and !event.#defaultPrevented))

		return handled

export const hotkeys = new HotKeyManager

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
