# [preview=lg]
import 'util/styles'
css .box pos:relative size:100px ja:center
let str = "Touch + drag inside boxes"
const handler = do(t)
	str = "x:{t.x} y:{t.y}"
# ---
tag Example
	# convert x,y to go from 0 in top left corner to 100 in bottom right
	<self[d:contents]>
		<fieldset[d:grid gaf:column ja:center g:4]>
			<div.box @touch.fit(0,100)=handler> "(0,100)"
			<div.box @touch.fit(0,50)=handler> "(0,50)"
			<div.box @touch.fit(100,-100,2)=handler> "(100,-100,2)"
			<div.box @touch.fit([0,-5],[1,5],0.1)=handler> "([0,-5],[1,5],0.1)"
		<label[ta:center]> str
# ---
imba.mount <Example>
###
By passing `start` and `end` values, you can very easily convert the coordinate space of the touch. Imba will use linear interpolation to convert x,y relative to the box, to the interpolated values between start and end.
You can use negative values on `start` and `end` as well.
###