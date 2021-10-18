describe "@touch.capture" do
	
	
		
	tag App
		css div pos:relative h:10px w:200px
		css button pos:absolute h:5px w:200px of:hidden
			
		def handled touch
			yes
			
		# preventing a touch event in handler should suppress the click?
		<self[inset:0]>
		
			# Click will happen when clicking button
			<div @touch.end.log('touch')>
				<button @click.log('click')> "Button"
			
			# the .prevent will hinder click from happening
			<div @touch.prevent.end.log('touch')>
				<button @click.log('click')> "Button"
				
			# moved modifier will automatically prevent inner clicks
			<div @touch.moved.end.log('touch')>
				<button @click.log('click')> "Button"
			
			# <div[inset:0] @touch.end.log('touch')=handled>
			# <button[pos:absolute size:40px] @click.log('click')> "Button"

	let app = imba.mount <App>
	
	test "not suppressed" do
		await spec.mouse.click(2,2)
		eq $1.log, ['touch','click']
		
	test ".prevent" do
		await spec.mouse.click(2,12)
		eq $1.log, ['touch']
		
	test ".moved still" do
		await spec.mouse.click(2,22)
		eq $1.log, ['click']
	
	test ".moved moving" do
		await spec.mouse.touch([2,22],[12,22])
		eq $1.log, ['touch']
