import './shared.imba'
import 'imba/spec'

tag App

	def render
		<self.app[d:hflex ja:center g:10] .test>
			css @.test fw:600
			css .tast zi:3
			<div .tast eq={fontWeight: 600, zIndex:3}>
			<div .tast eq={zIndex:3}>
			<div.inner eq={fontWeight: 550}>
				css @.inner fw:550

imba.mount(let app = <App>)

for child in app.querySelectorAll('*') when child.eq
	test do eqcss child, child.eq
