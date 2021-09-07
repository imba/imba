const todos = [
	{id: 1, title: "One"}
	{id: 2, title: "Two"}
	{id: 3, title: "Three"}
]

let truthy = true

tag app-original
	def render
		<self>
			if truthy
				# <div> @hello
				for item in todos
					<div $key=item.id> <span> item.title
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

const ordered = do
	let titles = todos.map(do $1.title).join("")
	console.log titles,app.textContent
	eq app.textContent, titles

let titles = todos.map(do $1.title).join("")

test do
	# await spec.tick()
	# app.flip()
	truthy = false
	app.render()
	eq app.textContent, "--"
	truthy = true
	app.render()

	eq app.textContent, titles
	truthy = false
	app.render()
	eq app.textContent, "--"