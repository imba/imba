# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<a href='https://google.com' @click.prevent.log('prevented')> 'Google.com'
###
The default action of clicking this link is prevented.
###