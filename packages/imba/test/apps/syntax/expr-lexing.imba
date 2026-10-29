# imba$exprLexingProbe=1
# Lexer edge cases: line continuations, semicolons, unusual whitespace and
# over-indented blocks. The magic comment above sets a (harmless) compiler
# option through `imba$name=value`.

test 'a trailing binary operator continues the line' do
	let a = 3
	let b = 4
	let sum = a +
		b
	let diff = a -
		b
	let product = a *
		b +
			a
	let power = a **
		2
	let shifted = a <<
		1
	let same = a ==
		b
	eq [sum, diff, product, power, shifted, same], [7, -1, 15, 9, 6, false]

test 'a trailing operator continues onto a line at the same indentation' do
	let a = 1
	let b = 2
	let sum = a +
	b
	eq sum, 3

test 'a leading logical operator continues the line' do
	let a = 1
	let b = 0
	let both = a
		and b
	let either = b
		or a
	let left = a
		|| b
	let right = a
		&& b
	eq [both, either, left, right], [0, 1, 1, 0]

test 'a leading logical operator at the same indentation' do
	let a = 1
	let b = 2
	let both = a
	and b
	eq both, 2

test 'a leading dot continues a chain' do
	let res = [1, 2, 3]
		.map(do $1 * 2)
		.filter(do $1 > 2)
	eq res, [4, 6]
	let n = 5
	let s = n
		.toString!
	eq s, '5'

test 'a leading comma continues a list' do
	let a = 1
	let list = [a
		, 2]
	eq list, [1, 2]

test 'statements after a continued expression keep their indentation' do
	let out = []
	let total = 1 +
			2 +
		3
	out.push(total)
	if total > 5
		out.push('big')
	out.push('end')
	eq out, [6, 'big', 'end']

test 'semicolons separate statements' do
	let a = 1; let b = 2;
	a++; b++
	eq [a, b], [2, 3]
	let c = (do(v) v * 2; )(3)
	eq c, 6

test 'non-breaking space and form feed count as whitespace' do
	# the gaps around = and + below are U+00A0 and U+000C characters
	let a = 1
	let b =2
	eq a + b, 3

test 'blocks indented by two levels' do
	let run = do(job, items)
		let out = []
		if job
				out.push('job')
				out.push(job)
		for item in items
				out.push(item)
		out
	eq run(1, ['a']), ['job', 1, 'a']
	eq run(0, []), []

test 'an if expression with over-indented branches' do
	let pick = do(flag)
		let content = if flag
				"omitted"
			else
				"body"
		content
	eq pick(yes), 'omitted'
	eq pick(no), 'body'



test 'several blank lines between tests' do
	let a = 1


	let b = 2



	eq a + b, 3

test 'a block that starts after blank lines' do


	let a = 1
	let f = do


		a + 1
	eq f!, 2

test 'a closing bracket ends an indented block' do
	let o = {
		a: 1
		b: [
			1
			2]}
	eq o, {a: 1, b: [1, 2]}
	let arr = [
		1
		2]
	eq arr, [1, 2]

# This file intentionally ends with trailing whitespace and no newline.
	  