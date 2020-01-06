var blocks = [
	{type: 'todo-item', name: 'I am a todo item', id: 1}
	{type: 'note-item', name: 'I am a note item', id: 2}
	{type: 'footer', name: 'I am a footer', id: 3}
]

tag shared-item
	def render
		<self>
			<div> @model.name
			<span :click.convert> "Convert!"

tag todo-item < shared-item
	def convert
		@model.type = 'note-item'

tag note-item < shared-item
	def convert
		@model.type = 'todo-item'

tag app-root
	def render
		<self>
			<section>
				for item in blocks
					<{item.type} model=item $key=item.id>

			<section>
				for item in blocks
					<{item.type} model=item>

imba.mount <app-root>

test do
	ok $(app-root footer)
	blocks[2].type = 'header'
	await imba.tick()
	ok $(app-root header)
	$(app-root todo-item span).click()
	await imba.tick()
	# all todos should have been converted
	ok $(app-root todo-item) == null


### css

todo-item {
	color: blue;
}

note-item {
	color: red;
}

footer {
	min-height: 20px;
	background: purple;
}

###