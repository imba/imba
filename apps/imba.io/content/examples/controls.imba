import 'util/styles'

export tag Box
	css self
		pos:relative
		bg:teal3 c:gray9/70 rd:md o:0.9
		w:>24 h:10 m:1 px:4 fs:sm
		d:flex ja:center
		cursor:default
		&.covered bg:red4

		@nth-of-type(1) bg:blue3
		@nth-of-type(2) bg:teal3
		@nth-of-type(3) bg:purple3
		@nth-of-type(4) bg:indigo3
		@nth-of-type(5) bg:pink3
		@nth-of-type(6) bg:yellow3

	x = 0
	y = 0

	<self[x:{x} y:{y}] @touch.moved.sync(self)> <slot> "box"