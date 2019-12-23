var blocks = [
	{type: 'todo-item', name: 'Test this'}
	{type: 'note-item', name: 'Explain this'}
]

tag shared-item

tag todo-item < shared-item

tag note-item < shared-item

tag app-root

	def step
		blocks.unshift(blocks.pop())

	def render
		<self>
			<section>
				<{blocks[0].type}>
					<div> "Type {blocks[0].type}"
					<div> "Name {blocks[0].name}"
			<button :click.step> "Next"

var app = <app-root>
imba.mount app

test do
	ok $(todo-item)
	app.step()
	app.render()
	ok $(note-item)
	ok $(todo-item) == null

### css

todo-item {
	color: blue;
}

note-item {
	color: red;
}

###