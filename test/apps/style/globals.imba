
global css app-root
	position: relative
	display: block
	
tag app-root
	def render
		<self>
			<p> "Paragraph"
		
imba.mount(var app = <app-root>)

test do
	eq window.getComputedStyle(app).position, 'relative'
	eq window.getComputedStyle(app).display, 'block'