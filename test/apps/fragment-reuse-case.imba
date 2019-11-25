var string = "one"

var nested = do
	<div> string

var fragment = do
	<footer>
		<p> string
		nested()

tag app-root
	def render
		<self>
			<div> "Count is there"
			fragment()

var app = <app-root>
imba.mount(app)

test "check" do
	let p = app.querySelector('p')
	eq p.textContent, "one"
	string = "two"
	await spec.tick()
	eq p.textContent, "two"
	string = "three"
	let frag = fragment()
	eq p.textContent, "two"
