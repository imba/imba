
var pool = [
]

var todos = [
	{id: 1, title: "One"}
	{id: 2, title: "Two"}
	{id: 3, title: "Three"}
]

tag app-root

	def pop
		pool.push(todos.pop())

	def push
		todos.push(pool.pop())

	def unshift
		todos.unshift(todos.pop())

	def render
		<self>
			<div>
				<button.pop :click.pop> "Pop"
				<button.push :click.push> "Push"
				<button.reorder :click.pop.push> "Reorder"

			<ul> for item in todos
				<li> <span> item.title

imba.mount(<app-root>)

test "pop item" do
	await spec.click('.pop')
	eq $1.mutations.length,1

test "push item" do
	await spec.click('.push')
	eq $1.mutations.length,1

test "reorder item" do
	todos.unshift(todos.pop())
	await spec.tick()
	eq $1.mutations.length,3