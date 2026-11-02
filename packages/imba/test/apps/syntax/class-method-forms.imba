import * as imbac from 'imba/compiler'

# Less common method shapes: empty bodies, trailing comments on the header,
# defs nested inside methods, global defs, return types and `protected`.

def compile code, platform = 'browser'
	imbac.compile(code, sourcePath: 'methods.imba', platform: platform)

class Player
	name = 'player'

	# hook for subclasses
	def refresh

	def play
		refresh!
		'playing'

	get icon # trailing comment on a getter
		'icon'

	def scale x # trailing comment on a method
		x * 2

	set volume value # trailing comment on a setter
		#volume = value

	get volume
		#volume

	static def create # trailing comment on a static method
		new self

	def stop
	# a comment directly after an empty def

	def last-empty

class LoudPlayer < Player
	def refresh
		#refreshed = yes

	get refreshed
		#refreshed

describe 'empty method bodies' do

	test 'empty def returns undefined' do
		let player = new Player
		eq player.refresh!, undefined
		eq player.stop!, undefined
		eq player.last-empty!, undefined

	test 'empty def is still a method' do
		assert Player.prototype.refresh isa Function
		assert Player.prototype.stop isa Function
		eq (new Player).play!, 'playing'

	test 'empty def can be overridden' do
		let player = new LoudPlayer
		eq player.play!, 'playing'
		eq player.refreshed, yes

	test 'empty def at the top level' do
		def noop

		eq noop!, undefined

describe 'trailing comment after the header' do

	test 'getter' do
		eq (new Player).icon, 'icon'

	test 'method with params' do
		eq (new Player).scale(4), 8

	test 'setter' do
		let player = new Player
		player.volume = 5
		eq player.volume, 5

	test 'static method' do
		assert Player.create! isa Player

	test 'top-level def' do
		def triple x # comment
			x * 3

		eq triple(2), 6

describe 'defs nested inside methods' do

	class Walker
		prefix = '>'

		def walk tree
			let seen = []
			def visit node, depth
				seen.push(label(node.name, depth))
				for child in (node.children or [])
					visit(child, depth + 1)
			visit(tree, 0)
			seen

		def label name, depth
			"{prefix}{depth}:{name}"

		def collect items
			let out = []
			def keep item
				out.push(item) if item > 1
			items.forEach(keep)
			out

		def counter
			let count = 0
			def bump
				count += 1
			bump!
			bump!
			count

	test 'nested def can recurse and call methods on the outer self' do
		let walker = new Walker
		let tree = {name: 'a', children: [{name: 'b', children: [{name: 'c'}]}, {name: 'd'}]}
		eq walker.walk(tree), ['>0:a','>1:b','>2:c','>1:d']

	test 'nested def passed as a callback keeps the outer self' do
		eq (new Walker).collect([1,2,3]), [2,3]

	test 'nested def closes over locals' do
		eq (new Walker).counter!, 2

	test 'nested def does not become a method' do
		assert Walker.prototype.visit === undefined
		assert Walker.prototype.bump === undefined

describe 'constructors referencing self after super' do

	class Base
		value = 1

		def constructor o = null
			super()
			created = 'base'

	class Sub < Base
		def constructor o = null
			super
			handler = do value + 1
			deferred = [1, 2].map do $1 + value

	class SubWithArgs < Base
		def constructor o, extra
			super(o)
			value = o.value
			read = do [value, extra]

	test 'closure in a constructor sees self after super' do
		let item = new Sub
		eq item.handler!, 2
		eq item.deferred, [2, 3]
		eq item.created, 'base'

	test 'closure sees later changes on self' do
		let item = new Sub
		item.value = 5
		eq item.handler!, 6

	test 'super with arguments' do
		let item = new SubWithArgs({value: 3}, 'x')
		eq item.read!, [3, 'x']

describe 'global def' do

	global def method_forms_helper value = 1
		value * 3

	test 'global def is callable locally' do
		eq method_forms_helper(2), 6
		eq method_forms_helper!, 3

	test 'global def is registered on globalThis' do
		eq globalThis.method_forms_helper, method_forms_helper
		eq globalThis.method_forms_helper(3), 9

	test 'global def is visible from other scopes through globalThis' do
		let fn = do global.method_forms_helper(4)
		eq fn!, 12

describe 'return type annotations' do

	class Stream
		items = []

		def add\Stream item\number
			items.push(item)
			self

		def first\number?
			items[0]

		def commit\any cursor\Stream?
			cursor or self

		get size\number
			items.length

		static def make\Stream
			new Stream

	test 'methods with return types run normally' do
		let stream = Stream.make!
		stream.add(1).add(2)
		eq stream.size, 2
		eq stream.first!, 1
		eq stream.commit!, stream

	test 'return types appear in tsc output only' do
		let code = '''
		class Stream
			def add\\Stream item\\number
				self
			get size\\number
				1
		'''
		let js = compile(code).js
		assert js.indexOf('add(item){') >= 0
		assert js.indexOf('get size(){') >= 0
		let ts = compile(code, 'tsc').js
		assert ts.indexOf('add(item:number):Stream {') >= 0
		assert ts.indexOf('get size():number {') >= 0

describe 'protected members' do

	class Vault
		protected secret = 42
		protected def reveal
			secret
		protected get hint
			'h'
		def open
			reveal!

	test 'protected members are regular members at runtime' do
		let vault = new Vault
		eq vault.secret, 42
		eq vault.reveal!, 42
		eq vault.hint, 'h'
		eq vault.open!, 42
		eq (new Vault(secret: 1)).open!, 1

	test 'protected is only emitted for tsc' do
		let code = 'class Vault\n\tprotected secret = 1\n\tprotected def reveal\n\t\tsecret\n'
		let js = compile(code).js
		assert js.indexOf('protected') == -1
		let ts = compile(code, 'tsc').js
		assert ts.indexOf('protected secret = 1') >= 0
		assert ts.indexOf('protected reveal()') >= 0

describe 'methods named like soft keywords' do

	class Observer
		calls = []

		def watch cb
			calls.push('watch')
			cb

		def guard value
			calls.push('guard')
			value

		def alter value
			calls.push('alter')
			value * 2

		def run
			[watch(1), guard(2), alter(3), self.watch(4)]

	test 'watch, guard and alter work as method names' do
		let obs = new Observer
		eq obs.run!, [1, 2, 6, 4]
		eq obs.calls, ['watch','guard','alter','watch']

	test 'watch, guard and alter work as local names' do
		let watch = 1
		let guard = 2
		let alter = do $1 + watch + guard
		eq alter(3), 6

describe 'static accessors' do

	class Config
		static set mode value
			#mode = value

		static get mode
			#mode or 'default'

		static get label do "mode:{mode}"

	class SubConfig < Config

	test 'static getter and setter' do
		eq Config.mode, 'default'
		Config.mode = 'dark'
		eq Config.mode, 'dark'
		eq Config.label, 'mode:dark'

	test 'static accessors are inherited' do
		SubConfig.mode = 'light'
		eq SubConfig.mode, 'light'
		eq SubConfig.label, 'mode:light'
