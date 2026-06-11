# [preview=xl]
import 'util/styles'
# css body bg:gray1
# ---
tag drag-me
	css d:block pos:relative p:3 m:1
		bg:white bxs:sm rd:sm cursor:default
		@touch scale:1.02
		@move scale:1.05 rotate:2deg zi:2 bxs:lg

	def build
		x = y = 0

	def render
		<self[x:{x} y:{y}] @touch.moved.sync(self)> 'drag me'

imba.mount do <div.grid>
	<drag-me>
	<drag-me>
	<drag-me>