# [preview=lg] [title=Custom Slider]
import 'util/styles'

global css body > * w:50vw m:2 h:4 bg:blue3 pos:relative rd:sm
# css .track h:4 w:100% bg:blue3 pos:relative rd:sm
css .thumb h:4 w:2 bg:blue7 d:block pos:absolute x:-50% t:50% y:-50% rd:sm
css .thumb b x:-50% l:50% b:100% w:5 ta:center pos:absolute d:block fs:xs c:gray6

# ---
tag Slider
	min = -50
	max = 50
	step = 1
	value = 0

	<self @touch.fit(min,max,step)=(value = e.x)>
		<.thumb[l:{100 * (value - min) / (max - min)}%]> <b> value

imba.mount do <>
	<Slider min=0 max=1 step=0.1>
	<Slider min=-100 max=100 step=1>
	<Slider min=10 max=-10 step=0.5>
###

###