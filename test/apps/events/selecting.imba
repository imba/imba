var name = "Jo"

tag app-root

	def log ...args
		console.info(args)

	def render
		<self>
			<input[name] type='text' :selection.log($$start,$$end)>
			<p> name

imba.mount(<app-root>)

test do
	let el = $(input)
	await spec.tick()
	eq el.value,name
	el.focus()
	await spec.keyboard.type('e')
	eq $1.log, [[2,2],[3,3]]
