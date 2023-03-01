let string = "one"

let nested = do
	<div> string

let fragment = do
	<footer>
		<p> string
		nested!

tag app-root
	def render
		<self>
			<div> "Count is there"
			fragment!

imba.mount(let app = <app-root>)

test "check" do
	let p = app.querySelector('p')
	eq p.textContent, "one"
	string = "two"
	await spec.tick()
	eq p.textContent, "two"
	string = "three"
	let frag = fragment!
	eq p.textContent, "two"
