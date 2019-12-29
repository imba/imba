class Item
	@name = 'hello'
	@PascalCased = 1
	#private = 1

	static @PascalCased = 10
	static #private = 10
	static @test = 10

	def constructor
		@test = 10

	get private
		#private

	static get private
		#private

class Doc < Item
	@kind = 'document'
	@map = Map.new

	static test = 20

class Folder < Item
	@kind = 'folder'
	static test = 30
	@items

	def constructor
		super # test
		@name = 'stuff'

	

test 'static fields' do
	ok Item.test == 10
	ok Item.PascalCased == 10
	ok Item.private == 10

	ok Doc.test == 20
	ok Folder.test == 30
	

test 'instance fields' do
	let doc = Doc.new
	ok doc.kind == 'document'
	ok doc.name == 'hello'
	ok doc.PascalCased == 1
	ok doc.private == 1

	let folder = Folder.new
	ok folder.kind == 'folder'

test 'fields without value' do
	let item = Folder.new
	ok item.hasOwnProperty('items')

test 'rich instance fields' do
	let doc1 = Doc.new
	let doc2 = Doc.new
	ok doc1.map != doc2.map
