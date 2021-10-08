describe "@touch" do
	let res = {}
	tag App
		<self>
			<div.any
				@pointerdown=(res.pointer = e)
				@click=(res.click = e)> "Button"

	let app = imba.mount <App>
	
	test "support" do
		await spec.click('.any')
		ok res.click isa MouseEvent
		ok res.pointer isa PointerEvent