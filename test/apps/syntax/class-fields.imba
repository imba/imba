class Item
	name = 'hello'
	other = 100
	#private = 1
	static #private = 2
	static test = 1

	def constructor
		@test = 10


class Doc < Item
	kind = 'document'
	map = Map.new
	static test = 2

class Folder < Item
	kind = 'folder'
	static test = 3
	items

	def constructor
		super # test
		@name = 'stuff'

test 'static fields' do
	ok Item.test == 1
	ok Doc.test == 2
	ok Folder.test == 3

test 'instance fields' do
	let doc = Doc.new
	ok doc.kind == 'document'
	ok doc.name == 'hello'

	let folder = Folder.new
	ok folder.kind == 'folder'

test 'fields without value' do
	let item = Folder.new
	ok item.hasOwnProperty('items')

test 'rich instance fields' do
	let doc1 = Doc.new
	let doc2 = Doc.new
	ok doc1.map != doc2.map
