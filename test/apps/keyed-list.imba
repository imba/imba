var pool = [
	{id: 7, title: "Seven"}
	{id: 8, title: "Eight"}
	{id: 9, title: "Nine"}
]

var todos = [
	{id: 1, title: "One"}
	{id: 2, title: "Two"}
	{id: 3, title: "Three"}
	{id: 4, title: "Four"}
	{id: 5, title: "Five"}
	{id: 6, title: "Six"}
]

tag app-root < component
	def render
		<self>
			<ul> for item in todos
				<li@{item.id}> <span> item.title

document.body.appendChild(<app-root>)

var ordered = do
	var titles = todos.map(|t| t.title).join("")
	var actual = document.querySelector('ul').textContent
	eq actual, titles, message: "expected order to be %1 - was %2"

var mutated = do |state,count|
	eq count, state.mutations.length,warn: "expected %1 mutations - got %2"

test "remove" do
	pool.push(todos.pop())
	await spec.tick()
	ordered()
	mutations($1,1)

test "add" do
	todos.push(pool.pop())
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
#	console.log("info")
