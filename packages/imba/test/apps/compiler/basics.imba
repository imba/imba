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
