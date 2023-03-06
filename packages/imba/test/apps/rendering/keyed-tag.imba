const items = [
	{id: 1, name: 'hello'}
	{id: 2, name: 'hello'}
]

tag Item	
	<self> data.name

tag App

	def render
		<self>
			<Item $key=data.id data=data>

imba.mount let app = <App data=items[0]>

test do
	let a = app.children[0]
	ok app.children[0]
	app.data = items[1]
	app.render!
	let b = app.children[0]
	ok a != b
