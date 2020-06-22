tag app-item
	css p:2 bg:teal2 pos:relative
	
	def resize e
		console.log 'hello!!',e.type

	def render
		<self @pointerdown.lock=resize> "Item"
		
tag app-touched
	css p:2 pos:absolute bg:teal2 @touch:teal3
	
	prop x = 0
	prop y = 0
	
	def touch e
		console.log 'touching',e.type,e.dx,e.dy
		x = e.dx
		y = e.dy
		render!

	def render
		<self[x:{x} y:{y}] @touch=touch> "Item"

# Play around
tag app-example
		
	prop ratio
	
	def render
		<self>
			<app-item>
			<app-item>
			<app-touched> 

imba.mount do <app-example[d:block pt:8]>