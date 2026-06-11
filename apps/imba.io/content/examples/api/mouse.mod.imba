# [preview=sm]
import 'util/styles'

imba.mount do
	# ---
	<button @click.mod.log('new tab!') @click.!mod.log('here!')> 'Open'
###
The .mod modifier is a platform-independent way to check if the user
has pressed the meta key (⌘) on mac/ios or the ctrl key on other platforms.
###