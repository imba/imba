let name = 'hello'

tag custom-field
	def render
		<self>
			<input[@value]>
			<p> "name is {@value}"

let app = <custom-field bind:value=name>
imba.mount(app)

test do
	eq app.value, name
	app.value = 'hi'
	eq name, 'hi'