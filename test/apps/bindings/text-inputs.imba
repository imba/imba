let name = 'hello'

tag app-root
	@desc = 'none'
	def render
		<self>
			<input[name].textfield>
			<p> "name is {name}"

			<input[@desc].descfield>
			<p> "desc is {@desc}"

let app = <app-root>
imba.mount(app)

test do
	let el = $(.textfield)
	await spec.tick()
	eq el.value,name
	el.focus()
	await spec.keyboard.type('hello')
	eq el.value,'hellohello'
	eq name,'hellohello'


test do
	let el = $(.descfield)
	await spec.tick()
	eq el.value,'none'
	eq app.desc,'none'
	el.focus()
	await spec.keyboard.type('hello')
	eq el.value,'nonehello'
	eq app.desc,'nonehello'
