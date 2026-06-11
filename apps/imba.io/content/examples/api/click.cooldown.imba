# [preview=sm]
import 'util/styles'

# ---
# disable handler for duration after triggered
imba.mount do <fieldset>
	<button @click.cooldown.log('clicked')> 'click me'
	<div> "Not clickable within 1 second of previous invocation."