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
	prop map = new Map

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
	let doc = new Doc
	ok doc.kind == 'document'
	ok doc.name == 'hello'
	ok doc.PascalCased == 1

	let folder = new Folder
	ok folder.kind == 'folder'

# test 'fields without value' do
#	let item = new Folder
#	ok item.hasOwnProperty('items') # should we really?

test 'rich instance fields' do
	let doc1 = new Doc
	let doc2 = new Doc
	ok doc1.map != doc2.map

# dynamic default values
class Dyn
	def constructor ref = 0
		console.info(self.ref = ref)

class A
	prop number = 1
	prop value = new Dyn('v1')
	prop options = new Dyn('o1')
	prop desc = new Dyn('d1')
	prop desc2 = new Dyn(desc.ref + '2')

class B < A
	prop number = 2
	prop options = new Dyn('o2')
	
test do
	let item = new B
	item.options
	eq $1.log, ['o2']
	eq item.number, 2


class C < A
	prop number
	prop value = 3

test do
	let item = new C
	item.options
	eq $1.log, ['o1']
	eq item.value, 3


class D < A
	prop desc2 = new Dyn('d4')

test do
	let item = new D
	item.desc2
	eq $1.log, ['d4']


class E < A
	prop desc3 = new Dyn(desc2.ref + '3')

test do
	let item = new E
	item.desc3
	eq $1.log, ['d1','d12','d123']