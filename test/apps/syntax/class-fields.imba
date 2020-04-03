class Item
	prop name = 'hello'
	prop PascalCased = 1

	static prop PascalCased = 10
	static prop priv = 10
	static prop test = 10

	def constructor
		test = 10

class Doc < Item
	prop kind = 'document'
	prop map = Map.new

	static prop test = 20

class Folder < Item
	prop kind = 'folder'
	prop items

	static prop test = 30

	def constructor
		super # test
		name = 'stuff'


test 'static fields' do
	ok Item.test == 10
	ok Item.PascalCased == 10
	ok Doc.test == 20
	ok Folder.test == 30
	

test 'instance fields' do
	let doc = Doc.new
	ok doc.kind == 'document'
	ok doc.name == 'hello'
	ok doc.PascalCased == 1

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
		console.info(self.ref = ref)

class A
	prop number = 1
	prop value = Dyn.new('v1')
	prop options = Dyn.new('o1')
	prop desc = Dyn.new('d1')
	prop desc2 = Dyn.new(desc.ref + '2')

class B < A
	prop number = 2
	prop options = Dyn.new('o2')
	
test do
	let item = B.new
	item.options
	eq $1.log, ['o2']
	eq item.number, 2


class C < A
	prop number
	prop value = 3

test do
	let item = C.new
	item.options
	eq $1.log, ['o1']
	eq item.value, 3


class D < A
	prop desc2 = Dyn.new('d4')

test do
	let item = D.new
	item.desc2
	eq $1.log, ['d4']


class E < A
	prop desc3 = Dyn.new(desc2.ref + '3')

test do
	let item = E.new
	item.desc3
	eq $1.log, ['d1','d12','d123']