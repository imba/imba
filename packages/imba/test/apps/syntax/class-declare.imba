import * as imbac from 'imba/compiler'

# `declare` inside a class / tag / extend body is a type-only declaration.
# Outside tsc it compiles to nothing: no field, no initializer, no accessor.

def compile code, platform = 'browser'
	imbac.compile(code, sourcePath: 'declare.imba', platform: platform)

class Declared
	declare opener
	declare added\Set<string>
	declare mode\('edit'|'view')
	declare kind\("draft" | "live")
	declare config\Declared["mode"]
	declare current\Declared?
	declare items\string[]
	declare lookup\(Map<string, number>)
	declare can-fence?\boolean
	declare #stream\Declared
	declare static notes\string?
	plain

	def setup
		added = new Set
		added.add('a')
		#stream = self
		mode = 'edit'
		self

describe 'declare in class bodies' do

	test 'declared names get no own property' do
		let item = new Declared
		assert !item.hasOwnProperty('opener')
		assert !item.hasOwnProperty('added')
		assert !item.hasOwnProperty('mode')
		assert !item.hasOwnProperty('kind')
		assert !item.hasOwnProperty('current')
		assert !item.hasOwnProperty('can-fence?')
		assert !('canFenceΦ' in item)
		eq Object.getOwnPropertySymbols(item).length, 0

	test 'a plain field next to declares is still a field' do
		let item = new Declared
		assert item.hasOwnProperty('plain')
		eq Object.keys(item), ['plain']

	test 'declared names get no prototype accessors' do
		let proto = Declared.prototype
		eq Object.getOwnPropertyDescriptor(proto, 'opener'), undefined
		eq Object.getOwnPropertyDescriptor(proto, 'added'), undefined
		eq Object.getOwnPropertyNames(proto).sort!, ['constructor','setup']

	test 'declare static adds nothing to the class' do
		assert !Declared.hasOwnProperty('notes')

	test 'declared names are ordinary properties at runtime' do
		let item = new Declared
		item.setup!
		assert item.added isa Set
		eq [...item.added], ['a']
		eq item.mode, 'edit'
		eq item[Symbol.for('#stream')], item

	test 'declared names are not filled from the init object' do
		let item = new Declared(opener: 1, plain: 2)
		eq item.opener, undefined
		eq item.plain, 2

	test 'declare does not reset an inherited field' do
		class Base
			data = 1
		class Retyped < Base
			declare data\number
		class Redeclared < Base
			data\number

		eq (new Retyped).data, 1
		eq (new Retyped(data: 5)).data, 5
		# a real field redeclaration initializes again
		eq (new Redeclared).data, undefined

	test 'declare does not shadow an inherited getter or setter' do
		class Base
			get label
				'base'
			set value v
				#value = v * 2
			get value
				#value
		class Sub < Base
			declare label\string
			declare value\number

		let item = new Sub
		eq item.label, 'base'
		item.value = 2
		eq item.value, 4

	test 'declare in an extend class body is a no-op' do
		class Target
			def one
				1
		extend class Target
			declare extra\number
			declare #hidden\string
			def two
				2

		let item = new Target
		eq item.two!, 2
		assert !item.hasOwnProperty('extra')
		assert !Target.prototype.hasOwnProperty('extra')

tag declare-item
	declare data\{name: string}
	declare #cache\Map<string, number>
	declare static kind\string

	get label
		data.name

describe 'declare in tag bodies' do

	test 'declare data keeps the regular data property' do
		let model = {name: 'hello'}
		let el = <declare-item data=model>
		eq el.data, model
		eq el.label, 'hello'

	test 'declare adds no tag property' do
		let el = <declare-item>
		assert !el.hasOwnProperty('data')
		assert !el.constructor.hasOwnProperty('kind')
		eq Object.getOwnPropertySymbols(el).indexOf(Symbol.for('#cache')), -1

describe 'declare as an identifier' do

	test 'declare is a regular name outside class bodies' do
		let declare = 1
		eq declare + 1, 2
		let obj = {declare: 3}
		eq obj.declare, 3

	test 'declare can be a method name' do
		class Builder
			def declare name
				"declared {name}"
			def run
				self.declare('x')

		eq (new Builder).run!, 'declared x'

	test 'declare as a local inside a method' do
		class Runner
			def run
				let declare = 4
				declare * 2

		eq (new Runner).run!, 8

describe 'declare compiled output' do

	test 'browser output omits declared members' do
		let res = compile('''
		class Foo
			declare added\\Set<string>
			declare static notes\\string
			keep = 1
		''')
		eq res.errors.length, 0
		assert res.js.indexOf('added') == -1
		assert res.js.indexOf('notes') == -1
		assert res.js.indexOf('this.keep =') >= 0

	test 'tsc output keeps declares with their types' do
		let res = compile('''
		class Foo
			declare added\\Set<string>
			declare opener
			declare mode\\('edit'|'view')
			declare kind\\("draft" | "live")
			declare config\\Foo["mode"]
			declare #map\\(Map<string, number>)
			declare static action\\string
			declare ready?\\boolean
		''', 'tsc')
		for part in [
			'declare added:Set<string>'
			'declare opener'
			"declare mode:'edit'|'view'"
			'declare kind:"draft" | "live"'
			'declare config:Foo["mode"]'
			'declare Ψmap:Map<string, number>'
			'declare static action:string'
			'declare readyΦ:boolean'
		]
			assert res.js.indexOf(part) >= 0, part
