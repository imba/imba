describe "@event.debounce" do

	tag App
		<self>
			# basic debouncing
			<button.a @click.log('a').debounce(80ms).log('done')> "Button"

	let app = imba.mount <App>

	test do
		await spec.click(".a")
		await spec.click(".a")
		await spec.click(".a")
		eq $1.log, ['a','a','a']
		await spec.wait(100)
		eq $1.log, ['a','a','a','done']

