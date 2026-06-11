import { Todo } from './todo.imba'

tag App
	items = [new Todo('Hello'),new Todo('Hello again')]

	def add title
		items.push(new Todo(title))
		$input.value = ''

	def archive
		items = items.filter(do !$1.done)

	def render
		<self[d:flex fld:column pos:absolute inset:0]>
			<form[d:flex bg:gray2 p:2 m:0] @submit.prevent=add($input.value)>
				<input$input[flex:1 p:1 bg:clear] placeholder='What to do?'>
			<ul[flex:1 px:1]> for item in items
				<li[bc:gray2 bbw:1 p:2 fw:500] [td:s c:gray6 fw:400]=item.done @click=item.toggle>
					<span> item.title
			<footer[bg:gray2 p:3]>
				<span> "You have {items.length} todos"
				<button @click=archive> "Archive"

imba.mount <App>