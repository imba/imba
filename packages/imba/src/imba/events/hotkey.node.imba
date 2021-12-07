import {humanize,htmlify} from './hotkey.shared'

export def use_events_hotkey
	yes

export const hotkeys = new class HotKeyManager

	def humanize combo, platform = 'auto'
		humanize(combo,platform)

	def htmlify combo, platform = 'auto'
		htmlify(combo,platform)