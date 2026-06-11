# keyed elements must keep their identity across renders - including
# elements keyed by numbers (regression: number keys were stringified
# on lookup but not when cached, recreating the element on every commit)

let renders = 0
let mounts = 0

tag keyed-doc
	prop data
	def mount
		mounts++
	def render
		<self> "doc {data}"

tag keyed-app
	prop page = 1
	def render
		renders++
		<self>
			if page
				<keyed-doc data=page key=100>
			<div key=7> "numbered div"
			<section key='named'> "string key"

test "numeric keys keep element identity across commits" do
	let app = <keyed-app>
	imba.mount(app)
	await spec.tick()

	let doc = app.querySelector('keyed-doc')
	let div = app.querySelector('div')
	let sec = app.querySelector('section')

	app.page = 2
	imba.commit!
	await spec.tick()
	app.page = 3
	imba.commit!
	await spec.tick()

	ok renders >= 3
	eq app.querySelector('keyed-doc'), doc
	eq app.querySelector('div'), div
	eq app.querySelector('section'), sec
	eq doc.textContent, "doc 3"
	# mount should only have happened once
	eq mounts, 1
