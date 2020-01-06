var pool = []

var items = [
	{id: 1, title: "One"}
	{id: 2, title: "Two"}
	{id: 3, title: "Three"}
	{id: 4, title: "Four"}
	{id: 5, title: "Five"}
	{id: 6, title: "Six"}
]

var numbers = [1,2,3]

tag app-root
	def render
		<self>
			<ul> for item in items
				<li> <span> item.title

			<div.with-siblings>
				<b> 'a'
				for num in numbers
					<i> num
				<b> 'b'

imba.mount(<app-root>)

test "pop item" do
	let removed = items.pop()
	await spec.tick()
	eq $1.mutations.length,1

test "push item" do
	items.push({id: 10, title: "Ten"})
	await spec.tick()
	eq $1.mutations.length,1

test "reorder item" do
	items.unshift(items.pop())
	await spec.tick()
	eq $1.mutations.length,items.length

describe "with siblings" do
	let div = $(.with-siblings)
	test "advanced" do
		eq div.innerText, 'a123b'
		numbers.push(4)
		await spec.tick()
		eq $1.mutations.length,1
		eq div.innerText, 'a1234b'
