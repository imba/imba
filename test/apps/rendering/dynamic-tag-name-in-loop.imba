const blocks = [
	{type: 'todo-item', name: 'I am a todo item', id: 1}
	{type: 'note-item', name: 'I am a note item', id: 2}
	{type: 'footer', name: 'I am a footer', id: 3}
]

tag shared-item
	def render
		<self>
			<div> data.name
			<span :click.convert> "Convert!"

tag todo-item < shared-item
	def convert
		data.type = 'note-item'

tag note-item < shared-item
	def convert
		data.type = 'todo-item'

tag app-root
	def render
		<self>
			<section>
				for item in blocks
					<{item.type} data=item $key=item.id>

			<section>
				for item in blocks
					<{item.type} data=item>

imba.mount <app-root>

test do
	ok document.querySelector('app-root footer')
	blocks[2].type = 'header'
	await imba.commit!
	ok document.querySelector('app-root header')
	document.querySelector('app-root todo-item span').click()
	await imba.commit!
	# all todos should have been converted
	ok document.querySelector('app-root todo-item') == null