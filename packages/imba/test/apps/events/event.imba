describe "@event.sel" do

	tag App
		<self.parent>
			<div.target
				@click.sel('span').log('span')
				@click.!sel('span').log('!span')
			>
				<span> "Button"
				<b> "bold"
			
			# when matching on parent classes we need to
			# include :scope to refer to this element
			<div.two
				@click.sel('.parent :scope').log('parent')
			> "Button"
			
	let app = imba.mount <App>

	test('sel') do
		await spec.click(".target span")
		eq $1.log, ['span']

	test('!sel') do
		await spec.click(".target b")
		eq $1.log, ['!span']

	test('.parent') do
		await spec.click(".two")
		eq $1.log, ['parent']

describe "@event.trusted" do

	tag App
		<self>
			<div$target
				@click.trusted.log('trusted')
				@click.!trusted.log('!trusted')
			> "Button"
			
	let app = imba.mount <App>

	test 'untrusted' do
		await app.$target.click!
		eq $1.log, ['!trusted']

	test 'trusted' do
		await spec.click(".target")
		eq $1.log, ['trusted']

describe "@event.if" do
	let bool = true

	tag App
		<self>
			<div$target
				@click.if(bool).log('true')
				@click.!if(!bool).log('!true')

				@click.if(!bool).log('false')
				@click.!if(bool).log('!false')
			> "Button"
			
	let app = imba.mount <App>

	test do
		await spec.click(".target")
		eq $1.log, ['true','!true']
		bool = false
		app.render!
		await spec.click(".target")
		eq $1.log, ['true','!true','false','!false']