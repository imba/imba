tag app-item
	css p:2 bg:teal2 pos:relative
	
	def resize e
		console.log 'hello!!',e.type

	def render
		<self @pointerdown.lock=resize> "Item"
		
tag app-touched
	css p:2 bg:teal2 pos:absolute
	
	def touch e
		console.log 'touching',e.type,e.dx,e.dy

	def render
		<self @touch.lock=touch> "Item"

# Play around
tag app-example
		
	prop ratio
	
	def render
		<self>
			<app-item>
			<app-item>
			<app-touched> 

imba.mount do <app-example[d:block pt:8]>