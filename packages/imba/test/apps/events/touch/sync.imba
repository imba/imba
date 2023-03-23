describe "@touch" do
	let data = {x:0,y:0}
	let res = null

	tag App
		<self[inset:0]>
			<section[pos:absolute l:20px t:20px size:100px]
				@touch.reframe(0,10,1).sync(data).log('a')=(res=e)
			> "Rect"

	let app = imba.mount <App>

	test "start" do
		await imba.commit!
		await spec.mouse.down(30,30)
		await imba.commit!
		eq res.x,1
		eq res.y,1

		await spec.mouse.move(40,40)
		eq res.x,2
		eq data.x,1
