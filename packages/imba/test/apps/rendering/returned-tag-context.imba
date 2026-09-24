class RenderModel
	key = null
	label = 'leaf'
	children = []
	setups = 0
	renders = 0

	def node
		<render-context-item data=self>

tag render-context-item
	def setup
		data.setups++

	def render
		data.renders++
		throw new Error('Too many renders') if data.renders > 100
		<self>
			data.label
			for child in data.children
				<(child.node!)>

tag render-context-keyed
	prop items = []

	def render
		<self>
			for item in items
				<(item.node!) $key=item.key>

test "returned tags set up once and render once per visit in an unkeyed loop" do
	let standalone = new RenderModel
	let single = standalone.node!
	eq standalone.setups, 1
	eq standalone.renders, 1
	eq single.textContent, 'leaf'

	let root = new RenderModel
	root.label = ''
	let first = new RenderModel
	let second = new RenderModel
	root.children.push(first, second)
	let el = root.node!
	eq first.setups, 1
	eq second.setups, 1
	eq first.renders, 1
	eq second.renders, 1
	eq el.textContent, 'leafleaf'
	let firstElement = el.children[0]

	first.label = 'updated'
	el.render!
	eq first.setups, 1
	eq second.setups, 1
	eq first.renders, 2
	eq second.renders, 2
	eq el.children[0], firstElement
	eq el.textContent, 'updatedleaf'

test "returned tags accept falsy keys without duplicate setup or rendering" do
	let items = []
	for key in [0, '', no, 'last']
		let item = new RenderModel
		item.key = key
		item.label = String(key)
		items.push(item)
	let el = <render-context-keyed items=items>
	let elements = Array.from(el.children)
	for item in items
		eq item.setups, 1
		eq item.renders, 1

	items.reverse!
	el.render!
	for item, index in items
		eq item.setups, 1
		eq item.renders, 2
		eq el.children[index], elements[items.length - index - 1]
	eq el.textContent, items.map(do $1.label).join('')

test "nested first children render in proportion to the number of nodes" do
	let root = new RenderModel
	let nodes = [root]
	let parent = root
	for index in [0...36]
		parent.label = ''
		let child = new RenderModel
		parent.children.push(child)
		nodes.push(child)
		parent = child
	let el = root.node!
	for node in nodes
		eq node.setups, 1
		eq node.renders, 1
	eq el.textContent, 'leaf'

	parent.label = 'updated'
	el.render!
	for node in nodes
		eq node.setups, 1
		eq node.renders, 2
	eq el.textContent, 'updated'
