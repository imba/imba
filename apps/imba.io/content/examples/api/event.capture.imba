# [preview=sm]
import 'util/styles'

imba.mount do <fieldset>
	# ---
	<div @click.capture.stop.log('captured!')>
		<button @click.log('button')> 'Click me'
###
When clicking the button you will see that the click listener on the parent div will actually be triggered first.
###