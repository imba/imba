describe "@event.debounce" do
	let res = null
	tag App
		<self>
			# basic debouncing
			<button.a @click.log('a').debounce(400ms).log('done')=(res=e)> "Button"
	
	let app = imba.mount <App>

	test do
		await spec.click(".a")
		await spec.click(".a")
		await spec.click(".a")
		eq $1.log, ['a','a','a']
		await spec.wait(400)
		eq $1.log, ['a','a','a','done']
		eq res.debounced.length,3

