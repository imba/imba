var blocks = [
	{type: 'todo', name: 'Test this'}
	{type: 'note', name: 'Explain this'}
]

var flip = yes

tag shared-item

tag todo-item < shared-item

tag note-item < shared-item

tag issue-item < shared-item

tag app-root

	def step
		blocks.unshift(blocks.pop())

	def render
		<self>
			<section>
				<{blocks[0].type}-item.static>
					<div> "Type {blocks[0].type}"
					<div> "Name {blocks[0].name}"
			<button :click.step> "Next"
			for blk in blocks
				<{blk.type}-item.listed>
					<div.inner> blk.name
			if flip
				<{blocks[0].type}-item.cond> <div.inner> blk.name

var app = <app-root>
imba.mount app

test do
	ok $(todo-item.static)
	ok $(note-item.static) == null
	ok $(todo-item.listed + note-item.listed)
	ok $(todo-item.cond .inner)

	app.step()
	app.render()
	ok $(note-item.static)
	ok $(todo-item.static) == null
	ok $(note-item.listed + todo-item.listed)
	ok $(note-item.cond .inner)

	blocks[0].type = 'issue'
	app.render()
	ok $(note-item) == null
	ok $(issue-item.static)
	ok $(issue-item.listed + todo-item.listed)
	ok $(issue-item.cond .inner)


### css

todo-item {
	color: blue;
}

note-item {
	color: red;
}

###