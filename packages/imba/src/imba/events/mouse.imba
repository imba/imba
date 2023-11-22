# imba$stdlib=1
import {MouseEvent} from '../dom/core'

export def use_events_mouse
	global.imba.uses_events_mouse = yes
	yes

extend class MouseEvent

	def @left do button == 0

	def @middle do button == 1

	def @right do button == 2

	def @shift do !!shiftKey

	def @alt do !!altKey

	def @ctrl do !!ctrlKey

	def @meta do !!metaKey

	def @mod do
		let nav = global.navigator.platform
		(/^(Mac|iPhone|iPad|iPod)/).test(nav or '') ? !!metaKey : !!ctrlKey