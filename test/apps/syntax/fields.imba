class A
	name
	
test do
	let item = new A
	ok item.hasOwnProperty('name')
	eq item.name, undefined
	
class A2
	name = 'hello'
	
test do
	let item = new A2
	eq item.name, 'hello'
	
class A3(name)
	name = 'hello'
	
test do
	let item = new A3('john')
	eq item.name, 'john'

class A4(...)
	name = 'hello'
	
test do
	let item = new A4(name: 'jane')
	eq item.name, 'jane'

class B
	one = 1
	two = 2
	three = dynamic!
	all = [one,two,three]
	
	def dynamic
		3
	
test do
	let item = new B
	eq item.one, 1
	eq item.two, 2
	eq item.three, 3
	eq item.all, [1,2,3]


class C
	static one
	static type = 'cls'
	
test do
	ok C.hasOwnProperty('one')
	eq C.one, undefined
	eq C.type, 'cls'


class D(a,b)
	a = 2
	b = 2
	mult = a * b

	
test do
	let d = new D
	eq d.mult, 4

class D2(a,b)
	a = 2
	b = 2
	mult = a * b

test do
	let d = new D2(3)
	eq d.mult, 6

class E
	a = 2
	b = 2
	mult = a * b

test do
	let e = new E
	eq e.mult, 4


class F
	a = 2
	b = 2
	util = {
		mult: do a * b
	}

test do
	let f = new F
	eq f.util.mult!, 4