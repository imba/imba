let fs = {}

import * as imbac from 'imba/compiler'

fs.code1 = """
if $node$
	'Node'
if $browser$
	'Browser'
if $worker$
	'Worker'
"""

fs.indenterr = """
if true
	 yes
	yes
"""

fs.tagimplicitcall = """
let tag = do(v) v * 2
let value = tag 50
"""

fs.classcommentbody = """
class Foo
	# just a comment
"""

fs.tagcommentbody = """
tag foo-bar
	# just a comment
"""

def compile name, o = {}
	o.sourcePath ||= "{name}.imba"
	imbac.compile(fs[name],o)

test 'platform: node' do
	let res = String compile('code1', platform: 'node')
	ok res.indexOf('Node') >= 0
	ok res.indexOf('Browser') == -1
	ok res.indexOf('Worker') == -1

test 'platform: browser' do
	let res = String compile('code1', platform: 'browser')
	ok res.indexOf('Browser') >= 0
	ok res.indexOf('Node')  == -1
	ok res.indexOf('Worker') == -1

test 'platform: worker' do
	let res = String compile('code1', platform: 'worker')
	ok res.indexOf('Worker') >= 0
	ok res.indexOf('Node')  == -1
	ok res.indexOf('Browser') == -1

# diagnostics

test 'warning source line survives serialization' do
	let code = 'class Foo\n\tdef stopped? turn\n\t\tyes\n'
	let res = imbac.compile(code,sourcePath: 'warning.imba')
	let warning = JSON.parse(JSON.stringify(res.warnings[0]))
	eq warning.message, 'def stopped? takes parameters and stays a plain method (only parameterless predicates become getters) - name it isStopped instead'
	eq warning.range.start.line, 1
	eq warning.range.start.character, 5
	eq warning.range.end.character, 13
	eq warning.lineText, '\tdef stopped? turn'

# predicate defs

test 'predicate def without params compiles to a getter' do
	let code = 'class Foo\n\tdef stopped?\n\t\tyes\n\tstatic def shared-state?\n\t\tno\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	eq res.warnings.length, 0
	assert res.js.indexOf('get stoppedΦ(') >= 0
	assert res.js.indexOf('static get sharedΞstateΦ(') >= 0

test 'predicate def in tsc mode is typed as a getter' do
	let code = 'class Foo\n\tdef stopped?\n\t\tyes\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba', platform: 'tsc')
	assert res.js.indexOf('get stoppedΦ(') >= 0

test 'async predicates compile to promise-returning getters' do
	let code = 'class Foo\n\tdef ready?\n\t\tawait 1\n\t\tyes\n\tget loaded?\n\t\tawait 1\n\t\tyes\n\tstatic def shared?\n\t\tawait 1\n\t\tyes\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	eq res.warnings.length, 0
	assert res.js.indexOf('get readyΦ(){\n\t\treturn (async () => {') >= 0
	assert res.js.indexOf('get loadedΦ(){\n\t\treturn (async () => {') >= 0
	assert res.js.indexOf('static get sharedΦ(){\n\t\treturn (async () => {') >= 0
	assert res.js.indexOf('async get') == -1

test 'async predicate getter has no async keyword in tsc mode' do
	let code = 'class Foo\n\tdef ready?\n\t\tawait 1\n\t\tyes\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba', platform: 'tsc')
	assert res.js.indexOf('get readyΦ()') >= 0
	assert res.js.indexOf('return (async () => {') >= 0
	assert res.js.indexOf('async get') == -1

test 'async predicate def with parameters stays an async method' do
	let code = 'class Foo\n\tdef bigger? n\n\t\tawait 1\n\t\tn > 1\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	eq res.warnings.length, 1
	assert res.warnings[0].message.indexOf('def bigger? takes parameters') == 0
	assert res.js.indexOf('async biggerΦ(n)') >= 0

test 'generator predicate def stays a method and warns' do
	let code = 'class Foo\n\tdef items?\n\t\tyield 1\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	eq res.warnings.length, 1
	assert res.warnings[0].message.indexOf('def items? is a generator and stays a plain method') == 0
	assert res.js.indexOf('*itemsΦ(') >= 0

test 'unawaited async predicate use in its own class warns' do
	let code = 'class Foo\n\tdef ready?\n\t\tawait 1\n\t\tyes\n\tdef check\n\t\tif ready?\n\t\t\t1\n\t\tlet a = self.ready?\n\t\tlet b = await ready?\n\t\tlet c = await ready?!\n\t\tlet d = ready?.then(do 1)\n\t\tlet e = await Promise.all([ready?])\n\t\tlet f = other.ready?\n\t\tready?\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	eq res.warnings.length, 2
	assert res.warnings[0].message.indexOf('ready? is an async predicate') == 0
	eq res.warnings[0].range.start.line, 5
	eq res.warnings[1].range.start.line, 7

test 'unawaited async predicate in a tag flag warns' do
	let code = 'tag foo-bar\n\tdef ready?\n\t\tawait 1\n\t\tyes\n\tdef render\n\t\t<self .on=ready? .off=(await ready?)>\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	eq res.warnings.length, 1
	eq res.warnings[0].range.start.line, 5

test 'predicate def outside a class stays a function and warns' do
	let code = 'def ready?\n\tyes\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	eq res.warnings.length, 1
	assert res.warnings[0].message.indexOf('def ready? is not a class member and stays a plain function') == 0
	assert res.js.indexOf('function readyΦ(') >= 0

test 'explicit predicate call reads once and calls only functions' do
	let code = 'let item = {}\nlet a = item.ready?!\nlet b = item.ready?\nlet c = item.ready?(1)\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	assert res.js.indexOf("let a = (typeof ($1 = item.readyΦ) == 'function' ? $1.call(item) : $1);") >= 0
	assert res.js.indexOf("let b = item.readyΦ;") >= 0
	assert res.js.indexOf("let c = item.readyΦ(1);") >= 0

test 'explicit predicate call caches a complex receiver' do
	let code = 'def next\n\t{}\nlet a = next!.ready?!\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	assert res.js.indexOf("(typeof ($2 = ($1 = next()).readyΦ) == 'function' ? $2.call($1) : $2)") >= 0

test 'explicit predicate call after new binds new to the constructor' do
	let code = 'class Foo\n\tdef ready?\n\t\tyes\nlet a = new Foo().ready?!\nlet b = new Foo().ready?\nlet c = new Foo.ready?!\nlet d = new Foo().bar!\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	assert !!res.js.match(/let a = \(typeof \(\$\d+ = \(\$\d+ = new Foo\(\)\)\.readyΦ\) == 'function' \? \$\d+\.call\(\$\d+\) : \$\d+\);/)
	assert res.js.indexOf("let b = new Foo().readyΦ;") >= 0
	assert res.js.indexOf("let c = new Foo.readyΦ();") >= 0
	assert res.js.indexOf("let d = new Foo().bar();") >= 0

test 'explicit predicate call inside an amperfunc declares its temporary' do
	let code = 'let items = []\nlet a = items.filter(&.ready?!)\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	assert !!res.js.match(/\(v\$\)=>\{ var \$\d+; return \(typeof \(\$\d+ = v\$\.readyΦ\) == 'function' \? \$\d+\.call\(v\$\) : \$\d+\) \}/)

test 'indentation error' do
	let res = compile('indenterr')
	eq res.errors.length, 1
	eq res.errors[0].range.start.line,1
	eq res.errors[0].range.start.character,1

test 'tag implicit call error' do
	let res = compile('tagimplicitcall')
	eq res.errors.length, 1
	ok res.errors[0].message.indexOf('use `tag(...)`') >= 0

test 'class body with only a comment' do
	let res = compile('classcommentbody')
	eq res.errors.length, 0
	ok String(res).indexOf('class Foo') >= 0

test 'tag body with only a comment' do
	let res = compile('tagcommentbody')
	eq res.errors.length, 0
	ok String(res).indexOf('class FooBar') >= 0

test 'raiseErrors' do
	try
		let res = compile('indenterr',raiseErrors: true)
		ok false
	catch e
		ok true
