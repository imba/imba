test 'post if' do
	def list early
		return null if early
		return true

	ok list(true) == null

test 'prefix ++ and -- as condition' do
	let n = 1
	let out = []
	out.push('a') unless --n # 0
	out.push('b') if --n # -1
	out.push('c') if ++n # 0
	if ++n # 1
		out.push('d')
	else
		out.push('e')
	unless --n # 0
		out.push('f')
	eq out, ['a','b','d','f']
	eq n, 0
