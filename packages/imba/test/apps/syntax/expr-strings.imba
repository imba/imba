# Triple-quoted strings, interpolation edge cases and string escapes

let name = 'imba'

test '""" strips the common indentation and keeps deeper indentation' do
	let s = """
		Hello {name}
		  two spaces
			one tab
		"""
	eq s, 'Hello imba\n  two spaces\n\tone tab'

test '""" dedents to its least indented line' do
	let s = """
			deep
		shallow
		"""
	eq s, '\tdeep\nshallow'

test '""" as the implicit return value of a def' do
	let prompt = do
		"""
		You are a helper for {name}.

		## Rules
		- keep it short
		"""
	eq prompt!, 'You are a helper for imba.\n\n## Rules\n- keep it short'

test '""" assigned at a deeper indentation inside a block' do
	let make = do
		let text = """
			one
				two
			three
		"""
		text
	eq make!, 'one\n\ttwo\nthree'

test '""" appended with +=' do
	let text = """
		start
	"""
	if yes
		text += """


			## more
			end
		"""
	eq text, 'start\n\n## more\nend'

test '""" keeps blank lines in the middle' do
	let s = """
		line

		after blank
		"""
	eq s, 'line\n\nafter blank'

test '""" keeps extra leading blank lines' do
	let s = """


		two leading blanks
		"""
	eq s, '\n\ntwo leading blanks'

test '""" on a single line' do
	eq """inline {name}""", 'inline imba'
	eq """{name}""", 'imba'

test '""" ending right after an interpolation' do
	let s = """
		ends with {name}"""
	eq s, 'ends with imba'

test '""" with escaped braces' do
	let s = """
		a \{b\} {name}
		"""
	eq s, 'a {b} imba'
	let rule = """
		#preview\{ background: url('{name}.png') \}
		"""
	eq rule, "#preview\{ background: url('imba.png') \}"

test '""" with interpolations holding strings and expressions' do
	let s = """
		{name}: {1 + 1}
			nested {"inner {name}"}
		"""
	eq s, 'imba: 2\n\tnested inner imba'

test """''' is raw and does not interpolate""" do
	let s = '''
		raw {name}
			indented
		'''
	eq s, 'raw \{name\}\n\tindented'

test 'empty interpolations inside a string are dropped' do
	eq "a{}b", 'ab'
	eq "a{}b{ }c", 'abc'

test 'nested braces inside an interpolation' do
	eq "{ {a: 1}.a }", '1'
	eq "{[1, 2].map(do $1 * 2).join(',')}", '2,4'
	eq "x{(do 'y')!}z", 'xyz'

test 'quotes and braces as strings inside an interpolation' do
	eq "{name + '{'}", 'imba{'
	eq "{name + "}"}", 'imba}'
	eq "<{"a" + 'b'}>", '<ab>'

test 'escapes in double-quoted strings' do
	eq "tab\there".split('\t'), ['tab', 'here']
	eq "line\nbreak".split('\n').length, 2
	eq "é", 'é'
	eq "\x41", 'A'
	eq "double \"quoted\"", 'double "quoted"'

test 'escapes in single-quoted strings' do
	eq 'single \'quoted\'', "single 'quoted'"
	eq 'no {interpolation}', "no \{interpolation\}"

test 'a double-quoted string over several lines joins them' do
	let s = "line1
	line2"
	eq s, 'line1\tline2'

test 'template strings with interpolation and escaped braces' do
	eq `tpl {name} \{x\}`, 'tpl imba {x}'
	let multi = `
a
	{name}
`
	eq multi, '\na\n\timba\n'

test 'interpolating calls and optional chains' do
	let user = {name: 'joe', tags: null}
	eq "{user.name.toUpperCase!}", 'JOE'
	eq "{user..tags..length}", 'undefined'
	eq "{user.tags or 'none'}", 'none'

test 'interpolation of a percent and a unit-like suffix' do
	let pct = 50
	eq "{pct}%", '50%'
	eq "{pct}px", '50px'
	eq "{pct / 10}s", '5s'
