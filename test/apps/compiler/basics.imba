let fs = {}

import imbac from 'imba/compiler'

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

test 'raiseErrors' do
	try
		let res = compile('indenterr',raiseErrors: true)
		ok false
	catch e
		ok true