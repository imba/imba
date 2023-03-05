let todos = [
	{id: 1, title: "One"}
	{id: 2, title: "Two"}
	{id: 3, title: "Three"}
]

let truthy = true

tag app-original

	def flip
		truthy = !truthy

	def render
		<self @click=flip>
			if truthy
				# <div> @hello
				for item in todos
					<div> <span> item.title
			else
				<div> "--"

tag app-root
	def render
		<self>
			for item in todos
				<li> <span> item.title
			else
				<li> "No todo items here"

imba.mount(let app = <app-original>)

let ordered = do
	let titles = todos.map(do $1.title).join("")
	console.log titles,app.textContent
	eq app.textContent, titles

let titles = todos.map(do $1.title).join("")

test do
	eq app.textContent, titles
	
	app.flip()
	app.render()
	eq app.textContent, "--"
	app.flip()
	app.render()

	eq app.textContent, titles
	app.flip()
	app.render()
	eq app.textContent, "--"