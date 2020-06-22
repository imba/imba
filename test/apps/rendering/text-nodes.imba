tag app-root
	prop box = {}

	def render
		<self>
			<div> "W{box.width} H{box.height}"

imba.mount let app = <app-root>

test do
	eq app.textContent, "W H"
	app.box.width = 1
	app.render!
	eq app.textContent, "W1 H"
	app.box.width = 2
	app.box.height = 1
	app.render!
	eq app.textContent, "W2 H1"