import * as selparser from '../vendor/css-selector-parser'
import * as selmodder from '../src/compiler/selparse'
import assert from 'assert'

let tests = {
	'div !@lg': 'div @media (max-width: 1023px)'
	'div ..@checked': 'div:is(:is(:checked,.\\@checked) :where(div))'
	'div !.test': 'div:not(.test)'
	'div ^@checked': 'div:is(:is(:checked,.\\@checked) > :where(div))'
	'div !^@checked': 'div:not(:is(:checked,.\\@checked) > :where(div))'
	'div ..checked': 'div:is(.checked :where(div))'
	'div !..@checked': 'div:not(:is(:checked,.\\@checked) :where(div))'
	'div !..checked': 'div:not(.checked :where(div))'
	'.input @focus @valid': '.input:focus:valid'
	'.input@focus@valid': '.input:focus:valid'
	'.input@focus!@valid': '.input:focus:not(:valid)'
	'.input@focus..@valid': '.input:is(:focus,.\\@focus):is(:is(:valid,.\\@valid) :where(.input:is(:focus,.\\@focus)))'
	'.input@focus..valid': '.input:is(:focus,.\\@focus):is(.valid :where(.input:is(:focus,.\\@focus)))'
	'.input@focus^@valid': '.input:is(:focus,.\\@focus):is(:is(:valid,.\\@valid) > :where(.input:is(:focus,.\\@focus)))'
	'.test@unknown': '.test.\\@unknown'

	'div @.test': 'div.test'
	'div @hover': 'div:hover'

	'div::before @.large ..test': 'div.large:is(.test :where(div.large))::before'
	'div ::before': 'div::before'
	'div>::before': 'div > ::before'
	'div @before': 'div::before'
	'div $app': 'div .\\$app'
	'div @400': 'div @media (min-width: 400px)'
	'div !@400': 'div @media (max-width: 399px)'
	'.a .b': '.a .b'
	'.a ::backdrop': '.a::backdrop'
	'a >>> b': 'a b'
	'*': '*'
	'div ^@hold': 'div:is(.\\@hold > :where(div))'
	'main div ^@hold': 'main.\\@hold div'
	'div ^.one.two': 'div:is(.one > :where(div)):is(.two > :where(div))'
	'div ..@hold': 'div:is(.\\@hold :where(div))'

	# custom tags
	'app.test': ':is(app,app-tag).test'

	'svg ^@hover': 'svg:is(:is(:hover,.\\@hover) > :where(svg))'
	'svg ^^@hover': 'svg:is(:is(:hover,.\\@hover) > :where(:root,:not(:root)) > :where(svg))'

	'svg ^.test@focus': 'svg:is(.test > :where(svg)):is(:is(:focus,.\\@focus) > :where(svg))'
	'svg @focus^.test': 'svg:is(:focus,.\\@focus):is(.test > :where(svg:is(:focus,.\\@focus)))'
	'svg @focus..test': 'svg:is(:focus,.\\@focus):is(.test :where(svg:is(:focus,.\\@focus)))'
	'svg ^^.test': 'svg:is(.test > :where(:root,:not(:root)) > :where(svg))'

	'%test': '.\\%test'

	# names
	'%todo span': '.\\%todo span'
	'%todo span ^.test': '.\\%todo.test span'
	# '%todo span %.test': '.\\%todo.test span'
	'div span ^.test': 'div.test span'
	'div span ^.test@hover': 'div.test:hover span'
	'span ^^.test': 'span:is(.test > :where(:root,:not(:root)) > :where(span))'

	'div ..%app@focus': 'div:is(.\\%app:is(:focus,.\\@focus) :where(div))'
	'div ..a.b': 'div:is(.a.b :where(div))'
	'div ..$app@focus': 'div:is(.\\$app:is(:focus,.\\@focus) :where(div))'
	'div ..@hover': 'div:is(:is(:hover,.\\@hover) :where(div))'

	'div @focin': 'div:focus-within'
	'div @first': 'div:first-child'
}

# Test with others as well

let results = {}

def run
	for own sel,expected of tests
		console.log "\n\n--- {sel} ---"
		let result = results[sel] = {sel: sel,expected: expected}
		try
			let res = selmodder.parse(sel, respecify: false)
			console.log 'parsed',sel,res.rule
			# JSON.stringify(res.rule,null,2)
			let out = selparser.render(res)
			result.raw = out
			result.ok = out == expected
			result.rule = res

			if false
				console.log "--- rewrite {sel} ---"
				let rewritten = selmodder.parse(sel, respecify: false)
				let reout = selparser.render(rewritten) # .replace(/\s\{\s*\}$/,'')
				result.rule = rewritten
				result.value = reout
				result.ok = expected == reout
				console.log expected == reout,reout

		catch e
			console.log 'error',e
	console.log "\n\n------"
	let tot = 0
	let failed = 0
	for own sel,res of results
		console.log "{res.ok ? 'v' : 'x'} - {res.expected} ({sel})"
		tot++
		unless res.ok
			failed++
			console.log "    {res.raw}" if res.raw
			console.log res.rule.rule

	console.log "passed {tot - failed} / {tot}"
	yes

run!

def assert_relation sel, expected
	let out = selparser.render(selmodder.parse(sel, respecify: false))
	assert.equal(out, expected)
	assert.equal(/:(?:is|where)\([^)]*\*/.test(out), false)

assert_relation '.abc ..visited', '.abc:is(.visited :where(.abc))'
assert_relation '.abc ^.visited', '.abc:is(.visited > :where(.abc))'
assert_relation '.abc ^^.visited', '.abc:is(.visited > :where(:root,:not(:root)) > :where(.abc))'
assert_relation '.abc !..visited', '.abc:not(.visited :where(.abc))'
assert_relation '.abc !^.visited', '.abc:not(.visited > :where(.abc))'
