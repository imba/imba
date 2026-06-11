tag TodoApp < div
	newtitle = ''
	items = []

	def add
		items.push(text: newtitle)
		newtitle = ''

	<self>
		<h3> "TODO"
		<TodoList items=items>
		<form @submit.prevent.if(newtitle)=add>
			<label for='new-todo'> 'What needs to be done?'
			<input#new-todo bind=newtitle>
			<button> "Add #{items.length + 1}"

tag TodoList < ul
	<self> for item in items
		<li> item.text

imba.mount <TodoApp>