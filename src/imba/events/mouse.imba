import {MouseEvent} from '../dom/core'

export def use_mouse_events
	yes

extend class MouseEvent

	def @left do button == 0

	def @middle do button == 1

	def @right do button == 2

	def @shift do !!shiftKey

	def @alt do !!altKey

	def @ctrl do !!ctrlKey

	def @meta do !!metaKey