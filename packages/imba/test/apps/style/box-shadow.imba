tag App

	def render
		<self.app>
			<div[shadow:xxs]> 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px'
			<div[shadow:xs]> 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px'

imba.mount(let app = <App>)

test do
	for child in app.children
		eqcss child, {boxShadow: child.innerText}