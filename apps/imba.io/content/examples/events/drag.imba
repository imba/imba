import 'util/styles'
# css body bg:gray1
css drag-me
	d:block pos:relative p:3 m:1
	bg:white bxs:sm rd:sm cursor:default
yes
# ---
tag drag-me
	<self @touch.prevent.moved.sync(self)>
		css bg:white @touch:blue4
			scale:1 @touch:1.2
			x:{x} y:{y} rotate:{x}deg
		<span> 'drag me'

imba.mount <drag-me>