describe "@key" do

	let ctx = {}
	let events = []
	let res = null

	def cb e
		events.push(e)
		res = e

	tag App
		<self tabIndex=-1
			@keydown.esc.log('esc')
			@keydown.tab.log('tab')
			@keydown.enter.log('enter')
			@keydown.space.log('space')
			@keydown.up.log('up')
			@keydown.down.log('down')
			@keydown.left.log('left')
			@keydown.right.log('right')
			@keydown.del.log('del')
			# @keydown.key.log('key')
		>

	let app = imba.mount <App>

	# resize should be triggered immediately
	for key in ['esc', 'tab', 'enter', 'space', 'up', 'down', 'left', 'right', 'del']
		test(key) do
			app.focus!
			await spec.keyboard.down(key)
			await imba.commit!
			eq $1.log,[key]
