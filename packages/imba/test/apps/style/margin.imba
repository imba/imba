import 'imba/spec'

tag App
	def render
		<self.app[d:hflex ja:center g:10]>
			<div[m:2px] eq={margin: '2px'}>
			<div[mx:2px] eq={margin: '0px 2px'}>
			<div[my:2px] eq={margin: '2px 0px'}>
			<div[my:2px 1px] eq={margin: '2px 0px 1px'}>

imba.mount(let app = <App>)

for child in app.children
	test do eqcss child, child.eq