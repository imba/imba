tag cool-button
	### css scoped
	cool-button {
		background: purple;
		padding: 1rem;
		color: white;
		border-radius: 0.3rem;
	}
	###
	def render
		<self>
			<span> "Cool Button"

### css
/* Some descriptive disclosure */
app-root {
	margin: 1rem;
}
###
tag app-root

	def render
		<self>
			<h1> "Hello Imba v2"
			<cool-button>

imba.mount( <app-root> )

test "comment in css block" do
	eq 1,1