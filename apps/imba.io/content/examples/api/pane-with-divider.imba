# [preview=md]
import 'util/styles'

# ---
tag Panel
	split = 70

	<self[d:flex pos:absolute inset:0]>
		<div[bg:teal2 flex-basis:{split}%]>
		<div[fls:0 w:2 bg:teal3 @touch:teal5]
			@touch.pin.fit(self,0,100,2)=(split=e.x)>
		<div[bg:teal1 flex:1]>

imba.mount do <Panel>