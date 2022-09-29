# SKIP

tag variations

	<self[d:hflex flw:wrap g:4]> <slot>


tag styled

	<self[size:100px d:hflex ja:center]>
		css self >>> * size:50px d:hflex ja:center bg:gray3
		<slot>

tag toggleable
	showing = yes
	def toggle
		showing = !showing
		render!

	<self[size:100px d:hflex ja:center] @click=toggle>
		css self >>> * size:50px d:hflex ja:center bg:gray3
		if showing
			<slot>

global.p = console.log.bind(console)