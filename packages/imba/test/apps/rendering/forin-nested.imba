const items = [
	{id: 1, labels: ["1","1"]}
	{id: 2, labels: ["2","2"]}
	{id: 3, labels: ["3","3"]}
]

tag App
	def render
		<self>
			for item,i in items
				for label in item.labels
					<div.label> label

test "basic nested loops" do
	imba.mount(let app = <App>)
	await spec.tick()
	eq app.children.length,6
	eq app.textContent,"112233"

describe "Access to context immediately" do
	let par = null
	let bool = yes

	tag Item
		def setup
			par = #parent.#parent

	tag App
		<self>
			if bool
				for item in [1]
					<Item>

	test "basics" do
		imba.mount(let app = <App>)
		await spec.tick()
		eq par,app