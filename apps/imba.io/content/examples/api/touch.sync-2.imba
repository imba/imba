# [preview=md] [title=sync( data, xname = 'x', yname = 'y' )]
import 'util/styles'

# ---
const data = {a:0,b:0}
imba.mount do <>
	<div[w:80px].box @touch.sync(data,'a','b')> 'drag'
	<label> "a:{data.a} b:{data.b}"
###
If you want to sync other property names than x and y you can specify the names as the second and third argument of the .sync modifier.
###