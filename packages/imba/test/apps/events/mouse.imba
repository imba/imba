describe "mouse" do

	tag App
		<self>
			<div.any @mousedown.log('click')> "Button"
			<div.left @mousedown.left.log('click')> "Button"
			<div.not-left @mousedown.!left.log('click')> "Button"
			<div.middle @mousedown.middle.log('click')> "Button"
			<div.not-middle @mousedown.!middle.log('click')> "Button"
			<div.right @mousedown.right.log('click')> "Button"
			<div.not-right @mousedown.!right.log('click')> "Button"
			# <div.nleft @click.!left.log('click')> "Button"

	let app = imba.mount <App>
	
	test "@mousedown" do
		await spec.click('.any')
		await spec.click('.any',{button: 'middle'})
		eq $1.log, ['click','click']

	test "@mousedown.left" do
		await spec.click('.left',{button: 'middle'})
		await spec.click('.left',{button: 'right'})
		eq $1.log, []
		await spec.click('.left',{button: 'left'})
		eq $1.log, ['click']

	test "@mousedown.!left" do
		await spec.click('.not-left',{button: 'left'})
		eq $1.log, []
		await spec.click('.not-left',{button: 'middle'})
		await spec.click('.not-left',{button: 'right'})
		eq $1.log, ['click','click']

	test "@mousedown.middle" do
		await spec.click('.middle',{button: 'left'})
		await spec.click('.middle',{button: 'right'})
		eq $1.log, []
		await spec.click('.middle',{button: 'middle'})
		eq $1.log, ['click']

	test "@mousedown.!middle" do
		await spec.click('.not-middle',{button: 'middle'})
		eq $1.log, []
		await spec.click('.not-middle',{button: 'left'})
		await spec.click('.not-middle',{button: 'right'})
		eq $1.log, ['click','click']
	
	test "@mousedown.right" do
		await spec.click('.right',{button: 'left'})
		await spec.click('.right',{button: 'middle'})
		eq $1.log, []
		await spec.click('.right',{button: 'right'})
		eq $1.log, ['click']


describe "@mouse.shift|ctrl|alt|meta" do

	tag App
		<self>
			<div.shift
				@mousedown.shift.log('shift')
				@mousedown.!shift.log('!shift')
			> "Button"

			<div.ctrl
				@mousedown.ctrl.log('ctrl')
				@mousedown.!ctrl.log('!ctrl')
			> "Button"

			<div.alt
				@mousedown.alt.log('alt')
				@mousedown.!alt.log('!alt')
			> "Button"

			<div.meta
				@mousedown.meta.log('meta')
				@mousedown.!meta.log('!meta')
			> "Button"
			# <div.neg @mousedown.!shift.log('click')> "Button"

			<div.alt-not-shift
				@mousedown.alt.!shift.log('alt')
			> "Button"
			
	let app = imba.mount <App>

	for typ in ['shift','ctrl','alt','meta']
		test(typ) do({log})
			await spec.click(".{typ}")
			await spec.keyboard.hold(typ) do spec.click(".{typ}")
			eq log, ["!{typ}",typ]
	
	# combining multiple modifiers
	test '.alt.!shift' do({log})
	
		await spec.keyboard.hold('alt') do
			await spec.keyboard.hold('shift') do
				await spec.click(".alt-not-shift")
				eq log, []
			await spec.click(".alt-not-shift")
			eq log, ['alt']