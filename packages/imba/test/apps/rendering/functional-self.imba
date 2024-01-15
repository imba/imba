
class Item
	count = 0
	def node val
		<div @click=(count++)>

tag App
	# the default value of label will be inherited
	# from the closest parent that has a label property
	prop label = #context.label
	item = new Item
	options = {}

	def render
		<self>	
			<(item.node(options))>

test do
	let app = new <App>
	ok app.item.count == 0
	app.children[0].click()
	ok app.item.count == 1
	app.item = new Item
	app.render!
	app.children[0].click()
	ok app.item.count == 1