# [preview=lg]
import 'util/styles'
css .rect pos:absolute inset:4
# ---
tag Example
	# convert x,y to go from 0 in top left corner to 100 in bottom right
	<self @touch.fit(self,0,100)=(x=e.x,y=e.y)> "x:{x} y:{y}"
# ---
imba.mount <Example.rect>
###
By passing `start` and `end` values, you can very easily convert the coordinate space of the touch. Imba will use linear interpolation to convert x,y relative to the box, to the interpolated values between start and end.
You can use negative values on `start` and `end` as well.
###