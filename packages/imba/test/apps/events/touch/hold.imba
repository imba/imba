describe "@touch.stop" do
	tag App
		<self[inset:0] @touch.hold(300ms).log('held')>

	let app = imba.mount <App>
	
	test "basics" do
		await spec.mouse.down(5,5)
		await spec.wait(100)
		await spec.mouse.up!
		eq $1.log,[]
		
	test "holding" do
		# FIXME Should we continue emitting an event immediately when hold
		# has succeeded?
		await spec.mouse.down(5,5)
		await spec.wait(300)
		await spec.mouse.up!
		eq $1.log,['held']
	
	test "moving" do
		# if you move more than a certain threshold, the
		# hold guard will never succeeed
		await spec.mouse.down(5,5)
		await spec.mouse.move(15,15)
		await spec.wait(300)
		await spec.mouse.up!
		eq $1.log,[]
