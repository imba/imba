describe "@event.cooldown" do

	tag App
		<self>
			# basic throttling
			<button.a @click.log('a').cooldown(250ms).log('done')> "Button"

			# if the event takes time to finish, throttle will disable
			# handler until it has finished
			<button.b @click.log('b').cooldown(250ms).log('done')> "Button"

	let app = imba.mount <App>

	test do
		await spec.click(".a")
		await spec.click(".a")
		await spec.click(".a")
		eq $1.log, ['a','done','a','a']

	test do
		await spec.click(".b")
		await spec.click(".b")
		await spec.click(".b")
		eq $1.log, ['b','done','b','b']
