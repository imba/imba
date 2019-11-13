
tag App
	def addItem
		console.log "addItem!!",#newTodoTitle
		if #newTodoTitle
			API.addTodo(#newTodoTitle)
			#newTodoTitle = ""

	def clearCompleted
		API.clearCompleted()
		
	def mount
		#newTodoTitle = ''
		window.addEventListener('hashchange') do
			@route = window.location.hash

	def render
		var all    = API.todos()
		var items  = all
		var done   = API.completed()
		var active = API.remaining()

		if @route == '#/completed'
			items = done

		elif @route == '#/active'
			items = active

		<self>
			<header.header>
				# <h1> "{@data.counter}"
				<input[#newTodoTitle].new-todo
					type='text'
					placeholder='What to do?'
					autofocus=true
					:keyup.enter.addItem()>
			
			<section.main>
				<ul.todo-list>
			<footer.footer .hidden=(!all.length)>
				<span.todo-count>
					<strong> active.length
					<span> " item{active.length != 1 ? 's' : ''} left"
				<ul.filters>
					<li> <a .selected=(items == all)    href='#/'> "All"
					<li> <a .selected=(items == active) href='#/active'> "Active"
					<li> <a .selected=(items == done)   href='#/completed'> "Completed"
				<button.clear-completed .hidden=(!done.length) :tap='clearCompleted'> 'Clear completed'

# create an instance of the app (with id app)
var app = <App[store]#app.todoapp>

def api.render
	app.render()

Imba.mount(app)
api.reset(6)