import * as imbac from 'imba/compiler'

let fs = {}

fs.plain = """
console.log 'hello'
"""

fs.tags = """
tag App
	<self>

imba.mount(<App>)
"""

def compile name, o = {}
	o.sourcePath ||= "{name}.imba"
	imbac.compile(fs[name],o)

test 'auto' do
	let res = String compile('plain', platform: 'browser')
	ok res.indexOf('import') == -1

test 'tags' do
	let res = String compile('tags', platform: 'browser')
	ok res.indexOf('imba.mount') == -1
	# eq res,'test'

test 'tags2' do
	let res = String compile('tags', platform: 'browser', runtime: 'global')
	ok res.indexOf('imba.mount') >= 0