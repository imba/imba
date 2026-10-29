# `name @descriptor = value` attaches the default to the descriptor as
# `desc.default` (a function returning the value), plus `desc.default.literal`
# when the value is a primitive literal. The descriptor decides when to use it.

let created = 0
let plains = 0

# lexically bound descriptor class - instantiated with `new`
class @stored
	def $get target, key, name
		let value = target[key]
		if value === undefined and this.default
			value = target[key] = this.default.call(target)
		value

	def $set value, target, key
		target[key] = value

	def $init value, target, key
		target[key] = value if value !== undefined

# lexically bound descriptor function - also instantiated with `new`
def @plain
	plains++
	{
		$get: do(target, key) target[key] ?? (this.default and this.default!)
		$set: do(value, target, key) target[key] = value
	}

const Shared = {
	$get: do(target, key) target[key] ?? (this.default and this.default!)
	$set: do(value, target, key) target[key] = value
}

class Model
	# descriptor resolved through the instance (no lexical binding)
	def @field ...args
		{
			args: args
			chain: []
			min: do(value) this.chain.push("min:{value}")
			$get: do(target, key) target[key] ?? (this.default and this.default!)
			$set: do(value, target, key) target[key] = value
		}

	def prefix
		'pre'

class User < Model
	role @field = 'member'
	retries @field = 3
	active @field = no
	nothing @field = null
	negative @field = -1
	duration @field = 2s
	tags @field = new Set
	list @field = [1,2]
	options @field = {a: 1}
	stamp @field = ++created
	counted @field.min(0).flag = 7
	sized @field(1, 2) = 'x'
	token @stored = prefix! + '-token'
	title @stored = 'untitled'
	shared @(Shared) = 'shared'
	built @plain = 'built'
	plain-field @field

describe 'descriptor default values' do

	test 'literal default is a function and a literal' do
		let user = new User
		let desc = user.@@role
		assert desc.default isa Function
		eq desc.default!, 'member'
		eq desc.default.literal, 'member'
		eq user.role, 'member'

	test 'number and boolean literals' do
		let user = new User
		eq user.retries, 3
		eq user.@@retries.default.literal, 3
		eq user.@@active.default!, no
		eq user.@@active.default.literal, no
		assert user.@@active.default.hasOwnProperty('literal')

	test 'null default still has a literal' do
		let user = new User
		eq user.@@nothing.default!, null
		assert user.@@nothing.default.hasOwnProperty('literal')
		eq user.@@nothing.default.literal, null

	test 'negative number and unit literals' do
		let user = new User
		eq user.@@negative.default.literal, -1
		eq user.negative, -1
		eq user.@@duration.default.literal, 2000
		eq user.duration, 2000

	test 'expression default has no literal' do
		let user = new User
		let desc = user.@@tags
		assert desc.default isa Function
		assert !desc.default.hasOwnProperty('literal')
		assert desc.default! isa Set

	test 'rich defaults are created fresh on every call' do
		let user = new User
		let tags = user.@@tags
		assert tags.default! != tags.default!
		let list = user.@@list
		eq list.default!, [1,2]
		assert list.default! != list.default!
		eq user.@@options.default!, {a: 1}
		assert user.@@options.default! != user.@@options.default!

	test 'default is only evaluated when the descriptor calls it' do
		let before = created
		let user = new User
		user.@@stamp
		eq created, before
		user.stamp
		eq created, before + 1

	test 'field without default has no default' do
		let user = new User
		eq user.@@plain-field.default, undefined
		eq user.plain-field, undefined

	test 'default together with a modifier chain' do
		let user = new User
		let desc = user.@@counted
		eq desc.chain, ['min:0']
		eq desc.flag, yes
		eq desc.default.literal, 7
		eq user.counted, 7

	test 'default together with descriptor arguments' do
		let user = new User
		eq user.@@sized.args, [1, 2]
		eq user.sized, 'x'

	test 'assigning overrides the default' do
		let user = new User
		user.role = 'admin'
		eq user.role, 'admin'
		eq user.@@role.default!, 'member'

	test 'descriptor and default are shared per class' do
		let a = new User
		let b = new User
		eq a.@@role, b.@@role
		a.role = 'admin'
		eq b.role, 'member'

describe 'descriptor default receivers' do

	test 'descriptor can evaluate the default with the target as self' do
		let user = new User
		eq user.token, 'pre-token'

		class Admin < User
			def prefix
				'adm'

		eq (new Admin).token, 'adm-token'

	test 'lexical class descriptor gets a default' do
		let user = new User
		# each field gets its own `new` instance of the class
		assert user.@@title.$init isa Function
		assert user.@@title != user.@@token
		eq user.@@title.default.literal, 'untitled'
		eq user.title, 'untitled'
		user.title = 'changed'
		eq user.title, 'changed'

	test 'lexical def descriptor gets a default' do
		let user = new User
		let before = plains
		eq user.built, 'built'
		eq user.@@built.default.literal, 'built'
		# created once and cached for the class
		eq plains, before + 1
		eq (new User).built, 'built'
		eq plains, before + 1

	test 'expression descriptor gets the default assigned' do
		let user = new User
		eq user.@@shared, Shared
		eq Shared.default!, 'shared'
		eq user.shared, 'shared'

describe 'descriptor defaults in other positions' do

	test 'subclass redeclares a descriptor with another default' do
		class Base < Model
			kind @field = 'base'
		class Sub < Base
			kind @field = 'sub'

		eq (new Base).kind, 'base'
		eq (new Sub).kind, 'sub'

	test 'static descriptor field with default' do
		class Settings < Model
			static mode @stored = 'dark'

		eq Settings.mode, 'dark'
		eq Settings.@@mode.default.literal, 'dark'
		Settings.mode = 'light'
		eq Settings.mode, 'light'

	test 'prop with descriptor and default runs $init' do
		class Item
			prop label @stored = 'none'

		eq (new Item).label, 'none'
		eq (new Item(label: 'given')).label, 'given'

	test 'multiline object default' do
		class Config < Model
			options @field = {
				a: 1
				b: 2
			}

		eq (new Config).options, {a: 1, b: 2}

	test 'descriptor with default in an extend class body' do
		class Target < Model
			name = 'target'

		extend class Target
			level @field = 5

		let item = new Target
		eq item.level, 5
		eq item.@@level.default.literal, 5
		eq item.name, 'target'

tag descriptor-default-el
	def @attr
		{
			$get: do(target, key) target[key] ?? (this.default and this.default!)
			$set: do(value, target, key) target[key] = value
		}

	size @attr = 'md'

describe 'descriptor defaults in tags' do

	test 'tag field with descriptor default' do
		let el = <descriptor-default-el>
		eq el.size, 'md'
		let other = <descriptor-default-el size='lg'>
		eq other.size, 'lg'
