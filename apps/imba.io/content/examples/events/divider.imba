import 'util/styles'
global css body > * pos:abs inset:0 fs:xs
global css aside bg:gray1
# ---
tag Panel
	split = 30

	<self[d:flex]>
		<aside[flb:{split}%]> "Menu"
		<div[w:2 fls:0 bg:sky3 bg@touch:sky5]
			@touch.pin.fit(self,0,100)=(split=e.x)>
		<section>

imba.mount <Panel>