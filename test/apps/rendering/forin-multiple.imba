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
			<div.items> for item,i in items
				if i > 0
					<div.sep> '-'
				<div.item> item.title

imba.mount(<app-root>)

var ordered = do
	var titles = items.map(|t| t.title).join("-")
	var actual = $(.items).textContent
	eq actual, titles

var mutated = do |state,count|
	eq state.mutations.length, count, warn: "expected %2 mutations - got %1"

test "remove from end" do
	pool.push(items.pop())
	await spec.tick()
	ordered()
	# mutated($1,1)