# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<button @pointerdown.pressure.log('pressured?')> 'Button'