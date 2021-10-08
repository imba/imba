describe "@event.flag" do

	tag App
		<self.app>
			<button.a @click.flag-busy.wait(150ms).log('done')> "Button"
			# pass in selector as first argument to alternatively flag an element
			# up the chain
			<button.b @click.flag-busy('.app').wait(150ms).log('done')> "Button"

	let app = imba.mount <App>

	let flag = do(sel,expect)
		await spec.click(sel)
		ok document.querySelector(expect)
		await spec.wait(300)
		ok !document.querySelector(expect)

	test do
		await flag(".a",'button.busy')

	test do
		await flag(".b",'.app.busy')