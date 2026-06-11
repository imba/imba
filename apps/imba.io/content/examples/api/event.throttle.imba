# [preview=sm]
import 'util/styles'

# ---
imba.mount do <fieldset>
	<button @click.throttle(1s).log('trigger!')> 'Throttle'
	<button @click.cooldown(1s).log('trigger!')> 'Cooldown'
	<button @click.debounce(1s).log('trigger!')> 'Debounce'
	<input @input.debounce.log('query') placeholder="Search...">
