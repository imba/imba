# [preview=sm]
import 'util/styles'

# only trigger if event.target.matches(selector) is true
imba.mount do <fieldset>
	# ---
	<button @click.log('!')> 'Button'
	<button @click.sel('.pri').log('!!')> 'Button'
	<button.pri @click.sel('.pri').log('!!!')> 'Button'