describe "@event.outside" do

	tag App


		<self[pos:absolute t:0 l:0 size:100px] @click.log('inside') @something.log('something')>
			# basic throttling
			# <button.a @click.log('a').throttle(250ms).log('done')> "Button"
			
			# the outside modifier only works on teleports and skips event unless
			# it originates from outside the parent 
			<global
				@click.log('global')
				@click.outside.log('outside').emit('something')
			>

	let app = imba.mount <App>

	test do
		await spec.mouse.click(50,50)
		eq $1.log, ['inside','global']
		
	test do
		await spec.mouse.click(150,150)
		eq $1.log, ['global','outside','something']
		