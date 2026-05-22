import * as imbac from 'imba/compiler'

let fixtures = {}

fixtures.global = """
let a = 2
let b = 3
assert a < b
"""

fixtures.imported = """
import assert from 'assert'
assert(value > 2)
"""

fixtures.local = """
let assert = do(v) v
assert(value > 2)
"""

fixtures.globalEq = """
let actual = 2
let expected = 3
eq actual, expected
"""

fixtures.localEq = """
let eq = do(a,b) a == b
eq(actual, expected)
"""

def compile source
	String imbac.compile(source, sourcePath: 'assert-fixture.imba')

test 'compiler rewrites global assert' do
	let js = compile(fixtures.global)
	ok js.indexOf('globalThis.IMBA_ASSERT') >= 0
	ok js.indexOf('operator:"<"') >= 0
	ok js.indexOf('source:"a < b"') >= 0

test 'compiler leaves shadowed assert alone' do
	ok compile(fixtures.imported).indexOf('globalThis.IMBA_ASSERT') == -1
	ok compile(fixtures.local).indexOf('globalThis.IMBA_ASSERT') == -1

test 'compiler rewrites global eq' do
	let js = compile(fixtures.globalEq)
	ok js.indexOf('globalThis.IMBA_EQ') >= 0
	ok js.indexOf('actual:{source:"actual"') >= 0
	ok js.indexOf('expected:{source:"expected"') >= 0

test 'compiler leaves shadowed eq alone' do
	ok compile(fixtures.localEq).indexOf('globalThis.IMBA_EQ') == -1

test 'runtime captures binary assert' do
	let left = {count: 2}
	let right = 4

	assert left.count < right

	let info = globalThis.IMBA_ASSERT
	eq info.type, 'binary'
	eq info.source, 'left.count < right'
	eq info.operator, '<'
	eq info.left.source, 'left.count'
	eq info.left.value, 2
	eq info.right.source, 'right'
	eq info.right.value, 4

test 'runtime caches inspected sides once' do
	let hits = 0
	let next = do
		hits++
		hits

	assert next! == 1
	eq hits, 1
	eq globalThis.IMBA_ASSERT.left.value, 1

test 'runtime captures expression assert' do
	let ready = yes

	assert ready

	let info = globalThis.IMBA_ASSERT
	eq info.type, 'expression'
	eq info.source, 'ready'
	eq info.value, true

test 'runtime preserves assignment assert expression' do
	let target = no
	let value = yes

	assert target = value

	let info = globalThis.IMBA_ASSERT
	eq target, yes
	eq info.type, 'assignment'
	eq info.source, 'target = value'
	eq info.value, true

test 'runtime captures eq sides' do
	let left = {count: 2}
	let right = 2

	eq left.count, right

	let info = SPEC.context.assertions[-1].options.eq
	eq info.source, 'eq left.count, right'
	eq info.actual.source, 'left.count'
	eq info.actual.value, 2
	eq info.expected.source, 'right'
	eq info.expected.value, 2

test 'runtime caches eq sides once' do
	let leftHits = 0
	let rightHits = 0
	let left = do
		leftHits++
		1
	let right = do
		rightHits++
		1

	eq left!, right!

	let info = SPEC.context.assertions[-1].options.eq
	assert leftHits == 1
	assert rightHits == 1
	eq info.actual.value, 1
	eq info.expected.value, 1

test 'eq failure message' do
	let left = {count: 2}
	let right = 4

	eq left.count, right
	let ass = SPEC.context.assertions[-1]
	let msg = ass.toString!
	ass.failed = no

	assert msg.indexOf('eq left.count, right failed') >= 0
	assert msg.indexOf('left.count: 2') >= 0
	assert msg.indexOf('right: 4') >= 0

test 'assert failure message' do
	let item = 100

	assert item > 110
	let ass = SPEC.context.assertions[-1]
	let msg = ass.toString!
	ass.failed = no

	assert msg.indexOf('assert item > 110 failed') >= 0
	assert msg.indexOf('item: 100') >= 0

test 'assignment assert failure message' do
	let target = yes
	let value = no

	assert target = value
	let ass = SPEC.context.assertions[-1]
	let msg = ass.toString!
	ass.failed = no

	assert target == no
	assert msg.indexOf('assert target = value failed') >= 0
	assert msg.indexOf('value: false') >= 0
