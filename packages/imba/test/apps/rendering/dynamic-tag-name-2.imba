tag App
	kind = 'a'

	<self>
		<{kind}.one>

test do
	let app = <App>
	eq app.children[0].nodeName,'A'
	app.kind = 'div'
	app.render!
	eq app.children[0].nodeName,'DIV'
