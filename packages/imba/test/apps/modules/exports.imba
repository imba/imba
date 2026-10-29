import {
	alpha, beta
	sum, make-label
	revealed, again-renamed
	star-one, star-two, star-fn
	named, named-main
	UPPER_CASE, gamma-again, own
} from './reexport-lib.imba'
import reexported-default from './reexport-lib.imba'
import * as re from './reexport-lib.imba'
import * as lib from './named-lib.imba'
import * as star from './star-lib.imba'
import * as imbac from 'imba/compiler'

def compile code, o = {}
	imbac.compile(code, Object.assign({sourcePath: 'snippet.imba', platform: 'browser'}, o)).js

# env-lib re-exports from a specifier the browser cannot resolve behind $node$.
# It is loaded with a dynamic import() so that a kept $node$ export fails a test.
let env-promise = null
def load-env
	env-promise ||= import('./env-lib.imba')

describe 'export lists' do

	test 'export {a, b} of local bindings' do
		eq lib.local-one, 1
		eq lib.local-two, 2

	test 'export {a as b} of local bindings' do
		eq lib.renamed-fn!, 'local-fn'
		eq lib.revealed, 'hidden'
		eq lib.local-fn, undefined
		eq lib.hidden, undefined

	test 'export list can export a class' do
		eq (new lib.LocalThing).kind, 'local'

	test 're-export of imported bindings' do
		eq UPPER_CASE, 42
		eq gamma-again, 'gamma'
		eq re.gamma, undefined
		eq re.imported-gamma, undefined

	test 'export declarations next to export lists' do
		eq own, 'own'
		eq re.own, 'own'

describe 'export from' do

	test 'export {a, b} from' do
		eq alpha, 'alpha'
		eq beta, 'beta'
		eq re.alpha, lib.alpha

	test 'export {a as b} from' do
		eq sum(2, 3), 5
		eq re.sum, lib.add
		eq re.add, undefined
		eq make-label('x'), 'label:x'

	test 'multi-line export {..} from' do
		eq revealed, 'hidden'
		eq again-renamed!, 'local-fn'
		eq re.renamed-fn, undefined

	test 'export {default as x} from' do
		eq named-main!, 'default-main'
		eq named-main, lib.default

	test 'export {default} from' do
		eq reexported-default, 'star-default'
		eq re.default, star.default

describe 'export star' do

	test 'export * from re-exports named bindings' do
		eq star-one, 1
		eq star-two, 2
		eq star-fn!, 'star-fn'
		eq re.star-one, star.star-one

	test 'export * as ns from' do
		assert named === lib
		eq named.alpha, 'alpha'
		eq named.default!, 'default-main'

	test 'export * compiles to plain ESM' do
		let js = compile("export * from './a.imba'\nexport * as b from './b.imba'")
		assert js.includes("export * from './a.imba'")
		assert js.includes("export * as b from './b.imba'")

describe 'env-flagged exports' do

	test 'unflagged export is kept' do
		let env = await load-env!
		eq env.shared, 'shared'

	test '$web$ export {..} is kept in the browser' do
		let env = await load-env!
		eq env.web-value, 'web'

	test '$node$ export {..} is stripped in the browser' do
		let env = await load-env!
		eq env.node-value, undefined

	test '$web$ export {..} from is kept in the browser' do
		let env = await load-env!
		eq env.web-alpha, 'alpha'

	test '$node$ export {..} from is stripped in the browser' do
		let env = await load-env!
		eq env.node-beta, undefined

	test '$web$ export * as is kept in the browser' do
		let env = await load-env!
		eq env.web-star.star-one, 1
		assert env.web-star === star

	test '$node$ export * is stripped in the browser' do
		let env = await load-env!
		eq env.node-fs, undefined
		eq env.readFileSync, undefined

	test 'env-flagged export lists in a node build' do
		let code = "const a = 1\nconst b = 2\n$web$ export \{a\}\n$node$ export \{b\}\n$node$ export * from 'node:fs'\n$web$ export * as s from './s.imba'"
		let js = compile(code, platform: 'node')
		assert js.includes('export {b}')
		assert js.includes("export * from 'node:fs'")
		assert !js.includes('export {a}')
		assert !js.includes('./s.imba')
