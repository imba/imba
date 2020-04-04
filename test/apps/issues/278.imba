tag app-foo
	def render
		<self>
			<h1> "FOO"
			
tag app-bar
	def render
		<self>
			<h1> "BAR"

tag app-root
	prop view = 'foo'

	def change type
		view = type

	def render
		<self>
			<h1> "Hello Imba v2"
			# second click on 'FOO' renders app-foo and app-bar
			<div :click.change('foo')> "FOO"
			<div :click.change('bar')> "BAR"
			if view == 'foo'
				<app-foo>
			elif view == 'bar'
				<app-bar>
			else
				<app-not-found>

let app = <app-root>
imba.mount(app)
test do
	ok $(app-root div + app-foo)
	app.view = 'bar'
	app.render()
	ok $(app-root div + app-bar)
	app.view = 'foo'
	app.render()
	ok $(app-root div + app-foo)
	ok $(app-bar) == null
	