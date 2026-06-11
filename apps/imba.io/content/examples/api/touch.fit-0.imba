# [preview=lg]
import 'util/styles'
css .box w:calc(100vw - 80px)
# ---
tag Unfitted
	<self @touch=(x=e.x)> "window.x {x}"
tag Fitted
	<self @touch.fit(self)=(x=e.x)> "box.x {x}"
tag Snapped
	<self @touch.fit(self,2)=(x=e.x)> "box.x {x}"

imba.mount do <>
	<Unfitted.box>
	<Fitted.box>
	<Snapped.box>
###
This is a shared comment here
###