# Regex literals, heregex (///...///) and regexes inside interpolations

test 'heregex ignores whitespace and comments' do
	let re = ///
		^(\d+)       # digits
		\s* - \s*    # a dash
		([a-z]+)     # letters
		$
	///i
	eq re.source, '^(\\d+)\\s*-\\s*([a-z]+)$'
	eq re.flags, 'i'
	let m = '12 - abc'.match(re)
	eq m[1], '12'
	eq m[2], 'abc'
	eq 'ABC - 1'.match(re), null

test 'single-line heregex' do
	let re = ///a b c///
	eq re.source, 'abc'
	assert re.test('xabcx')

test 'heregex with only a comment is an empty regex' do
	let re = ///
		# nothing to match
	///
	eq re.source, '(?:)'
	assert re.test('anything')

test 'heregex with slashes and multiple flags' do
	let ignoreRe = ///
		/\*IGNORE:START\*/([^]*?)/\*IGNORE:END\*/
	///gm
	eq ignoreRe.flags, 'gm'
	let text = 'a/*IGNORE:START*/hidden/*IGNORE:END*/b'
	eq text.replace(ignoreRe, ' '), 'a b'

test 'heregex with a # that does not start a comment' do
	let re = ///
		[#]x     # a literal hash in a class
		\sy      # whitespace has to be written as \s
		a#b      # a hash right after a token
	///
	eq re.source, '[#]x\\sya#b'
	assert re.test('#x ya#b')

test 'heregex inside an interpolation' do
	let name = 'a-b-c'
	let s = "{name.replace(///- # dashes
		///g, '"')}"
	eq s, 'a"b"c'

test 'regex inside an interpolation' do
	let name = 'xyx'
	eq "{name.replace(/x/g, 'y')}", 'yyy'
	eq "<{name.replace(/x/g, '}')}>", '<}y}>'
	eq "{name.replace(/[{]/g, 'y')}", 'xyx'
	eq "{name.replace(/[}]/g, 'y')}", 'xyx'
	eq "{'a"b'.replace(/"/g, 'q')}", 'aqb'

test 'regex in an interpolation followed by another interpolation' do
	let a = 'a.b'
	let b = 'c'
	eq "{a.replace(/\./g, '/')}/{b}", 'a/b/c'

test 'regex with an escaped =' do
	let re = /\=\s*/
	eq 'a= b'.replace(re, ':'), 'a:b'

test 'regex with escaped slashes' do
	let re = /a\/b/g
	eq 'a/b a/b'.replace(re, 'x'), 'x x'
	assert /[/]/.test('/')

test 'regex flags' do
	eq /x/gimsuy.flags, 'gimsuy'
	eq /x/.flags, ''

test 'regex as an implicit call argument' do
	let fn = do(v) v
	let re = fn /x+/
	assert re isa RegExp
	eq re.source, 'x+'

test 'regex after an opening paren and a comma' do
	let parts = 'a, b,c'.split(/,\s*/)
	eq parts, ['a', 'b', 'c']
	eq 'aXbXc'.replace(/X/g, ','), 'a,b,c'

test 'regex methods and match indexes' do
	let m = 'key=value'.match(/(\w+)=(\w+)/)
	eq m[1], 'key'
	eq m[2], 'value'
	assert /^\d+$/.test('123')
	eq /b/.exec('abc').index, 1
	eq /a(b)?/.source, 'a(b)?'

test 'regex as an object value and array item' do
	let o = {re: /x/i, list: [/a/, /b/g]}
	assert o.re.test('X')
	eq o.list.map(&.source), ['a', 'b']

test 'division is not mistaken for a regex' do
	let a = 10
	let b = 2
	let f = do 4
	eq a / b / 5, 1
	eq a/b, 5
	eq (a) / b, 5
	eq f! / 2, 2
	eq [a][0] / b, 5
	eq "{a / b} and {a / b}", '5 and 5'
	eq "{a/b}", '5'

test 'regex inside a block' do
	let words = ['ab', 'cd', 'abc']
	let found = words.filter do(w)
		/^ab/.test(w)
	eq found, ['ab', 'abc']
	let swapped = words.map do $1.replace(/b/, 'B')
	eq swapped, ['aB', 'cd', 'aBc']
