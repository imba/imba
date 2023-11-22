# imba$imbaPath=global
# imba$stdlib=1

import {Event,PointerEvent,Element} from '../dom/core'
import {listen,once,emit,unlisten} from '../utils'

import {use_events_mouse} from './mouse'
use_events_mouse!

import * as helpers from './helpers'

export def use_events_pointer
	global.imba.uses_events_pointer = yes
	yes

# Adding the pointerevent modifiers
extend class PointerEvent

	def @primary
		return !!isPrimary and (pointerType != 'mouse' or button == 0)

	def @mouse
		return pointerType == 'mouse'

	def @pen
		return pointerType == 'pen'

	def @touch
		return pointerType == 'touch'

	def @pressure threshold = 0.5
		return pressure >= threshold

	def @lock
		return yes