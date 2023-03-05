tag app-item
	css p:2 pos:relative bg:teal2 @touch:teal3
	
	prop x = 0
	prop y = 0
	
	def touch e
		console.log 'touching',e.type,e.dx,e.dy
		x = e.dx
		y = e.dy
		render!

	def render
		<self[x:{x} y:{y}] @touch.log('hello',1,2)=touch> "Item"

# Play around
tag app-example
		
	prop ratio
	
	def render
		<self>
			<app-item>
			<app-item>
			<app-item> 

imba.mount do <app-example[d:block pt:8]>