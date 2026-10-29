# `mixin Name` declares a class flagged as a mixin. Classes take it in with
# `isa`. A mixin can extend another mixin, and the whole chain is mixed in.

const IsMixin = 1 << 10

def mixin-flag klass
	klass[Symbol.for('#meta')].flags & IsMixin

mixin Named
	name = 'unnamed'

	get label
		"named {name}"

mixin Titled < Named
	title = 'untitled'

	get heading
		"{title} - {label}"

mixin Counted
	count = 0

	def bump
		++count

class Doc
	isa Titled
	isa Counted

	body = ''

class Plain
	get plain
		yes

class PlainSub < Plain
	get sub
		yes

class UsesMixinParent < Named
	get uses
		yes

describe 'mixin keyword' do

	test 'mixin compiles to a class flagged as mixin' do
		assert Named isa Function
		eq Named.name, 'Named'
		eq mixin-flag(Named), IsMixin
		eq mixin-flag(Titled), IsMixin
		eq mixin-flag(Plain), 0

	test 'class gets members from a mixin chain' do
		let doc = new Doc
		eq doc.label, 'named unnamed'
		eq doc.heading, 'untitled - named unnamed'
		eq doc.bump!, 1
		eq doc.bump!, 2

	test 'mixin fields are initialized' do
		let doc = new Doc
		eq doc.name, 'unnamed'
		eq doc.title, 'untitled'
		eq doc.count, 0
		eq doc.body, ''

	test 'mixin fields read the init object' do
		let doc = new Doc(name: 'readme', title: 'Intro', count: 5)
		eq doc.heading, 'Intro - named readme'
		eq doc.bump!, 6

	test 'isa works for every mixin in the chain' do
		let doc = new Doc
		assert doc isa Doc
		assert doc isa Titled
		assert doc isa Named
		assert doc isa Counted
		assert (new Plain) !isa Named

	test 'mixin superclass is not added to the prototype chain' do
		let doc = new Doc
		assert !Titled.prototype.isPrototypeOf(Doc.prototype)
		assert !Named.prototype.isPrototypeOf(Doc.prototype)
		# members are copied onto a generated base class
		let base = Object.getPrototypeOf(Doc.prototype)
		assert base.hasOwnProperty('label')
		assert base.hasOwnProperty('heading')
		assert base.hasOwnProperty('bump')

	test 'class whose superclass is a mixin can be mixed in' do
		class Consumer
			isa UsesMixinParent

		let item = new Consumer
		eq item.uses, yes
		eq item.label, 'named unnamed'
		assert item isa Named

	test 'class whose superclass is not a mixin cannot be mixed in' do
		let define = do
			class Consumer
				isa PlainSub
			Consumer

		let err = rescue define!
		assert err isa Error
		eq err.message, 'Mixin PlainSub has superclass not present in target class'

	test 'mixing in a class whose superclass is already present works' do
		class Consumer < Plain
			isa PlainSub

		let item = new Consumer
		eq item.plain, yes
		eq item.sub, yes

describe 'extend mixin' do

	mixin Greets
		get hello
			'hello'

	class Greeter
		isa Greets

	test 'extending a mixin updates classes that already use it' do
		let item = new Greeter
		eq item.hello, 'hello'
		eq item.bye, undefined

		extend mixin Greets
			get bye
				'bye'

			def shout
				hello.toUpperCase!

		eq item.bye, 'bye'
		eq item.shout!, 'HELLO'

	test 'classes defined after the extension also get the new members' do
		class LateGreeter
			isa Greets

		eq (new LateGreeter).bye, 'bye'

describe 'global mixin' do

	global mixin GlobalMixinKeyword
		get from-global
			'global'

	test 'global mixin is registered on globalThis' do
		eq globalThis.GlobalMixinKeyword, GlobalMixinKeyword
		eq mixin-flag(GlobalMixinKeyword), IsMixin

	test 'global mixin can be used with isa' do
		class UsesGlobal
			isa GlobalMixinKeyword

		eq (new UsesGlobal).from-global, 'global'

describe 'mixins in tags' do

	mixin Labelled
		label = 'tag-label'

		get shout
			label.toUpperCase!

	tag mixin-keyword-el
		isa Labelled

	test 'tag can use a mixin declared with the mixin keyword' do
		let el = <mixin-keyword-el>
		eq el.label, 'tag-label'
		eq el.shout, 'TAG-LABEL'
		assert el isa Labelled
