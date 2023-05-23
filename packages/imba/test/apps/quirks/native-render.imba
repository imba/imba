import 'imba/spec'

let x = 1

tag something < div

	def render
		<self> "Yes"

tag App
	<self>
		<something>

imba.mount(let app = <App>)

test("b has custom rendering") do
	eq app.innerText,"Yes"

