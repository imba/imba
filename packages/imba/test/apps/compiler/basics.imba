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
	let code = 'if yes\n\tdef stopped?\n\t\tyes\n'
	let res = imbac.compile(code,sourcePath: 'warning.imba')
	let warning = JSON.parse(JSON.stringify(res.warnings[0]))
	eq warning.message, 'def stopped? is not a class member and stays a plain function, so stopped? without a call is the function itself - call it as stopped?!'
	eq warning.range.start.line, 1
	eq warning.range.start.character, 5
	eq warning.range.end.character, 13
	eq warning.lineText, '\tdef stopped?'

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

test 'predicate def with parameters is a method and does not warn' do
	let code = '''
	class Foo
		def contains? item
			yes
		static def valid? value
			yes
		def check x
			contains?(x) and contains? x
	extend class Foo
		def covers? a, b = 1, ...rest
			yes
	tag foo-bar
		def selected? item
			yes
	def Foo.known? key
		yes
	def matches? a, b
		a == b
	let obj = {
		def has? key
			yes
	}
	let foo = new Foo
	foo.contains?(1)
	foo.contains? 2
	foo..contains?(3)
	matches?(1,2)
	obj.has? 1
	'''
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	eq res.warnings.length, 0
	for part in [
		'containsΦ(item){'
		'static validΦ(value){'
		'return this.containsΦ(x) && this.containsΦ(x);'
		'coversΦ(a,b = 1,...rest){'
		'selectedΦ(item){'
		'function matchesΦ(a,b){'
		'hasΦ(key){'
		'foo.containsΦ(1);'
		'foo.containsΦ(2);'
		'foo?.containsΦ?.(3);'
		'matchesΦ(1,2);'
		'obj.hasΦ(1);'
	]
		assert res.js.indexOf(part) >= 0
	assert res.js.indexOf('knownΦ') >= 0
	assert res.js.indexOf('get containsΦ') == -1
	assert res.js.indexOf('get hasΦ') == -1

test 'predicate def with parameters is a method in tsc mode' do
	let code = 'class Foo\n\tdef contains? item\n\t\tyes\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba', platform: 'tsc')
	eq res.warnings.length, 0
	assert res.js.indexOf('containsΦ(item') >= 0
	assert res.js.indexOf('get containsΦ') == -1

test 'async predicate def with parameters stays an async method' do
	let code = 'class Foo\n\tdef bigger? n\n\t\tawait 1\n\t\tn > 1\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	eq res.warnings.length, 0
	assert res.js.indexOf('async biggerΦ(n)') >= 0

test 'generator predicate def stays a method and is called when read' do
	let code = 'class Foo\n\tdef items?\n\t\tyield 1\nlet a = (new Foo).items?\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	eq res.warnings.length, 0
	assert res.js.indexOf('*itemsΦ(') >= 0
	assert res.js.indexOf(".itemsΦ) == 'function'") >= 0

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
	eq res.warnings[0].message, 'def ready? is not a class member and stays a plain function, so ready? without a call is the function itself - call it as ready?!'
	assert res.js.indexOf('function readyΦ(') >= 0

test 'explicit predicate call reads once and calls only functions' do
	let code = 'let item = {}\nlet a = item.ready?!\nlet b = item.ready?\nlet c = item.ready?(1)\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	assert res.js.indexOf("let a = (typeof ($1 = item.readyΦ) == 'function' ? $1.call(item) : $1);") >= 0
	assert res.js.indexOf("let b = (typeof ($1 = item.readyΦ) == 'function' ? $1.call(item) : $1);") >= 0
	assert res.js.indexOf("let c = item.readyΦ(1);") >= 0

test 'predicate reads call methods, writes stay plain' do
	let code = '''
	class Doc
		open? = no
		def readable? by = 1
			by
		def check
			readable?
	let doc = new Doc
	doc.open? = yes
	let changed = doc.open? =? no
	doc.count? ||= 1
	doc.count?++
	delete doc.open?
	'''
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	eq res.warnings.length, 0
	for part in [
		"return (typeof ($1 = this.readableΦ) == 'function' ? $1.call(this) : $1);"
		"($$ && ($0 = $$.openΦ) !== undefined)"
		"doc.openΦ = true;"
		"let changed = (doc.openΦ != false) ? ((doc.openΦ = false,true)) : false;"
		"doc.countΦ ||= 1;"
		"doc.countΦ++;"
		"delete doc.openΦ"
	]
		assert res.js.indexOf(part) >= 0

test 'super predicate reads call the inherited member on self' do
	let code = 'class A\n\tdef ok? x = 1\n\t\tx\nclass B < A\n\tdef ok? x = 1\n\t\tsuper.ok?\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	assert res.js.indexOf("(typeof ($1 = super.okΦ) == 'function' ? $1.call(this) : $1)") >= 0

test 'predicate reads keep a safe chain short-circuiting' do
	let code = '''
	let a = {}
	let x = a..b.c?
	let y = a..b?.c
	let z = a..b!.c?
	let w = a..b.c?(1)
	let v = a..c?
	'''
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	for part in [
		"let x = (a == null ? undefined : (typeof ($2 = ($1 = a.b).cΦ) == 'function' ? $2.call($1) : $2));"
		"let y = (a == null ? undefined : (typeof ($1 = a.bΦ) == 'function' ? $1.call(a) : $1).c);"
		"let z = (a == null || ($1 = a.b) == null ? undefined : (typeof ($3 = ($2 = $1.call(a)).cΦ) == 'function' ? $3.call($2) : $3));"
		"let w = a?.b.cΦ(1);"
		"let v = (typeof ($1 = a?.cΦ) == 'function' ? $1.call(a) : $1);"
	]
		assert res.js.indexOf(part) >= 0

test 'predicate reads are typed as their value in tsc mode' do
	let code = '''
	class Doc
		def readable? by = 1
			by
		def check
			[readable?, self.readable?, readable?!, self.readable?()]
	class Draft < Doc
		def readable? by = 1
			super.readable?
	let doc = new Doc
	let a = doc.readable?
	let b = doc.readable?!
	let c = doc.readable?()
	let d = new Doc().readable?
	'''
	let res = imbac.compile(code,sourcePath: 'predicate.imba', platform: 'tsc')
	eq res.warnings.length, 0
	for part in [
		"return [ΦREAD(this.readableΦ)(),ΦREAD(this.readableΦ)(),ΦREAD(this.readableΦ)(),ΦREAD(this.readableΦ)()];"
		"return ΦREAD(super.readableΦ)();"
		"let a = ('readableΦ' in doc && ΦREAD(doc.readableΦ)());"
		"let b = ('readableΦ' in doc && ΦREAD(doc.readableΦ)());"
		"let c = ('readableΦ' in doc && ΦREAD(doc.readableΦ)());"
		"let d = ('readableΦ' in new Doc() && ΦREAD(new Doc().readableΦ)());"
	]
		assert res.js.indexOf(part) >= 0
	assert res.js.indexOf("typeof") == -1
	# declared once, after the code, so the mappings are untouched
	eq res.js.split('declare function ΦREAD<T>').length, 2
	assert res.js.indexOf('declare function ΦREAD<T>') > res.js.indexOf('let d =')

test 'predicate calls with arguments and writes stay plain in tsc mode' do
	let code = '''
	let doc = {}
	doc.open? = yes
	let changed = doc.open? =? no
	let a = doc.ready?(1)
	let b = <input type='checkbox' bind=doc.open?>
	'''
	let res = imbac.compile(code,sourcePath: 'predicate.imba', platform: 'tsc')
	for part in [
		"('openΦ' in doc && doc).openΦ = true;"
		"(('openΦ' in doc && doc).openΦ != false)"
		"let a = ('readyΦ' in doc && doc.readyΦ instanceof Function && doc.readyΦ)(1);"
		"τT.data=('openΦ' in doc && doc).openΦ;"
	]
		assert res.js.indexOf(part) >= 0
	assert res.js.indexOf('ΦREAD') == -1

test 'explicit predicate call caches a complex receiver' do
	let code = 'def next\n\t{}\nlet a = next!.ready?!\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	assert res.js.indexOf("(typeof ($2 = ($1 = next()).readyΦ) == 'function' ? $2.call($1) : $2)") >= 0

test 'explicit predicate call after new binds new to the constructor' do
	let code = 'class Foo\n\tdef ready?\n\t\tyes\nlet a = new Foo().ready?!\nlet b = new Foo().ready?\nlet c = new Foo.ready?!\nlet d = new Foo().bar!\n'
	let res = imbac.compile(code,sourcePath: 'predicate.imba')
	assert !!res.js.match(/let a = \(typeof \(\$\d+ = \(\$\d+ = new Foo\(\)\)\.readyΦ\) == 'function' \? \$\d+\.call\(\$\d+\) : \$\d+\);/)
	assert !!res.js.match(/let b = \(typeof \(\$\d+ = \(\$\d+ = new Foo\(\)\)\.readyΦ\) == 'function' \? \$\d+\.call\(\$\d+\) : \$\d+\);/)
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
