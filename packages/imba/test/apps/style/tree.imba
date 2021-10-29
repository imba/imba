tag App
	val = 500
	<self>
		css fw:{val}
		<div> "500"

test do
	let app = <App>
	eqcss app, 500, 0
	app.val = 600
	app.render!
	eqcss app, 600, 0