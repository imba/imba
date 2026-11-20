import * as imbac from 'imba/compiler'

# Static members in the body of `extend class` and `extend tag`.

def compile code
	imbac.compile(code, sourcePath: 'extend-static.imba', platform: 'browser')

def @twice target, key, desc
	let fn = desc.value
	desc.value = do(...args) fn.apply(this, args) * 2
	desc

def @doubled target, key, desc
	desc.value = desc.value * 2
	desc

tag extend-static-el
	static def one
		1

extend tag extend-static-el
	static count = 3

	static def two
		one! + 1

describe 'extend class static methods' do

	test 'static method reaches the class' do
		class Item
			static def ping
				1

		extend class Item
			static def pong
				2

			def pong
				3

		eq Item.ping!, 1
		eq Item.pong!, 2
		eq (new Item).pong!, 3

	test 'static method runs with the class as self' do
		class Item
			static label = 'item'

		class Sub < Item
			static label = 'sub'

		extend class Item
			static def describe
				"{label} {name}"

		eq Item.describe!, 'item Item'
		eq Sub.describe!, 'sub Sub'

	test 'static method replaces a static method of the class' do
		class Item
			static def kind
				'class'

		extend class Item
			static def kind
				'extension'

		eq Item.kind!, 'extension'

	test 'static getter and setter' do
		class Item

		extend class Item
			static get size
				#size or 0

			static set size value
				#size = value * 2

		eq Item.size, 0
		Item.size = 2
		eq Item.size, 4

	test 'static getter named length' do
		class List
			static items = [1,2,3]

		extend class List
			static get length
				items.length

		eq List.length, 3
		eq List.name, 'List'

	test 'private static method' do
		class Item

		extend class Item
			static def #double value
				value * 2

			static def quadruple value
				#double(#double(value))

		eq Item.quadruple(2), 8

	test 'decorated static method' do
		class Item
			static base = 2

		extend class Item
			@twice static def scale value
				base * value

		eq Item.scale(3), 12

	test 'static let in a static method' do
		class Item

		class Sub < Item

		extend class Item
			static def next
				static let count = 0
				count += 1

		eq Item.next!, 1
		eq Item.next!, 2
		eq Sub.next!, 1

	test 'static method on a native class' do
		extend class Map
			static def extend-static-of ...pairs
				new self(pairs)

		let map = Map.extend-static-of(['a', 1], ['b', 2])
		assert map isa Map
		eq map.get('b'), 2

describe 'extend class static super' do

	test 'super calls the static method that the class had' do
		class Item
			static def kind
				'class'

		extend class Item
			static def kind
				"extension of {super}"

		eq Item.kind!, 'extension of class'

	test 'super calls the static method of the superclass' do
		class Base
			static def kind
				"base {name}"

		class Item < Base

		extend class Item
			static def kind
				"extension of {super}"

		eq Item.kind!, 'extension of base Item'

	test 'super in a static getter and setter' do
		class Item
			static get level
				#level or 1

			static set level value
				#level = value

		extend class Item
			static get level
				super * 10

			static set level value
				super.level = value * 3

		eq Item.level, 10
		Item.level = 2
		eq Item.level, 60

	test 'static and instance members call their own super' do
		class Item
			static def kind
				'static'

			def kind
				'instance'

		extend class Item
			static def kind
				"extended {super}"

			def kind
				"extended {super}"

		eq Item.kind!, 'extended static'
		eq (new Item).kind!, 'extended instance'

describe 'extend class static fields' do

	test 'static field with a value' do
		class Item
			static count = 1

		extend class Item
			static count = 2
			static tags = ['a']

		eq Item.count, 2
		eq Item.tags, ['a']

	test 'static field value runs with the class as self' do
		class Item
			static def make
				new self

		extend class Item
			static made = make!
			static label = "class {name}"

		assert Item.made isa Item
		eq Item.label, 'class Item'

	test 'static field without a value keeps the value of the class' do
		class Item
			static count = 1

		extend class Item
			static count
			static total = count + 1

		eq Item.count, 1
		eq Item.total, 2

	test 'static descriptor field' do
		class Item
			static def @upper
				{
					$get: do(target, key) target[key]
					$set: do(value, target, key) target[key] = String(value).toUpperCase!
				}

		extend class Item
			static title @upper

		eq Item.title, undefined
		Item.title = 'abc'
		eq Item.title, 'ABC'

	test 'decorated static field' do
		class Item

		extend class Item
			@doubled static count = 2

		eq Item.count, 4

describe 'extend tag static members' do

	test 'static method and field reach the tag class' do
		let type = (<extend-static-el>).constructor
		eq type.one!, 1
		eq type.two!, 2
		eq type.count, 3

describe 'extend object static members' do

	test 'static member is a compile error' do
		let res = compile('''
		let obj = new Object
		extend obj
			static def one
				1
		''')
		eq res.errors.length, 1
		eq res.errors[0].message, 'static member not supported in object extension'
