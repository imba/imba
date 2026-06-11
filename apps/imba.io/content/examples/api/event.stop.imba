# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<div.group @click.log('clicked div')>
		<button @click.stop.log('stopped')> 'click.stop'
		<button @click.log('bubble')> 'click'