var pool = [
	{id: 5, title: "Five"}
	{id: 6, title: "Six"}
	{id: 7, title: "Seven"}
]

var todos = [
	{id: 1, title: "One"}
	{id: 2, title: "Two"}
	{id: 3, title: "Three"}
	{id: 4, title: "Four"}
]

tag app-root < component

	def pop
		pool.push(todos.pop())

	def push
		todos.push(pool.pop())

	def unshift
		todos.unshift(pool.pop())

	def reorder
		todos.unshift(todos.pop())

	def replace
		var idx = 2
		pool.push(todos[idx])
		todos[idx] = pool.shift()

	def render
		<self>
			<div>
				<button.push :click.push> "Add"
				<button.pop :click.pop> "Remove"
				<button.unshift :click.unshift> "Unshift"
				<button.replace :click.replace> "Replace"
				<button.reorder :click.reorder> "Reorder"
			<ul> for item in todos
				<li@{item.id}> <span> item.title

document.body.appendChild(<app-root>)

var ordered = do
	var titles = todos.map(|t| t.title).join("")
	var actual = document.querySelector('ul').textContent
	eq actual, titles, message: "expected order to be %1 - was %2"

var mutated = do |state,count|
	eq count, state.mutations.length,warn: "expected %1 mutations - had %2"

test "remove" do
	await spec.click('.pop')
	ordered()
	mutations($1,1)

test "add" do
	await spec.click('.push')
	ordered()
	mutated($1,1)

test "replace" do
	await spec.click('.replace')
	ordered()
	mutated($1,2)

test "move last todo to top" do
	await spec.click('.reorder')
	ordered()
	mutated($1,2)

# test "rename todo" do
#	await spec.click('.reorder')
#	eq $1.mutations.length,1

# This should create a new element representing the new id
# And remove the old one
# test "change id of todo" do
# 	todos[0].id = 100
# 	var i = await spec.tick()
#	console.log("info")
