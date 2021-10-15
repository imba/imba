import {Event,CustomEvent,Element} from '../dom/core'

let isApple = try (global.navigator.platform or '').match(/iPhone|iPod|iPad|Mac/)

export def use_events_hotkey
	yes

const KeyLabels = {
	esc: '⎋'
	enter: '⏎'
	shift: '⇧'
	command: '⌘'
	mod: isApple ? '⌘' : 'ctrl'
	option: '⌥'
	alt: isApple ? '⌥' : '⎇'
	del: '⌦'
	backspace: '⌫'

}

const Globals = {
	"command+1": yes
	"command+2": yes
	"command+3": yes
	"command+4": yes
	"command+5": yes
	"command+6": yes
	"command+7": yes
	"command+8": yes
	"command+9": yes
	"command+0": yes
	"command+n": yes
	"command+f": yes
	"command+k": yes
	"command+j": yes
	"command+s": yes
	"esc": yes
	"shift+command+f": yes
}

class HotkeyEvent < CustomEvent
	
	def @focus expr
		let el = this.target
		let doc = el.ownerDocument
		
		if expr
			el = el.querySelector(expr) or el.closest(expr) or doc.querySelector(expr)

		if el == doc.body
			doc.activeElement.blur! unless doc.activeElement == doc.body
		else
			el.focus!
			
		return yes

import Mousetrap from './mousetrap'

const stopCallback = do |e,el,combo|	
	if (' ' + el.className + ' ').indexOf(' mousetrap ') > -1
		return false
		
	if el.mousetrappable
		return false

	if el.tagName == 'INPUT' && (combo == 'down' or combo == 'up')
		return false
	
	if el.tagName == 'INPUT' || el.tagName == 'SELECT' || el.tagName == 'TEXTAREA'
		if Globals[combo]
			e.#inInput = yes
			e.#inEditable = yes
			return false
		return true
		
	if el.contentEditable && (el.contentEditable == 'true' || el.contentEditable == 'plaintext-only' || el.closest('.editable'))
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

	def register key,mods = {}
		unless mousetrap
			mousetrap = Mousetrap(document)
			mousetrap.stopCallback = stopCallback

		unless combos[key]
			combos[key] = yes
			mousetrap.bind(key,handler)

		if mods.capture
			Globals[key] = yes
		self
		
	def comboIdentifier combo
		identifiers[combo] ||= combo.replace(/\+/g,'_').replace(/\ /g,'-').replace(/\*/g,'all').replace(/\|/g,' ')

	def shortcutHTML combo
		("<u>" + comboLabel(combo).split(" ").join("</u><u>") + "</u>").replace('<u>/</u>','<span>or</span>')
		
	def comboLabel combo
		labels[combo] ||= combo.split(" ").map(do $1.split("+").map(do (KeyLabels[$1] or $1).toUpperCase!).join("") ).join(" ")
		
	def matchCombo str
		yes

	def handle e\Event, combo
		let source = e.target.#hotkeyTarget or e.target
		let targets\HTMLElement[] = Array.from(document.querySelectorAll('[data-hotkey]'))
		let root = source.ownerDocument
		let group = source
		
		# find the closest hotkey 
		while group and group != root
			if group.hotkeys === true
				break
			group = group.parentNode

		targets = targets.reverse!.filter do |el|
			return no unless el.#hotkeyCombos and el.#hotkeyCombos[combo]

			let par = el
			while par and par != root
				if par.hotkeys === false
					return no
				par = par.parentNode
			return yes
			
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
				if handler.#combos[combo]
					if !e.#inEditable or handler.capture?
						let el = handler.#target
						if group.contains(el) or el.contains(group) or handler.global?
							handlers.push(handler)

		for handler,i in handlers
			handler.handleEvent(event)
			e.preventDefault! if !handler.passive? or event.#defaultPrevented
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
		let isApple = (global.navigator.platform or '').match(/iPhone|iPod|iPad|Mac/)
		for handler in #hotkeyHandlers
			let mods = handler.params
			let key = mods.options[0]
			let prev = handler.#key
			if handler.#key =? key
				handler.#combos = {}
				let combos = key.replace(/\bmod\b/g,isApple ? 'command' : 'ctrl')
				for combo in combos.split('|')
					hotkeys.register(combo,mods)
					handler.#combos[combo] = yes
			Object.assign(all,handler.#combos)

		#hotkeyCombos = all
		dataset.hotkey = Object.keys(all).join(' ')
		self