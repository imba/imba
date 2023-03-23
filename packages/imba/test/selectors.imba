import * as selparser from '../vendor/css-selector-parser'
import * as selmodder from '../src/compiler/selparse'

let tests = {
	'div !@lg': 'div @media (max-width: 1023px)'
	'div ..@checked': 'div:is(:checked *)'
	'div !.test': 'div:not(.test)'
	'div ^@checked': 'div:is(:checked > *)'
	'div !^@checked': 'div:not(:checked > *)'
	'div ..checked': 'div:is(.checked *)'
	'div !..@checked': 'div:not(:checked *)'
	'div !..checked': 'div:not(.checked *)'
	'.input @focus @valid': '.input:focus:valid'
	'.input@focus@valid': '.input:focus:valid'
	'.input@focus!@valid': '.input:focus:not(:valid)'
	'.input@focus..@valid': '.input:focus:is(:valid *)'
	'.input@focus..valid': '.input:focus:is(.valid *)'
	'.input@focus^@valid': '.input:focus:is(:valid > *)'
	'.test@unknown': '.test.\\@unknown'

	'div @.test': 'div.test'
	'div @hover': 'div:hover'

	'div::before @.large ..test': 'div.large:is(.test *)::before'
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
	'div ^@hold': 'div:is(.\\@hold > *)'
	'main div ^@hold': 'main.\\@hold div'
	'div ^.one.two': 'div:is(.one > *):is(.two > *)'
	'div ..@hold': 'div:is(.\\@hold *)'

	# custom tags
	'app.test': ':is(app,app-tag).test'

	'svg ^@hover': 'svg:is(:hover > *)'
	'svg ^^@hover': 'svg:is(:hover > * > *)'

	'svg ^.test@focus': 'svg:is(.test > *):is(:focus > *)'
	'svg @focus^.test': 'svg:focus:is(.test > *)'
	'svg @focus..test': 'svg:focus:is(.test *)'
	'svg ^^.test': 'svg:is(.test > * > *)'

	'%test': '.\\%test'

	# names
	'%todo span': '.\\%todo span'
	'%todo span ^.test': '.\\%todo.test span'
	# '%todo span %.test': '.\\%todo.test span'
	'div span ^.test': 'div.test span'
	'div span ^.test@hover': 'div.test:hover span'
	'span ^^.test': 'span:is(.test > * > *)'

	'div ..%app@focus': 'div:is(.\\%app:focus *)'
	'div ..a.b': 'div:is(.a.b *)'
	'div ..$app@focus': 'div:is(.\\$app:focus *)'
	'div ..@hover': 'div:is(:hover *)'

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
			# console.log out,expected

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
			# console.log "    {res.value}" if res.value
			console.log "    {res.raw}" if res.raw
			console.log res.rule.rule

	console.log "passed {tot - failed} / {tot}"
	yes

run!