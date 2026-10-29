import * as imbac from 'imba/compiler'

# Class members prefixed with an environment flag like `$node$` or `$web$`
# are only compiled for matching platforms. Tests compile for the browser.

def compile code, platform = 'browser'
	imbac.compile(code, sourcePath: 'env.imba', platform: platform)

let marked = []

def @mark target, key, desc
	marked.push(key)
	desc

class Service
	$node$ def read-file
		'node'

	$web$ def read-file
		'web'

	$browser$ def browser-only
		'browser'

	$node$ def server-only
		yes

	$worker$ def worker-only
		yes

	$node$ static def boot
		'node'

	$web$ static def boot
		'web'

	$node$ get platform
		'node'

	$web$ get platform
		'web'

	$web$ set target value
		#target = "web:{value}"

	get target
		#target

	$js$ get compiled
		'js'

	$tsc$ get typed-only
		'tsc'

	$node$ $web$ def anywhere
		'any'

	@mark $node$ def marked-node
		yes

	@mark $web$ def marked-web
		yes

	$node$ secret = 'node-secret'
	$web$ token = 'web-token'
	$node$ #handle = 1
	$web$ #view = 2

	def has key
		self[key] !== undefined

describe 'environment flagged class members' do

	test 'web method replaces the node variant' do
		eq (new Service).read-file!, 'web'

	test 'browser flag counts as web' do
		eq (new Service).browser-only!, 'browser'

	test 'members for other platforms are left out' do
		let item = new Service
		eq item.server-only, undefined
		eq item.worker-only, undefined
		eq item.typed-only, undefined
		let names = Object.getOwnPropertyNames(Service.prototype).join(',')
		assert names.indexOf('server') == -1
		assert names.indexOf('worker') == -1
		assert names.indexOf('typed') == -1
		assert names.indexOf('browser') >= 0

	test 'static methods' do
		eq Service.boot!, 'web'

	test 'getters and setters' do
		let item = new Service
		eq item.platform, 'web'
		item.target = 'x'
		eq item.target, 'web:x'

	test 'js flag is on outside of tsc' do
		eq (new Service).compiled, 'js'

	test 'several flags include the member when any matches' do
		eq (new Service).anywhere!, 'any'

	test 'decorators only apply to included members' do
		eq marked.length, 1
		assert marked[0].indexOf('web') >= 0
		eq (new Service).marked-node, undefined
		eq (new Service).marked-web!, yes

	test 'fields' do
		let item = new Service
		eq item.token, 'web-token'
		assert !item.hasOwnProperty('secret')
		eq item[Symbol.for('#view')], 2
		assert !item.hasOwnProperty(Symbol.for('#handle'))

	test 'excluded fields are not read from the init object' do
		let item = new Service(secret: 'given', token: 'given')
		eq item.secret, undefined
		eq item.token, 'given'

describe 'environment flags in extend class and tags' do

	class Base
		value = 1

	extend class Base
		$node$ def where
			'node'
		$web$ def where
			'web'
		$node$ get only-node
			yes

	test 'extend class respects flags' do
		let item = new Base
		eq item.where!, 'web'
		eq item.only-node, undefined

	tag env-members-el
		$node$ def where
			'node'
		$web$ def where
			'web'
		$web$ mode = 'web-mode'
		$node$ other = 'node-mode'

	test 'tag respects flags' do
		let el = <env-members-el>
		eq el.where!, 'web'
		eq el.mode, 'web-mode'
		eq el.other, undefined

describe 'environment flags in compiled output' do

	const source = '''
	class Service
		$node$ def read
			'node'
		$web$ def write
			'web'
		$node$ static def boot
			1
		$web$ field = 1
	'''

	test 'browser platform drops node members' do
		let js = compile(source).js
		assert js.indexOf('read(') == -1
		assert js.indexOf('boot(') == -1
		assert js.indexOf('write(') >= 0
		assert js.indexOf('this.field =') >= 0

	test 'node platform drops web members' do
		let js = compile(source, 'node').js
		assert js.indexOf('read(') >= 0
		assert js.indexOf('static boot(') >= 0
		assert js.indexOf('write(') == -1
		assert js.indexOf('this.field') == -1
