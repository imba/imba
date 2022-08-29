tag App
	css 1rdu:10px
	def render
		<self.app>
			<div[rd:1px]> '1px'
			<div[rd:md]> '4px'
			<div[rd:2rdu]> '20px'

imba.mount(let app = <App>)

test do
	for child in app.children
		eqcss child, {borderRadius: child.innerText}