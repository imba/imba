let fs = {}

fs.code1 = """
if $node$
	'Node'
if $browser$
	'Browser'
if $worker$
	'Worker'
"""

def compile name, o = {}
	o.sourcePath ||= "{name}.imba"
	global.imba.compiler.compile(fs[name],o)

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