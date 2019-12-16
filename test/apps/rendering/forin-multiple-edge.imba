var pool = []

var items = [
	{id: 1, title: "One"}
	{id: 2, title: "Two"}
	{id: 3, title: "Three"}
	{id: 4, title: "Four"}
	{id: 5, title: "Five"}
	{id: 6, title: "Six"}
]

var flip = false

tag app-root
	def render
		<self>
			<div.items> for item,i in items
				if flip && i == 0
					<div.start> '-'
				<div.item> item.title

imba.mount(<app-root>)

test do
	flip = true
	await spec.tick()
	eq $1.mutations.length, 1, warn: "expected %2 mutations - got %1"