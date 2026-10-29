import * as imbac from 'imba/compiler'

# `extend class` bodies with getters, descriptor fields, decorators and
# descriptor factories, plus `class X < Object` and `abstract class`.

def compile code, platform = 'browser'
	imbac.compile(code, sourcePath: 'extend.imba', platform: platform)

class Model
	name = 'model'

	def rename value
		name = value
		self

extend class Model
	get shout do name.toUpperCase!

	get excited
		"{name}!"

	set nick value
		#nick = "~{value}"

	get nick
		#nick

	@lazy get details
		{name: name}

	def @upper
		{
			$get: do(target, key) target[key]
			$set: do(value, target, key) target[key] = String(value).toUpperCase!
		}

	label @upper
	action @upper do "called {name}"
	level @upper = 'low'

	def greet greeting = 'hi'
		"{greeting} {name}"

class User < Model
	title @upper
	name = 'user'

describe 'extend class members' do

	test 'inline do getter' do
		eq (new Model).shout, 'MODEL'

	test 'getter and setter pair' do
		let item = new Model
		eq item.excited, 'model!'
		item.nick = 'mo'
		eq item.nick, '~mo'

	test 'members reach instances created before the extension' do
		class Early
			value = 1

		let item = new Early

		extend class Early
			get double
				value * 2

		eq item.double, 2

	test 'decorated getter' do
		let item = new Model
		let first = item.details
		eq first, {name: 'model'}
		eq item.details, first
		item.rename('other')
		eq item.details, first

	test 'descriptor field' do
		let item = new Model
		item.label = 'abc'
		eq item.label, 'ABC'
		assert item.@@label.$set isa Function

	test 'descriptor field with callback' do
		let item = new Model
		eq item.@@action.callback.call(item), 'called model'

	test 'descriptor field with default' do
		let item = new Model
		eq item.@@level.default!, 'low'

	test 'method with default parameter' do
		eq (new Model).greet!, 'hi model'
		eq (new Model).greet('yo'), 'yo model'

	test 'subclass inherits extension members' do
		let user = new User
		eq user.shout, 'USER'
		eq user.greet!, 'hi user'

	test 'descriptor factory defined in an extension' do
		let user = new User
		user.title = 'boss'
		eq user.title, 'BOSS'

	test 'extension members are not own properties' do
		let item = new Model
		eq Object.keys(item), ['name']
		assert Model.prototype.hasOwnProperty('shout')
		assert Model.prototype.hasOwnProperty('greet')

describe 'extend native classes' do

	test 'extend a builtin with getters and methods' do
		extend class Map
			get extend-members-keys
				[...keys!]

			def extend-members-pick ...names
				names.map do get($1)

		let map = new Map([['a', 1], ['b', 2]])
		eq map.extend-members-keys, ['a','b']
		eq map.extend-members-pick('b','a'), [2,1]

	test 'extend a builtin with a private-field cache' do
		extend class Set
			get extend-members-sorted
				#sorted ||= [...self].sort!

		let set = new Set([3,1,2])
		let sorted = set.extend-members-sorted
		eq sorted, [1,2,3]
		eq set.extend-members-sorted, sorted

describe 'decorator-named methods' do

	test 'descriptor factory can be called as obj.@name' do
		let item = new Model
		let desc = item.@upper!
		assert desc.$set isa Function
		assert item.@upper! != desc

	test 'decorator-named method with params called through self' do
		class Tool
			def @scaled factor = 2
				factor * 10
			def run
				[self.@scaled!, self.@scaled(3)]

		eq (new Tool).run!, [20, 30]

	test 'decorator-named method added to a native class' do
		extend class Event
			def @extend-members-kind prefix = ''
				prefix + type

		let event = new Event('ping')
		eq event.@extend-members-kind!, 'ping'
		eq event.@extend-members-kind('on-'), 'on-ping'

describe 'extend class compile checks' do

	test 'plain field with value warns in an extension' do
		let res = compile('''
		class A
			x = 1
		extend class A
			y = 2
		''')
		eq res.errors.length, 0
		eq res.warnings.length, 1
		eq res.warnings[0].message, 'field with value not supported in class extension'

	test 'descriptor field in an extension does not warn' do
		let res = compile('''
		class A
			def @desc
				{}
		extend class A
			y @desc
			z @desc = 1
		''')
		eq res.errors.length, 0
		eq res.warnings.length, 0

describe 'class extending Object' do

	class Loose < Object
		value = 1

		def double
			value * 2

	class LooseSub < Loose
		extra = 2

	test 'class with Object superclass works like a plain class' do
		let item = new Loose
		eq item.value, 1
		eq item.double!, 2
		eq (new Loose(value: 5)).double!, 10
		assert item isa Loose
		assert item isa Object

	test 'Object superclass is dropped from the output' do
		eq Object.getPrototypeOf(Loose), Function.prototype
		eq Object.getPrototypeOf(Loose.prototype), Object.prototype

	test 'subclass of an Object subclass' do
		let item = new LooseSub(value: 3)
		eq item.double!, 6
		eq item.extra, 2
		assert item isa Loose

	test 'compiled output' do
		let code = 'class Loose < Object\n\tvalue = 1\n'
		let js = compile(code).js
		assert js.indexOf('class Loose {') >= 0
		assert js.indexOf('extends') == -1
		let ts = compile(code, 'tsc').js
		assert ts.indexOf('class Loose {') >= 0
		assert ts.indexOf('[index:string]: any;') >= 0

describe 'anonymous class with a superclass' do

	class Base
		x = 1
		def hello
			'base'

	test 'class expression extending a class' do
		let Klass = class < Base
			y = 2
			def hello
				"sub {super}"

		let item = new Klass(y: 3)
		eq item.x, 1
		eq item.y, 3
		eq item.hello!, 'sub base'
		assert item isa Base
		eq Klass.name, 'Klass'

	test 'new anonymous subclass' do
		let obj = new class < Base
			z = 3
		eq obj.x, 1
		eq obj.z, 3
		assert obj isa Base

describe 'abstract class' do

	abstract class Shape
		static abstract = yes
		sides = 0

		def area
			0

		def describe
			"{constructor.name} with {sides} sides and area {area!}"

	class Square < Shape
		sides = 4
		size = 2

		def area
			size * size

	test 'abstract class compiles to a regular class' do
		let shape = new Shape
		eq shape.area!, 0
		eq Shape.abstract, yes

	test 'subclass of an abstract class' do
		let sq = new Square(size: 3)
		eq sq.area!, 9
		eq sq.describe!, 'Square with 4 sides and area 9'
		assert sq isa Shape
		eq Square.abstract, yes

	test 'abstract keyword is not emitted in javascript' do
		let res = compile('abstract class Shape\n\tdef area\n\t\t0\n')
		eq res.errors.length, 0
		assert res.js.indexOf('abstract') == -1
		assert res.js.indexOf('class Shape {') >= 0
