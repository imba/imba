class Item

	static def ping
		1

	def ping
		2

extend class Item

	static def pong
		1

	def pong
		2

test 'extend class' do
	let item = new Item
	ok Item.ping! == 1
	# ok Item.pong! == 1
	ok item.ping! == 2
	ok item.pong! == 2