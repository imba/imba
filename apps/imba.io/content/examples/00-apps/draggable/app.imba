tag draggable-item
	css w:20 p:4 m:6 pos:relative d:block
	css @touch scale:1.05 rotate:2deg zi:2
	css @move scale:1.05 rotate:2deg zi:2

	def build
		x = y = 0

	def render
		<self[x:{x} y:{y}] @touch.moved.sync(self)> 'drag me'

imba.mount do <div>
	<draggable-item[bg:blue3]>
	<draggable-item[bg:teal3]>
	<draggable-item[bg:orange3]>