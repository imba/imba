describe "@event.throttle" do

	tag App
		<self>
			# basic throttling
			<button.a @click.log('a').throttle(250ms).log('done')> "Button"

	let app = imba.mount <App>

	test do
		await spec.click(".a")
		await spec.click(".a")
		await spec.click(".a")
		eq $1.log, ['a','done','a','a']
