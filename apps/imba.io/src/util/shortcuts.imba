const KeyLabels =
	esc: '⎋'
	enter: '⏎'
	shift: '⇧'
	command: '⌘'
	option: '⌥'
	alt: '⎇'
	del: '⌦'
	left: '←' # '⇐' # '←'
	right: '→' # '→'
	up: '↑'
	down: '↓'
	backspace: '⌫'

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

var isMac = no
try isMac = global.navigator.platform == 'MacIntel'

import Mousetrap from './mousetrap'

const stopCallback = do(e,el,combo)
	if (' ' + el.className + ' ').indexOf(' mousetrap ') > -1
		return false
		
	if el.mousetrappable
		return false
		
	if Globals[combo]
		return false

	if el.tagName == 'INPUT' && (combo == 'down' or combo == 'up')
		return false
	
	if el.tagName == 'INPUT' || el.tagName == 'SELECT' || el.tagName == 'TEXTAREA'
		return true
		
	if el.contentEditable && (el.contentEditable == 'true' || el.contentEditable == 'plaintext-only' || el.closest('.editable'))
		return true

class HotKeyManager
	static get instance
		$instance ||= new self()

	constructor
		combos = {'*': {}}
		identifiers = {}
		labels = {}
		handler = handle.bind(self)
		mousetrap = null

	def register key,mods = {}
		unless mousetrap
			mousetrap = Mousetrap(document)
			mousetrap.stopCallback = stopCallback
		

		unless combos[key]
			combos[key] = yes
			mousetrap.bind(key,handler)
		if mods.global
			Globals[key] = yes
		self
		
	def comboIdentifier combo
		identifiers[combo] ||= combo.replace(/\+/g,'_').replace(/\ /g,'-').replace(/\*/g,'all')

	def shortcutHTML combo
		("<u>" + comboLabel(combo).split(" ").join("</u><u>") + "</u>").replace('<u>/</u>','<span>or</span>')
		
	def comboLabel combo
		labels[combo] ||= combo.split(" ").map(|v| v.split("+").map(|v| KeyLabels[v] or v.toUpperCase!).join("") ).join(" ")

	def handle e\Event, combo
		# e is the original event
		
		let identifier = comboIdentifier(combo)
		let receivers\HTMLElement[] = Array.from(document.querySelectorAll('[data-hotkey~="' + identifier + '"],[data-hotkey~="all"]'))
		# console.log 'hotkey handle',e,combo,identifier,receivers
		receivers = receivers.reverse!.filter(|r| !r.closest('.hiding,.no-hotkeys,.nokeys') )

		for receiver in receivers
			let params = receiver.hotkey__ or {}
			let data = Object.assign({},params,{combo: combo,event: e, receivers: receivers})

			# what if there is a shortcut event?
			# supposed to only emit for the items listening to specific keys, no?
			let onhotkey = receiver.emit('hotkey',data, bubbles:true, cancelable: true)
			if onhotkey.defaultPrevented
				e.preventDefault!
				break if e.cancelBubble

			elif receiver.matches('input:not([type=button]),select,textarea')
				# should still check various rules?
				e.preventDefault!
				receiver.focus! if receiver.focus
			else
				if params.within and !receiver.parentNode.contains(document.activeElement)
					continue

				if (/command|cmd|ctrl|shift/).test(combo) or params.prevent
					e.preventDefault!
				receiver.click!
			
			unless params.bubble
				break
		self

const manager = HotKeyManager.instance

extend tag element

	set hotkey value
		$hotkey = value
		let mods = hotkey__ ||= {}
		let identifiers = []
		value = value.replace(/mod/g,isMac ? 'command' : 'ctrl')

		for combo in value.split('|')
			manager.register(combo,mods)
			identifiers.push(manager.comboIdentifier(combo))
		
		let label = manager.comboLabel(value)
		dataset.hotkey = identifiers.join(' ')
		style.setProperty('--shortcut',"'{label}'")

	get hotkey
		$hotkey