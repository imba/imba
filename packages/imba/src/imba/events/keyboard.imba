import {KeyboardEvent} from '../dom/core'

export def use_events_keyboard
	yes

extend class KeyboardEvent

	def @esc do keyCode == 27
	def @tab do keyCode == 9
	def @enter do keyCode == 13
	def @space do keyCode == 32
	def @up do keyCode == 38
	def @down do keyCode == 40
	def @left do keyCode == 37
	def @right do keyCode == 39
	def @del do keyCode == 8 or keyCode == 46
	def @key code
		if typeof code == 'string'
			return key == code
		elif typeof code == 'number'
			return keyCode == code