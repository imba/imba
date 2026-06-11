# [preview=sm]
import 'util/styles'

imba.mount do <fieldset>
	# ---
	# Removes listener the first time it is triggered
	<button @click.once.log('once!')> 'Click me'
	# Removes lsitener on click only if shift is pressed
	<button @click.shift.once.log('yes!')> "shift-once"
	# Removes listener on click even if shift was not pressed!
	<button @click.once.shift.log('yes!')> "once-shift"
###
You can click the second button as many times you want without shift, but once you've clicked it while holding down shift it the handler will be invoked, and then removed. On the thirt button the `once` modifier appears before shift, so the listener will be removed after the first click, no matter if shift was pressed or not.
###