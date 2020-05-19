
tag app-root
	def render
		<self.(l:flex)>
			<button$btn1.(m:3 scale:1.25 scale.hover: 1.5)> "Scale always"
			<button$btn2.(m:3 scale.hover:1.3)> "Scale on hover"
		
imba.mount(var app = <app-root>)

# test do
# 	eq window.getComputedStyle(app).position, 'relative'
# 	eq window.getComputedStyle(app).display, 'block'