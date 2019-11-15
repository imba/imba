def main
	var all    = API.todos()
	var items  = all
	var done   = API.completed()
	var active = API.remaining()

	<div#app.todoapp>
		<header.header>
			# <h1> "{@data.counter}"
			<input.new-todo
				type='text'
				placeholder='What to do?'
				autofocus=true>
		<section.main>
			<ul.todo-list>
				for todo in items
					<li.todo .completed=(todo.completed)>
						<div.view> <label> todo.title
		<footer.footer .hidden=(!all.length)>
			<span.todo-count>
				<strong> active.length
				<span> " item{active.length != 1 ? 's' : ''} left"
			<ul.filters>
				<li> <a .selected=(items == all)    href='#/'> "All"
				<li> <a .selected=(items == active) href='#/active'> "Active"
				<li> <a .selected=(items == done)   href='#/completed'> "Completed"
			<button.clear-completed .hidden=(!done.length) :tap='clearCompleted'> 'Clear completed'

var el = main()