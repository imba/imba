
class Dyn
	def constructor ref = 0
		console.info(@ref = ref)

class A
	prop number = 1
	prop value = Dyn.new('v1')
	prop options = Dyn.new('o1')

	lazy prop desc = Dyn.new('d1')
	lazy prop desc2 = Dyn.new(@desc.ref + '2')


class B < A
	prop number = 2
	prop options = Dyn.new('o2')
	
test do
	let item = B.new
	eq $1.log, ['v1','o2']
	eq item.number, 2


class C < A
	prop number
	prop value = 3

test do
	let item = C.new
	eq $1.log, ['o1']
	eq item.value, 3


class D < A
	prop desc2 = Dyn.new('d4')

test do
	let item = B.new
	item.desc2
	eq $1.log, ['v1','o2','d1','d12']


class E < A
	prop desc3 = Dyn.new(@desc2.ref + '3')

test do
	let item = E.new
	eq $1.log, ['v1','o1','d1','d12','d123']