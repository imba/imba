let name = 'hello'

tag app-root
	def render
		<self>
			<input[name].textfield>
			<p> "name is {name}"

imba.mount(<app-root>)

test do
	let el = $(.textfield)
	await spec.tick()
	eq el.value,name
	el.focus()
	await spec.keyboard.type('hello')
	eq el.value,'hellohello'
	eq name,'hellohello'
