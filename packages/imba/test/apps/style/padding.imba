import 'imba/spec'

tag App
	def render
		<self.app[d:hflex ja:center g:10]>
			<div[p:2px] eq={padding: '2px'}>
			<div[px:2px] eq={padding: '0px 2px'}>
			<div[py:2px] eq={padding: '2px 0px'}>
			<div[py:2px 1px] eq={padding: '2px 0px 1px'}>

imba.mount(let app = <App>)

for child in app.children
	test do eqcss child, child.eq