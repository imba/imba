describe "@touch" do
	let data = {x:0,y:0}
	let res = null

	tag App
		<self[inset:0]>
			<section[pos:absolute l:20px t:20px size:100px]
				@touch.self.log('a')=(res=e)
			>
				<div[pos:absolute l:0 t:0 size:20px]>

	let app = imba.mount <App>

	test ".self" do
		await imba.commit!
		# this happens inside the nested div, so touch should not be set
		await spec.mouse.down(30,30)
		await imba.commit!
		eq res,null
