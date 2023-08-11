const pool = [
	{id: 7, title: "Seven"}
	{id: 8, title: "Eight"}
	{id: 9, title: "Nine"}
]

const todos = [
	{id: 1, title: "One"}
	{id: 2, title: "Two"}
	{id: 3, title: "Three"}
	{id: 4, title: "Four"}
	{id: 5, title: "Five"}
	{id: 6, title: "Six"}
]

tag app-root
	def render
		<self>
			<ul> for item in todos
				<li $key=item.id> <span> item.title

imba.mount(<app-root>)

const ordered = do
	var titles = todos.map(|t| t.title).join("")
	var actual = document.querySelector('ul').textContent
	eq actual, titles, message: "expected order to be %2 - was %1"

const mutated = do(state,count)
	eq state.mutations.length, count, warn: "expected %2 mutations - got %1"

test "remove from end" do
	pool.push(todos.pop())
	await spec.tick()
	ordered()
	mutated($1,1)

test "add to end" do
	todos.push(pool.pop())
	await spec.tick()
	ordered()
	mutated($1,1)

test "remove from start" do
	pool.push(todos.shift())
	await spec.tick()
	ordered()
	mutated($1,1)
	# todos.unshift(pool.pop())

test "add to start" do
	todos.unshift(pool.pop())
	await spec.tick()
	ordered()
	mutated($1,1)

test "remove from middle" do
	pool.push(todos.splice(2,1))
	await spec.tick()
	ordered()
	mutated($1,1)

test "add to middle" do
	todos.splice(2,0,pool.pop())
	await spec.tick()
	ordered()
	mutated($1,1)

test "replace" do
	var idx = 2
	pool.push(todos[idx])
	todos[idx] = pool.shift()
	await spec.tick()
	ordered()
	mutated($1,2)

test "move last todo to top" do
	todos.unshift(todos.pop())
	await spec.tick()
	ordered()
	mutated($1,2)

test "move two items to end" do
	todos.push(*todos.splice(1,2))
	await spec.tick()
	ordered()
	mutated($1,2)

test "rename item" do
	todos[2].title = "New title"
	await spec.tick()
	ordered()
	mutated($1,1)

test "change id" do
	todos[3].id = 100
	await spec.tick()
	ordered()
	mutated($1,2)

test "reverse" do
	todos.reverse()
	await spec.tick()
	ordered()
	mutated($1,(todos.length - 1) * 2)

# test "rename todo" do
#	await spec.click('.reorder')
#	eq $1.mutations.length,1

# This should create a new element representing the new id
# And remove the old one
# test "change id of todo" do
# 	todos[0].id = 100
# 	var i = await spec.tick()
