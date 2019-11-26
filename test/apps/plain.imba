
tag app-root
	def render
		<self>
			<div>
				<button.click> "click me"

test "mount" do
	imba.mount(<app-root>)
	await spec.tick()
	ok document.querySelector('button.click')
