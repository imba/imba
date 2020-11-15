let fs = {}

fs.plain = """
console.log 'hello'
"""

fs.tags = """
tag App
	<self>

"""

def compile name, o = {}
	o.sourcePath ||= "{name}.imba"
	global.imba.compiler.compile(fs[name],o)

test 'auto' do
	let res = String compile('plain', platform: 'browser')
	ok res.indexOf('import') == -1

test 'tags' do
	let res = String compile('tags', platform: 'browser')
	ok res.indexOf('import') >= 0

	res = String compile('tags', platform: 'browser', imbaPath: '/here')
	ok res.indexOf('/here/core') >= 0

test 'result.dependencies' do
	let res = compile('tags', platform: 'browser')
	eq res.dependencies, ['core']