let value = 1

let flipper = do
	if value
		<b.flipper> "one"
	else
		null

let fragif = do
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
			<button @click=flip> "flip"
			<>
				<span> "one"
				<span> "two"
				flipper()
			<div>
			fragif()
			<em> "Here" 
			if value
				<button.flipping> "flipping"
			<div>
			if value
				<button.ontrue> "ontrue"
			else
				<button.onfalse> "onfalse"

imba.mount(let app = <app-root>)

test "check" do
	ok app.querySelector('button.flipping')
	ok app.querySelector('b.flipper')
	value = 0
	app.render()
	ok !app.querySelector('button.flipping')
	ok !app.querySelector('b.flipper')