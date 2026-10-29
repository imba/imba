import * as imbac from 'imba/compiler'

# Generic type parameters on classes and methods are type-only: they are
# dropped from the JavaScript output and kept in tsc output.

def compile code, platform = 'browser'
	imbac.compile(code, sourcePath: 'generics.imba', platform: platform)

class Box<T>
	value\T

	def map<U>\Box<U> fn\((value: T) => U)
		new Box(value: fn(value))

	static def of<V>\Box<V> value\V
		new Box(value: value)

class Field<T = string>
	kind = 'field'

class TypedField<T extends string = string> < Field<T>
	typed = yes

class Pair<A, B>
	first\A
	second\B

	def swap\Pair<B, A>
		new Pair(first: second, second: first)

class Registry<K extends string, V = unknown> < Map<K, V>
	def get-or key\K, fallback\V
		has(key) ? get(key) : fallback

def identity<T>\T value\T
	value

def first-of<T>\T? list\T[]
	list[0]

describe 'generic classes' do

	test 'generic class with fields' do
		let box = new Box(value: 2)
		eq box.value, 2
		assert box isa Box

	test 'generic method on a generic class' do
		let box = new Box(value: 2)
		let mapped = box.map do $1 * 10
		assert mapped isa Box
		eq mapped.value, 20

	test 'generic static method' do
		let box = Box.of('a')
		eq box.value, 'a'

	test 'generic parameter with a default' do
		eq (new Field).kind, 'field'

	test 'generic superclass expression' do
		let item = new TypedField
		assert item isa Field
		eq item.kind, 'field'
		eq item.typed, yes

	test 'multiple type parameters' do
		let pair = new Pair(first: 1, second: 'b')
		let swapped = pair.swap!
		eq swapped.first, 'b'
		eq swapped.second, 1

	test 'generic subclass of a native class' do
		let reg = new Registry
		reg.set('a', 1)
		assert reg isa Map
		eq reg.get-or('a', 0), 1
		eq reg.get-or('b', 0), 0

	test 'generic top-level functions' do
		eq identity(5), 5
		eq first-of([3,4]), 3
		eq first-of([]), undefined

	test 'class names are not affected by generics' do
		eq Box.name, 'Box'
		eq TypedField.name, 'TypedField'
		eq Registry.name, 'Registry'

describe 'generic extend class' do

	test 'extend a native generic class' do
		extend class Array<T>
			get generic-second\T
				self[1]

			def generic-pick<U>\U[] fn\((item: T) => U)
				map(fn)

		eq [1,2,3].generic-second, 2
		eq [1,2].generic-pick(do $1 + 1), [2,3]

describe 'generics compiled output' do

	const source = '''
	class Box<T>
		value\\T
		def map<U>\\Box<U> fn
			fn
	class Field<T = string>
		kind = 1
	class TypedField<T extends string = string> < Field<T>
		typed = yes
	def identity<T>\\T value\\T
		value
	'''

	test 'browser output has no type parameters' do
		let res = compile(source)
		eq res.errors.length, 0
		assert res.js.indexOf('<T') == -1
		assert res.js.indexOf('<U') == -1
		assert res.js.indexOf('class Box {') >= 0
		assert res.js.indexOf('class TypedField extends Field {') >= 0
		assert res.js.indexOf('map(fn){') >= 0
		assert res.js.indexOf('function identity(value){') >= 0

	test 'tsc output keeps type parameters' do
		let res = compile(source, 'tsc')
		for part in [
			'class Box<T> {'
			'value:T'
			'map<U>(fn):Box<U> {'
			'class Field<T = string> {'
			'class TypedField<T extends string = string> extends Field<T> {'
			'function identity<T>(value:T):T {'
		]
			assert res.js.indexOf(part) >= 0, part
