# [preview=md] 
import 'util/styles'

# ---
const pos = {x:0,y:0}
imba.mount do <>
	<div[w:60px x:{pos.x} y:{pos.y}].box @touch.sync(pos)> 'drag'
	<div[w:60px x:{pos.y} y:{pos.x}].box> 'flipped'
###
The `x` and `y` values of `pos` is updated by the touch handler. When a touch starts it remembers the initial values of pos and only applies the delta.
###