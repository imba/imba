# [preview=sm]
import 'util/styles'
imba.mount do <div[inset:0 d:grid gaf:column ja:center g:4]>
	# ---
	<button @pointerdown.mouse.log('mouse!')> 'Mouse Only'
	<button @pointerdown.pen.log('pen!')> 'Pen Only'
	<button @pointerdown.touch.log('touch!')> 'Touch Only'