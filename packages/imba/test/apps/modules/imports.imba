import {alpha, beta, gamma} from './named-lib.imba'
import {alpha as first, beta as second} from './named-lib.imba'
import {gamma as third, UPPER_CASE, add as plus} from './named-lib.imba'
import main, {add, make-label} from './named-lib.imba'
import main-again, * as lib from './named-lib.imba'
import * as star from './star-lib.imba'
import star-default from './star-lib.imba'
import {default as named-default} from './named-lib.imba'
import {
	local-one
	local-two
	renamed-fn
} from './named-lib.imba'
import {
	LocalThing,
	revealed,
	Point,
} from './named-lib.imba'
import {
	counter, bump
	set-local-two
} from './named-lib.imba'
import {star-one,
	star-two} from './star-lib.imba'
import {
	star-fn as star-function
	UPPER_CASE as answer} from './reexport-lib.imba'
import {} from './side-effect-lib.imba'
import './side-effect-lib.imba'
import {marker} from './side-effect-lib.imba'
import * as imbac from 'imba/compiler'

def compile code, o = {}
	imbac.compile(code, Object.assign({sourcePath: 'snippet.imba', platform: 'browser'}, o)).js

# imports after other statements, as apps do in the middle of a module
const late-prefix = 'late'
import {beta as late-beta} from './named-lib.imba'

describe 'named imports' do

	test 'several bindings from one module' do
		eq alpha, 'alpha'
		eq beta, 'beta'
		eq gamma, 'gamma'

	test 'renamed bindings' do
		eq first, 'alpha'
		eq second, 'beta'

	test 'renamed and plain bindings in one list' do
		eq third, 'gamma'
		eq UPPER_CASE, 42
		eq plus(2, 3), 5
		eq plus, add

	test 'dashed names' do
		eq make-label('a'), 'label:a'
		eq lib.make-label('b'), 'label:b'

	test 'import after other statements' do
		eq "{late-prefix}-{late-beta}", 'late-beta'

	test 'imported functions and classes' do
		eq add(1, 2), 3
		let point = new Point(x: 2, y: 3)
		eq point.sum, 5

	test 'imported class can be extended' do
		class Point3 < Point
			z = 4
			get sum
				super.sum + z

		let point = new Point3(x: 1, y: 2)
		eq point.sum, 7
		assert point isa Point

	test 'bindings from an export list' do
		eq local-one, 1
		eq renamed-fn!, 'local-fn'
		eq revealed, 'hidden'
		eq (new LocalThing).kind, 'local'

	test 'imports are live bindings' do
		let before = counter
		bump!
		eq counter, before + 1
		bump!
		eq counter, before + 2

	test 'live binding through an export list' do
		eq local-two, 2
		set-local-two(5)
		eq local-two, 5
		set-local-two(2)
		eq local-two, 2

describe 'multi-line specifier lists' do

	test 'one specifier per line' do
		eq local-one, 1
		eq local-two, 2
		eq renamed-fn!, 'local-fn'

	test 'with trailing commas' do
		eq revealed, 'hidden'
		eq (new Point).sum, 0

	test 'several specifiers per line' do
		eq typeof counter, 'number'
		eq typeof bump, 'function'
		eq typeof set-local-two, 'function'

	test 'continued on the next line' do
		eq star-one, 1
		eq star-two, 2

	test 'closing brace after the last specifier' do
		eq star-function!, 'star-fn'
		eq answer, 42

describe 'default and namespace imports' do

	test 'default import' do
		eq main!, 'default-main'
		eq star-default, 'star-default'

	test 'default and named imports together' do
		eq main, named-default
		eq add(2, 2), 4
		eq make-label('c'), 'label:c'

	test 'default specifier inside braces' do
		eq named-default!, 'default-main'

	test 'default and namespace imports together' do
		eq main-again, main
		eq lib.default, main
		eq lib.alpha, 'alpha'
		eq lib.local-one, 1

	test 'namespace import' do
		eq lib[Symbol.toStringTag], 'Module'
		eq star.star-one, 1
		eq star.star-fn!, 'star-fn'
		eq star.default, 'star-default'

	test 'namespace only has exported names' do
		assert Reflect.has(lib, 'revealed')
		assert !Reflect.has(lib, 'hidden')
		eq lib.local-fn, undefined
		eq lib.renamed-fn, renamed-fn

describe 'side-effect imports' do

	test 'module is evaluated once for all import forms' do
		eq globalThis.IMBA_TEST_SIDE_EFFECTS, ['side-effect-lib']
		eq marker, 'side'

	test 'empty specifier list compiles to a bare import' do
		let js = compile("import \{\} from './x.imba'")
		assert js.includes("import './x.imba'")
		assert !js.includes('{}')

describe 'type imports' do

	test 'module with type-only imports loads' do
		# type-imports-lib imports types from a specifier the browser cannot resolve
		let mod = await import('./type-imports-lib.imba')
		eq mod.typed-value, 'alpha'

	test 'type-only names can be used in annotations' do
		let mod = await import('./type-imports-lib.imba')
		eq mod.typed-sum(1, 2, 3), 6
		eq mod.typed-pair(1, 2), [1, 2]
		eq mod.typed-node('n'), 'n'

	test 'named type imports are erased' do
		let js = compile("import type \{A, B as C\} from 'types-pkg'\nlet x\\A = 1")
		assert !js.includes('types-pkg')
		assert js.includes('let x = 1')

	test 'default type import is erased' do
		let js = compile("import type A from 'types-pkg'\nlet x\\A = 1")
		assert !js.includes('types-pkg')

	test 'multi-line type import is erased' do
		let js = compile("import type \{\n\tA\n\tB\n\} from 'types-pkg'\nlet x = 1")
		assert !js.includes('types-pkg')
		assert !js.includes('import')

	test 'value imports next to type imports are kept' do
		let js = compile("import type \{A\} from 'types-pkg'\nimport \{b\} from 'values-pkg'\nlet x\\A = b")
		assert !js.includes('types-pkg')
		assert js.includes("import \{b\} from 'values-pkg'")
