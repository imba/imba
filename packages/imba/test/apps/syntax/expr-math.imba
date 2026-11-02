# Exponents, shifts, bit masks and modulo

test '** exponent' do
	eq 2 ** 3, 8
	eq 10 ** 0, 1
	eq 4 ** 0.5, 2
	eq 2 ** -1, 0.5

test '** is right associative' do
	eq 2 ** 3 ** 2, 512
	eq (2 ** 3) ** 2, 64

test '** binds tighter than * and +' do
	let t = 0.5
	eq 3 * t ** 2, 0.75
	eq 1 + 2 ** 2, 5
	eq (1 - t) ** 2 * 3, 0.75

test '** in a bezier style formula' do
	let sample = do(t, a, b) (1 - t) ** 2 * 3 * t * a + 3 * t * t * (1 - t) * b + t ** 3
	eq sample(0, 1, 1), 0
	eq sample(1, 1, 1), 1
	eq sample(0.5, 0, 0), 0.125

test '** with calls and members on either side' do
	let currency = {decimals: 2}
	let entry = {count: 3}
	eq 5 * 10 ** currency.decimals, 500
	eq 2 ** (entry.count - 1), 4
	eq Math.sqrt(16) ** 2, 16
	eq Math.min(1 * 2 ** (entry.count - 1), 3), 3

test '** with a parenthesized negative base' do
	let x = 3
	eq (-x) ** 2, 9
	eq (-2) ** 3, -8

test '**=' do
	let a = 3
	a **= 2
	eq a, 9
	let o = {v: 2}
	o.v **= 3
	eq o.v, 8

test '<< >> and >>>' do
	eq 1 << 0, 1
	eq 1 << 4, 16
	eq 256 >> 4, 16
	eq -8 >> 1, -4
	eq -8 >>> 28, 15
	eq -1 >>> 0, 4294967295

test 'shifts bind looser than + and -' do
	eq 1 + 2 << 1, 6
	eq 1 << 2 + 1, 8
	eq 16 >> 1 + 1, 4

test 'shifts bind tighter than bitwise and comparison operators' do
	eq 1 << 2 | 1, 5
	eq 7 & 1 << 1, 2
	eq 1 << 3 > 4, true
	eq 3 ^ 1 << 1, 1

test 'shift compound assignments' do
	let a = 1
	a <<= 3
	eq a, 8
	a >>= 2
	eq a, 2
	let b = -1
	b >>>= 28
	eq b, 15

test 'flags from shifts in an object' do
	const Flags =
		WIDTH: 1 << 0
		HEIGHT: 1 << 1
		DEPTH: 1 << 2
	eq Flags, {WIDTH: 1, HEIGHT: 2, DEPTH: 4}
	let f = Flags.WIDTH | Flags.DEPTH
	eq f & Flags.WIDTH, 1
	eq f & Flags.HEIGHT, 0
	eq !!(f & Flags.DEPTH), true

def diff a, b
	let mask = [0]
	let i = 0
	while i < b.length
		if a[i] != b[i]
			mask[0] = mask[0] | (1 << i)
			mask.push(b[i])
		i++
	mask[0] == 0 ? null : mask

def patch struct, diff
	return struct unless diff
	let mask = diff[0]
	let i = 0
	let slot = 0
	while (i < struct.length) or mask >= (1 << i)
		if mask & (1 << i)
			struct[i] = diff[++slot]
		i++
	struct

test 'bit mask diff and patch' do
	let a = [1, 2, 3, 4]
	let b = [1, 5, 3, 6]
	let d = diff(a, b)
	eq d, [0b1010, 5, 6]
	eq patch(a.slice!, d), b
	eq diff(a, a), null
	eq patch(a.slice!, null), a

test 'bit mask patch can grow the struct' do
	let d = [0b100, 'c']
	eq patch(['a', 'b'], d), ['a', 'b', 'c']

test 'hashing with xor, Math.imul and >>> 0' do
	let fnv = do(str)
		let s = 2166136261
		for i in [0 ... str.length]
			s = Math.imul(s ^ str.charCodeAt(i), 16777619)
		(s >>> 0) % 100000
	let h = fnv('imba')
	assert h >= 0 and h < 100000
	eq h, fnv('imba')
	assert h != fnv('imbb')

test 'seeded random with ^= and >>>' do
	let rnd = do(seed)
		let t = seed + 1000
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		((t ^ (t >>> 14)) >>> 0) / 4294967296
	let v = rnd(1)
	assert v >= 0 and v < 1
	eq v, rnd(1)
	assert v != rnd(2)

test 'djb2 hash with << and | 0' do
	let hash = do(s)
		let h = 5381
		for i in [0 ... s.length]
			h = ((h << 5) + h + s.charCodeAt(i)) | 0
		String(h >>> 0)
	eq hash(''), '5381'
	eq hash('a'), String(5381 * 33 + 97)

test 'extracting bit fields with masks and shifts' do
	let b = [0x12, 0xc5, 0x0f, 0x03]
	let width = 1 + (((b[1] & 0x3f) << 8) | b[0])
	let height = 1 + (((b[3] & 0xf) << 10) | (b[2] << 2) | ((b[1] & 0xc0) >> 6))
	eq width, 1 + ((0x05 << 8) | 0x12)
	eq height, 1 + ((3 << 10) | (0x0f << 2) | 3)

test 'multiplying and shifting the result of a postfix increment' do
	let value = [1, 2]
	let i = 0
	let hash = 0
	hash = ((hash ^ value[i++]) * 0x01000193) >>> 0
	hash = ((hash ^ value[i++]) * 0x01000193) >>> 0
	eq i, 2
	eq hash, ((((0 ^ 1) * 0x01000193) >>> 0 ^ 2) * 0x01000193) >>> 0

test '% with spaces is modulo' do
	let x = 7
	eq x % 3, 1
	eq (x) % 3, 1
	eq (x + 1) % 3, 2
	eq -7 % 3, -1
	let s = 2166136261
	eq (s >>> 0) % 100000, 36261

test '%= compound assignment' do
	let a = 10
	a %= 4
	eq a, 2

test '% directly after a number or ) is a percent unit' do
	let x = 25
	eq 10%, '10%'
	eq (x)%, '25%'
	eq (x * 2)%, '50%'
	eq "{x}%", '25%'

test 'bitwise not and double not' do
	eq ~5, -6
	eq ~~3.7, 3
	eq ~-1, 0

test 'mixed precedence of arithmetic, shift, bitwise and logical operators' do
	let a = 6
	let b = 3
	eq a + b * 2, 12
	eq (a + b) * 2, 18
	eq a - b - 1, 2
	eq a / b / 2, 1
	eq a & b | 8, 10
	eq a | b & 1, 7
	eq a ^ b, 5
	eq a > b and b > 1, true
	eq a < b or b == 3, true

test 'amper functions with comparison and bitwise operators' do
	let arr = [1, 2, 3, 4]
	let x = 2
	eq arr.filter(& != x), [1, 3, 4]
	eq arr.filter(& !== 3), [1, 2, 4]
	eq arr.filter(& & 1), [1, 3]
	eq arr.filter(& !& 1), [2, 4]
	eq arr.map(& | 8), [9, 10, 11, 12]
	eq arr.map(& ^ 1), [0, 3, 2, 5]
	eq arr.map(& << 1), [2, 4, 6, 8]
	eq arr.map(& >> 1), [0, 1, 1, 2]
	eq arr.map(& % 2), [1, 0, 1, 0]
	eq arr.filter(& isnt 2), [1, 3, 4]
	eq arr.filter(& in [1, 4]), [1, 4]

test 'unless and until negate equality and ! operands' do
	let a = 1
	let b = 2
	let x = no
	let taken = []
	taken.push('==') unless a == b
	taken.push('!=') unless a != b
	taken.push('===') unless a === 1
	taken.push('!==') unless a !== 1
	taken.push('!') unless !x
	eq taken, ['==', '!==']
	let n = 0
	until !(n < 3)
		n++
	eq n, 3
