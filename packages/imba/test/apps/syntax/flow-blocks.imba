# Block shapes that only show up in real code: an `if` with no body, a
# branch whose body is only a comment, a def line ending in a comment,
# an empty method, and an assignment whose value starts on the next line.

describe 'if without a body' do

	test 'the next line runs either way' do
		def run v
			let out = []
			if v isa 'string'
			out.push 'after'
			out
		eq run('x'), ['after']
		eq run(1), ['after']

	test 'the condition is still evaluated' do
		let calls = 0
		if ++calls
		eq calls, 1

	test 'followed by a blank line in a loop' do
		def run list
			let res = []
			for item in list
				if item isa RegExp

				res.push item
			res
		let re = /x/
		eq run([1,re]), [1,re]

describe 'blocks with only a comment' do

	test 'an elif branch with only a comment does nothing' do
		def run tok
			let res = 'start'
			if tok == 'a'
				res = 'a'
			elif tok.startsWith('--')
				# unknown flag - ignore it
			elif tok == 'b'
				res = 'b'
			res
		eq run('a'), 'a'
		eq run('--x'), 'start'
		eq run('b'), 'b'
		eq run('z'), 'start'

	test 'an else branch with only a comment' do
		let log = []
		for x in [1,2]
			if x == 1
				log.push x
			else
				# nothing to do here
		eq log, [1]

describe 'def lines ending in a comment' do

	class Item
		get icon # the comment sits on the def line
			'icon'

		get sheet? # hack
			yes

		def label # another trailing comment
			'label'

		def noop

		def after-noop
			'after'

	test 'getters keep their body' do
		let item = new Item
		eq item.icon, 'icon'
		eq item.sheet?, yes

	test 'methods keep their body' do
		eq (new Item).label!, 'label'

	test 'an empty method returns undefined' do
		let item = new Item
		eq item.noop!, undefined
		eq item.after-noop!, 'after'

	test 'a function with a trailing comment' do
		def run # comment
			1
		eq run!, 1

	test 'an if with a trailing comment' do
		let res = []
		let flag = yes
		if flag # explain the condition
			res.push 'body'
		eq res, ['body']

	test 'a loop with a trailing comment' do
		let res = for x in [1,2] # explain the loop
			x * 2
		eq res, [2,4]

describe 'assignment with the value on the next lines' do

	test 'to a member' do
		const TYPES = {}
		TYPES.LOG =
			LOG: 60
			WARN: 61
		eq TYPES.LOG, {LOG: 60, WARN: 61}

	test 'to a variable' do
		let plain
		plain =
			a: 1
			b: 2
		eq plain, {a: 1, b: 2}

	test 'to a nested member' do
		const WIDGET = {}
		WIDGET.FLAGS =
			Created: 1
			Enabled: 2
			Deleted: 4
		eq WIDGET.FLAGS.Deleted, 4
		eq Object.keys(WIDGET.FLAGS), ['Created','Enabled','Deleted']

	test 'to a property of self' do
		class Config
			def setup
				self.options =
					depth: 2
					mode: 'fast'
				self
		eq (new Config).setup!.options, {depth: 2, mode: 'fast'}

describe 'parenthesized sequences' do

	test 'evaluate left to right and yield the last value' do
		let log = []
		let res = (log.push('a'), log.push('b'), 'last')
		eq res, 'last'
		eq log, ['a','b']

	test 'as the body of a one-line do' do
		let log = []
		let fn = do (log.push(1), log.length)
		eq fn!, 1
		eq fn!, 2
