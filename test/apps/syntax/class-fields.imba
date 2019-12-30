class Item
	@name = 'hello'
	@PascalCased = 1
	#priv = 1

	static @PascalCased = 10
	static #priv = 10
	static @test = 10

	def constructor
		@test = 10

	get private
		#priv

	static get private
		#priv

class Doc < Item
	@kind = 'document'
	@map = Map.new

	static @test = 20

class Folder < Item
	@kind = 'folder'
	@items

	static @test = 30

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

# test 'fields without value' do
#	let item = Folder.new
#	ok item.hasOwnProperty('items') # should we really?

test 'rich instance fields' do
	let doc1 = Doc.new
	let doc2 = Doc.new
	ok doc1.map != doc2.map



# dynamic default values
class Dyn
	def constructor ref = 0
		console.info(@ref = ref)

class A
	@number = 1
	@value = Dyn.new('v1')
	@options = Dyn.new('o1')
	@desc = Dyn.new('d1')
	@desc2 = Dyn.new(@desc.ref + '2')

class B < A
	@number = 2
	@options = Dyn.new('o2')
	
test do
	let item = B.new
	item.options
	eq $1.log, ['o2']
	eq item.number, 2


class C < A
	@number
	@value = 3

test do
	let item = C.new
	item.options
	eq $1.log, ['o1']
	eq item.value, 3


class D < A
	@desc2 = Dyn.new('d4')

test do
	let item = D.new
	item.desc2
	eq $1.log, ['d4']


class E < A
	@desc3 = Dyn.new(@desc2.ref + '3')

test do
	let item = E.new
	item.desc3
	eq $1.log, ['d1','d12','d123']