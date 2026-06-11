# [preview=sm]
import 'util/styles'

# ---
# delay subsequent modifiers by duration
imba.mount do <div.group>
	<button @click.wait.log('!')> 'wait'
	<button @click.wait(100ms).log('!')> 'wait 100ms'
	<button @click.log('!').wait(500ms).log('!!')> 'wait 500ms'