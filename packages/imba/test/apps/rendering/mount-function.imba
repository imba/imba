tag App
	def close
		imba.unmount(self)

	<self> "Hello"


test 'basics' do
	let counter = 0
	let app = imba.mount do
		counter++
		<App>
	
	eq counter, 1
	await imba.commit!
	eq counter,2
	imba.unmount(app)

	# this function should now have stopped running?
	await imba.commit!
	eq counter,2