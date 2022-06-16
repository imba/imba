tag App
	def head
		"test"

	def render
		<self> <head()>

test "functional components should support plain strings" do
	let app = <App>
	eq app.textContent,"test",warn: "not implemented yet"
	