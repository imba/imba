const todos = [
	{title: "Eat", done: no}
	{title: "Sleep", done: no}
	{title: "Code", done: yes}
]

tag app-root
	<self>
		for todo,i in todos
			<hr> if i > 0
			<div.todo .line-through=todo.done>
				<span.name> todo.title
				if !todo.done
					<button> 'finish'

imba.mount <app-root>

test do
	ok !document.querySelector('.todo:last-child button')