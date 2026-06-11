# [preview=md]
import 'util/styles'
css .rect pos:absolute inset:4

# ---
tag Example
	css bg:gray2 @touch:gray3 @move:green3
	<self @touch.moved(30px,'left')=(x=e.x,y=e.y)> "x {x} | y {y}"
# ---
imba.mount do <Example.rect>
###
Won't trigger until moved 30px to the left
###