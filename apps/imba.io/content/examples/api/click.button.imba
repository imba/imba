# [preview=sm]
import 'util/styles'

imba.mount do <div[inset:0 d:grid gaf:column ja:center g:4]>
	# ---
	<button @click.left.log('clicked')> 'Click Left'
	<button @click.middle.log('clicked')> 'Click Middle'
	<button @click.right.log('clicked')> 'Click Right'