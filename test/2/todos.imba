tag todo-app
	def render
		var remaining = @todos.filter do |todo| !todo.completed

		<self#app.todoapp>
			<header.header>
				<input[@newtitle].new-todo
					type='text'
					placeholder='What to do?'
					autofocus=true
					:keyup.enter.addtodo>
			<section.main>
				<ul.todo-list>
					for todo in @todos
						<todo-item[todo]>
			<footer.footer .hidden=(!@todos.length)>
				<span.todo-count>
					<strong> remaining.length
					<span> " item{remaining.length != 1 ? 's' : ''} left"
				<button :tap.clearCompleted> 'Clear completed'

	def add-todo
		@todos.push {
			title: @newtitle
			completed: no
		}
		@newtitle = ''

	def clear-completed
		@todos = @todos.filter do |todo| !todo.completed

tag todo-item

	def drop-item
		api.removeTodo(data)

	def render
		<self .completed=(data.completed)>
			<div.view>
				<label :dblclick.edit> data.title
				# <input.toggle type='checkbox' checked=@data.completed :tap.prevent.toggle>
				<input[data.completed] type='checkbox'>
				<button.destroy :tap.dropItem>
			<input.edit type='text' :keydown.enter.submit :keydown.esc.cancel>

	def submit
		self

	def cancel
		self

var todos = [
	{title: "Remember milk"},
	{title: "Do something here"},
	{title: "Go again", completed: yes}
]

document.body.appendChild(<todo-app todos=todos>)