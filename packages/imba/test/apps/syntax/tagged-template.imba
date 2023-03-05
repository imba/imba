def upToThreeExp(strings, first, second, third)
	let total = strings[0]
	total += "{first}" if first != null
	total += "{strings[1]}" if strings.length > 1
	total += "{second}" if second != null
	total += "{strings[2]}" if strings.length > 2
	total += "{third}" if third != null
	total += "{strings[3]}" if strings.length > 3

	return {
		length: strings.length
		first: first
		second: second
		third: third
		total: total
	}

describe "TaggedTemplate" do
	test "interpolate nothing" do
		const expected = "The Answer to the Ultimate Question of Life, the Universe, and Everything is 42."
		const actual = upToThreeExp`The Answer to the Ultimate Question of Life, the Universe, and Everything is 42.`

		eq actual.total, expected
		eq actual.length, 1
		eq actual.first, undefined
		eq actual.second, undefined
		eq actual.third, undefined

	test "interpolate string variable" do
		const expected = "The Answer to the Ultimate Question of Life, the Universe, and Everything is 42."
		const expectedFirst = "Ultimate Question of Life, the Universe, and Everything"
		const actual = upToThreeExp`The Answer to the {expectedFirst} is 42.`

		eq actual.total, expected
		eq actual.length, 2
		eq actual.first, expectedFirst
		eq actual.second, undefined
		eq actual.third, undefined

	test "interpolate number variable" do
		const expected = "The Answer to the Ultimate Question of Life, the Universe, and Everything is 42."
		const expectedFirst = 42
		const actual = upToThreeExp`The Answer to the Ultimate Question of Life, the Universe, and Everything is {expectedFirst}.`

		eq actual.total, expected
		eq actual.length, 2
		eq actual.first, expectedFirst
		eq actual.second, undefined
		eq actual.third, undefined

	test "interpolate decimal variable" do
		const expected = "one tenth of the answer is 4.2."
		const expectedFirst = 4.2
		const actual = upToThreeExp`one tenth of the answer is {expectedFirst}.`

		eq actual.total, expected
		eq actual.length, 2
		eq actual.first, expectedFirst
		eq actual.second, undefined
		eq actual.third, undefined

	test "interpolate boolean variable" do
		const expected = "true is not false"
		const expectedFirst = false
		const actual = upToThreeExp`true is not {expectedFirst}`

		eq actual.total, expected
		eq actual.length, 2
		eq actual.first, expectedFirst
		eq actual.second, undefined
		eq actual.third, undefined

	test "interpolate two variables" do
		const expected = "The Answer to the Ultimate Question of Life, the Universe, and Everything is 42."
		const expectedFirst = "Ultimate Question of Life, the Universe, and Everything"
		const expectedSecond = 42
		const actual = upToThreeExp`The Answer to the {expectedFirst} is {expectedSecond}.`

		eq actual.total, expected
		eq actual.length, 3
		eq actual.first, expectedFirst
		eq actual.second, expectedSecond
		eq actual.third, undefined


	test "interpolate three variables" do
		const expected = "What do you get if you multiply six by nine?"
		const expectedFirst = "What do you get if you"
		const expectedSecond = "multiply"
		const expectedThird = "six by nine?"
		const actual = upToThreeExp`{expectedFirst} {expectedSecond} {expectedThird}`

		eq actual.total, expected
		eq actual.length, 4
		eq actual.first, expectedFirst
		eq actual.second, expectedSecond
		eq actual.third, expectedThird
