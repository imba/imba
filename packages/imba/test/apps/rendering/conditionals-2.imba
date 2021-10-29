let bool = true
let title = 'a'

tag app-root
	def flip
		bool = !bool

	def render
		<self :click.flip>
			<div> ""
			if bool
				<div> "1"
				<div> "2"
				"3"
				title
			else
				title

let app = <app-root>

imba.mount app

test do
	bool = false
	app.render()
	eq app.textContent, title

test do
	bool = true
	app.render()
	eq app.textContent, "123{title}"


