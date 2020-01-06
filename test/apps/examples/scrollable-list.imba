tag scrollable-list

	def setup
		#views = []
		#pool = []
		#map = Map.new
		#rendered = Set.new

	def renderItem item, index
		let ctx
		unless ctx = #map.get(item)
			#views.push(ctx = (#pool.pop() or {}))
			#map.set(item,ctx)

		imba.ctx = ctx
		let view = @template(item,index)
		@appendChild(view) if view and !view.parentNode
		view.style.setProperty('--item-index',index)
		#rendered.add(item)
		self

	def render
		<self :scroll.passive.silence.update(no)>
		@update(yes)

	def update full = yes
		return self unless @items # and @views.length

		var items = @items
		var count = items.length
		var last = items[count - 1]
		var item-height = 60
		var max-height = window.innerHeight
		var scroll = @scroll-top or 0

		var from  = Math.max(Math.floor(scroll / item-height) - 1,0)
		var to    = from + Math.ceil(max-height / item-height) + 1
		var moved = from != #render-from or to != #render-to

		#rendered.clear()

		if (moved or full) and to > from
			for nr in [from .. to]
				break unless items[nr]
				@render-item(items[nr],nr)

		unless #rendered.has(last)
			@render-item(last,count - 1)

		if moved
			for [data,view] of #map
				unless #rendered.has(data)
					#pool.push(view)
					#map.delete(data)

		#render-from = from
		#render-to = to
		return self

var todos = []

while todos.length < 200
	let i = todos.length
	let item = {id: i, title: "Some item {i}"}
	item.done = i % 5 == 0
	todos.push(item)

tag todo-item
	def render
		<self>
			<span.title> @model.title

	def mount
		console.log 'mounted'

	def unmount
		console.log 'unmount'

tag app-root
	def renderer todo, index
		<todo-item[todo] .todo .done=todo.done :click.toggle(todo)>

	def toggle todo
		console.log 'toggle this todo!',todo
		todo.done = !todo.done
		self

	def render
		<self>
			<scrollable-list items=@items template=@renderer>


imba.mount <app-root items=todos>

### css

app-root {
	display: block;
	--item-height: 60px;
}

.todo {
	display: block;
	height: var(--item-height);
	border: 1px solid blue;
	position: absolute;
	width: 100%;
	top: calc(var(--item-index) * var(--item-height));
}

.todo.done {
	font-style: italic;
	text-decoration: line-through;
	color: gray;
}

scrollable-list {
	display: block;
	height: 600px;
	border: 1px solid red;
	overflow-y: auto;
	position: relative;
}

###