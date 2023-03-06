describe "@touch" do
	let data = {x:0,y:0}
	let res = null

	tag App
		<self[inset:0]>
			<section[pos:absolute l:20px t:20px size:100px]
				@touch.flag-hello=(res=e)
			> "Rect"

	let app = imba.mount <App>

	test ".flag" do
		await imba.commit!
		await spec.mouse.down(30,30)
		await imba.commit!
		await spec.wait(400)
		ok !!app.querySelector('section.hello')

		# eq res.x,1
		# eq res.y,1
		# await spec.mouse.up!
		# ok !app.querySelector('section.hello')
