import 'imba/spec'

tag App

	def render
		<self.app[d:hflex ja:center g:10]>
			css div size:100px fs:xs d:flex ja:center hue:blue @hover:teal
			<div[bxs:xxs]> 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px'
			<div[bxs:xs]> 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px'
			<div[bxs:xs lime]> 'rgba(0, 255, 0, 0.05) 0px 1px 2px 0px'
			<div[bxs:xs blue/30]> 'rgba(0, 0, 255, 0.3) 0px 1px 2px 0px'
			<div[bxs:xxl blue/20,outline blue/100]> 'rgba(0, 0, 255, 0.2) 0px 25px 50px -6px, rgb(0, 0, 255) 0px 0px 0px 3px'
			<div[bxs:xl hue4/100,sm hue4/30]>

imba.mount(let app = <App>)

for child in app.children when child.innerText
	test do
		eqcss child, {boxShadow: child.innerText}