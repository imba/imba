# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<div.group @select=console.log(e.type,e.detail)>
		<button @click.emit('select')> 'emit'
		<button @click.emit('select',{a:1,b:2})> 'with data'