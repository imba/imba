let name = 'hello'

tag app-root
	prop desc = 'none'
	def render
		<self>
			<input.textfield bind=name>
			<p> "name is {name}"

			<input.descfield bind=desc>
			<p> "desc is {desc}"

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
