describe "@event.throttle" do

	tag App
		<self>
			<button.a @click.log('a').throttle(500ms).log('done')> "Button"

	let app = imba.mount <App>

	test do
		await spec.click(".a")
		await spec.click(".a")
		# await spec.click(".a")
		# await spec.click(".a")
		eq $1.log, ['a','done','a']
		await spec.wait(600ms)
		eq $1.log, ['a','done','a','done']
		await spec.click(".a")
		eq $1.log, ['a','done','a','done','a']

		# eq $1.log, ['done','done']
