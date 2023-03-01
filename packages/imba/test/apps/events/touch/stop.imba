describe "@touch.stop" do
	tag App
		<self[inset:0]
			@touch.self.stop.log('a')
			@touch.log('b')
		>
			<div[pos:absolute t:10px l:10px size:20px]>

	let app = imba.mount <App>

	test "only one" do
		await spec.mouse.touch([5,5],[6,6])
		eq $1.log,['a','a','a']

	test "in child" do
		await spec.mouse.touch([11,11],[12,12])
		eq $1.log,['b','b','b']
