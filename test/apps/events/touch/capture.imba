describe "@touch.capture" do

	tag App
		def handled touch
			yes
			
		# preventing a touch event in handler should suppress the click?
		<self[inset:0] @touch.end.log('touch')=handled>
			<button[pos:absolute size:40px] @click.log('click')> "Button"

	let app = imba.mount <App>
	
	test "click" do
		await imba.commit!
		await spec.mouse.click(20,20)
		eq $1.log, ['touch','click']
		
	test "moved" do
		await imba.commit!
		await spec.mouse.down(20,20)
		await spec.mouse.move(25,25)
		await spec.mouse.up()
		eq $1.log, ['touch','click']

describe "@touch.capture2" do

	tag App
		# .moved should automatically suppress a click 
		<self[inset:0] @touch.moved.end.log('touch')>
			<button[pos:absolute size:40px] @click.log('click')> "Button"

	let app = imba.mount <App>
	
	test "not moved" do
		await imba.commit!
		await spec.mouse.click(20,20)
		eq $1.log, ['click']
		
	test "moved" do
		await imba.commit!
		await spec.mouse.down(20,20)
		await spec.mouse.move(30,30)
		await spec.mouse.up()
		eq $1.log, ['touch']

