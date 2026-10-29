import * as lib from './named-lib.imba'
import * as imbac from 'imba/compiler'

def compile code, o = {}
	imbac.compile(code, Object.assign({sourcePath: 'snippet.imba', platform: 'browser'}, o)).js

let star-loader = null
def load-star-default
	star-loader ||= import('./star-lib.imba').then do(mod) mod.default

class Loader
	def load
		import('./named-lib.imba')

describe 'dynamic import()' do

	test 'literal relative path' do
		let mod = await import('./named-lib.imba')
		eq mod.alpha, 'alpha'
		eq mod.default!, 'default-main'

	test 'resolves to the same namespace as a static import' do
		let mod = await import('./named-lib.imba')
		assert mod === lib

	test 'top-level await import' do
		let mod = await import('./tla-lib.imba')
		eq mod.star.star-one, 1
		eq mod.star-default, 'star-default'

	test 'destructuring the awaited module' do
		let {star-one, star-two} = await import('./star-lib.imba')
		eq star-one + star-two, 3

	test 'member access on the awaited module' do
		eq (await import('./star-lib.imba')).default, 'star-default'
		eq (await import('./named-lib.imba')).make-label('d'), 'label:d'

	test 'then chain on the returned promise' do
		let value = await import('./star-lib.imba').then do(mod) mod.star-fn!
		eq value, 'star-fn'

	test 'memoized loader with ||=' do
		let a = load-star-default!
		let b = load-star-default!
		assert a === b
		eq await a, 'star-default'

	test 'inside a method' do
		let mod = await (new Loader).load!
		eq mod.beta, 'beta'

	test 'path from a variable' do
		let path = './star-lib.imba'
		eq (await import(path)).star-two, 2

	test 'interpolated path' do
		let name = 'star'
		eq (await import("./{name}-lib.imba")).star-one, 1

	test 'rejects when the module cannot be resolved' do
		let error = null
		try
			await import('imba-test-missing-module')
		catch e
			error = e
		assert error isa TypeError

	test 'plain module paths are left as dynamic imports' do
		let js = compile("let m = import('./mod.imba')")
		assert js.includes("import('./mod.imba')")

	test 'import.meta' do
		assert import.meta.url.endsWith('/apps/modules/dynamic-import.imba')

describe 'helper modules load' do
	# a static import that fails to resolve or link makes a page silently run
	# no tests, so load every helper module explicitly here

	test 'named-lib.imba' do
		eq (await import('./named-lib.imba')).alpha, 'alpha'

	test 'star-lib.imba' do
		eq (await import('./star-lib.imba')).star-one, 1

	test 'reexport-lib.imba' do
		eq (await import('./reexport-lib.imba')).own, 'own'

	test 'env-lib.imba' do
		eq (await import('./env-lib.imba')).shared, 'shared'

	test 'side-effect-lib.imba' do
		eq (await import('./side-effect-lib.imba')).marker, 'side'

	test 'type-imports-lib.imba' do
		eq (await import('./type-imports-lib.imba')).typed-value, 'alpha'

	test 'tla-lib.imba' do
		eq (await import('./tla-lib.imba')).star-default, 'star-default'

	test 'env-imports-lib.imba' do
		eq typeof (await import('./env-imports-lib.imba')).kept, 'function'

describe 'asset imports' do
	# the test server cannot serve assets, so these check the compiled output

	test 'import() of a path with a query becomes a static import' do
		let js = compile("let txt = import('./notes.md?text')")
		assert js.includes("from './notes.md?text'")
		assert !js.includes("import('./notes.md?text')")

	test 'import() of an image path becomes a static import' do
		let js = compile("let svg = import('./icon.svg')")
		assert js.includes("from './icon.svg'")
		assert !js.includes("import('./icon.svg')")

	test 'import.kind() adds the kind as a query' do
		let js = compile("let a = import.file('./sound.mp3')\nlet b = import.webworker('./worker.imba')\nlet c = import.text('./readme.md')")
		assert js.includes("from './sound.mp3?file'")
		assert js.includes("from './worker.imba?webworker'")
		assert js.includes("from './readme.md?text'")

	test 'the same asset is imported once' do
		let js = compile("let a = import('./n.md?text')\nlet b = import('./n.md?text')")
		eq js.split("'./n.md?text'").length, 2

	test 'asset import is placed after the last import' do
		let js = compile("import \{a\} from './a.imba'\nlet x = a\nimport \{b\} from './b.imba'\nlet t = import.text('./t.md')")
		let at = js.indexOf("'./t.md?text'")
		assert at > js.indexOf("'./b.imba'")
		assert at > js.indexOf('let x')
		assert at < js.indexOf('let t')

	test 'asset import inside an excluded $node$ block is dropped' do
		let js = compile("if $node$\n\tlet txt = import('./server.md?text')")
		assert !js.includes('server.md')

	test '$node$ asset import is stripped in the browser' do
		let js = compile("$node$ import notes from './notes.md?text'")
		assert !js.includes('notes.md')
		let node = compile("$node$ import notes from './notes.md?text'", platform: 'node')
		assert node.includes("import notes from './notes.md?text'")

describe 'require()' do

	test 'require() calls are left as plain calls' do
		let js = compile("const \{chromium\} = require('playwright-core')\nrequire('dotenv').config()")
		assert js.includes("require('playwright-core')")
		assert js.includes("require('dotenv').config()")

	test 'require() resolves to the global require at runtime' do
		globalThis.require = do(name) {name: name}
		try
			eq require('some-module').name, 'some-module'
		finally
			delete globalThis.require
