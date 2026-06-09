tag my-tag
	def render
		<self>

	def something
		yes

tag other-tag < my-tag
	def something
		no

test 'tag can be used as a regular identifier' do
	let tag = 21
	eq tag,21

	let double = do(tag) tag * 2
	eq double(tag),42

	let values = []
	for tag in [1,2,3]
		values.push tag
	eq values.join(','),'1,2,3'

test 'tag can be called with explicit parens' do
	let tag = do(v) v * 2
	eq tag(50),100
