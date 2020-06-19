
tag app-root
	def render
		<self[d:flex]>
			<button$btn1[m:3 scale:1.25 @hover: 1.5]> "Scale always"
			<button$btn2[m:3 scale@hover:1.3 transition:250ms back-out]> "Scale on hover"
		
imba.mount(<app-root>)

# test do
# 	eq window.getComputedStyle(app).position, 'relative'
# 	eq window.getComputedStyle(app).display, 'block'