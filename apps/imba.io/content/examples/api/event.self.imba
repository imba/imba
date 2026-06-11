# [preview=sm]
import 'util/styles'

imba.mount do <fieldset>
	# ---
	# Wont trigger when clicking inside the <b>
	<button @click.self.log('clicked!')> "Button"
		<b> "Nested"