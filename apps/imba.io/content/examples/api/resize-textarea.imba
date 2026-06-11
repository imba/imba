# [preview=md]
import 'util/styles'
# ---
tag App
	box = {}

	<self[d:block inset:0 ta:center]>
		<div[fs:sm]> "Size is {box.width} - {box.height}"
		<textarea[w:100px h:40px resize:both] @resize=(box=e.rect)>

imba.mount <App>