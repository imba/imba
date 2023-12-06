class Item

	def constructor
		value = 1

	@thenable def load
		value += 1
		await new Promise do setTimeout($1,100ms)
		loaded = yes

tag MainPanel

	@thenable def load
		await new Promise do setTimeout($1,100ms)
		loaded = yes

	def render
		<self> <div> "loaded? {loaded}"

test do
	let item = new Item
	ok !item.loaded
	await item
	ok (await item) == item
	ok item.loaded
	eq item.value, 2
	await item
	eq item.value, 2

test do
	let item = new Item
	item.load!
	ok !item.loaded
	await item.load!
	await item
	ok item.loaded
	eq item.value, 2

test do
	let el = new <MainPanel>
	ok !el.loaded
	ok (await el) == el
	ok el.loaded