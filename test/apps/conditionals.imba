var value = 1

var flipper = do
	if value
		<b> "one"
	else
		null

var fragif = do
	if value
		<div> "single item"
		
	else
		<>
			<span> "frag 1"
			<span> "frag 2"

tag app-root
	def flip
		value = !value

	def render
		<self>
			<button :click.flip> "flip"
			<>
				<span> "one"
				<span> "two"
				flipper()
			<div>
			fragif()
			# if value
			# 	<button>
			<div>

imba.mount(var app = <app-root>)

test "check" do
	ok app.querySelector('button')
	value = 0
	app.render()
	ok !app.querySelector('button')