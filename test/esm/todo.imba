var field = 'custom'

class Item
	prop hello
	attr desc hello: 1

	def constructor title
		@title = title

	def archive
		@archived = yes

	def [field]
		console.log "called {field}"

	static def type
		'Item'

class Todo < Item
	def due
		yes

extend class Todo
	def due2
		yes

var todo = Todo.new('hello')
todo.hello = 10
console.log todo.hello
console.log todo.archive()
console.log Todo.type()
console.log todo.custom()
console.log todo.due2()