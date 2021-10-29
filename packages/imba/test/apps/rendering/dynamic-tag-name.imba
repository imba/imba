let blocks = [
	{type: 'todo', name: 'Test this'}
	{type: 'note', name: 'Explain this'}
]

let flip = yes

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
				<{blocks[0].type}-item.cond> <div.inner> blocks[0].name

let app = <app-root>
imba.mount app

test do
	ok document.querySelector('todo-item.static')
	ok document.querySelector('note-item.static') == null
	ok document.querySelector('todo-item.listed + note-item.listed')
	ok document.querySelector('todo-item.cond .inner')

	app.step()
	app.render()
	ok document.querySelector('note-item.static')
	ok document.querySelector('todo-item.static') == null
	ok document.querySelector('note-item.listed + todo-item.listed')
	ok document.querySelector('note-item.cond .inner')

	blocks[0].type = 'issue'
	app.render()
	ok document.querySelector('note-item') == null
	ok document.querySelector('issue-item.static')
	ok document.querySelector('issue-item.listed + todo-item.listed')
	ok document.querySelector('issue-item.cond .inner')