# [preview=sm]
import 'util/styles'

imba.mount do <fieldset>
	# ---
	<input placeholder="Focus me..."
		@keydown.left.log('left!')
		@keydown.right.log('right!')
		@keydown.down.log('down!')
		@keydown.up.log('up!')
		@keydown.enter.log('enter!')
		@keydown.esc.log('esc!')
		@keydown.del.log('del!')
		@keydown.tab.log('tab!')
		@keydown.space.log('space!')
	>