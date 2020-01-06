let value = 'hello'

tag textarea-app
	def render
		<self>
			<textarea[value]>
			<p> "text is {value}"

imba.mount(<textarea-app>)

test 'value' do
	let field = document.querySelector('textarea')
	eq field.value, value
	value = 'changed'
	await spec.tick()
	eq field.value, value