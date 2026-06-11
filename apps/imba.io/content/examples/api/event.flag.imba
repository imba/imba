# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<div.group>
		# Add 'busy' html class to button during click
		<button @click.flag('busy')> 'flag self'
		# Optionally supply a selector / element to flag
		<button @click.flag('busy','div').wait(1s)> 'flag div'
