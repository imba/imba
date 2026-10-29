# try / catch / finally in every shape the apps use them: finally without
# catch, catch without an error variable, try as the value of an expression
# or the last line of a function, and async bodies with await.

def wait ms, value
	new Promise do(resolve) setTimeout(&,ms) do resolve(value)

def fail-later message
	await wait(1)
	throw new Error(message)

describe 'try ... finally' do

	test 'finally runs after the body' do
		let log = []
		try
			log.push 'body'
		finally
			log.push 'finally'
		eq log, ['body','finally']

	test 'as the last expression of a function it returns the body value' do
		let log = []
		def run
			try
				log.push 'body'
				'value'
			finally
				log.push 'finally'
		eq run!, 'value'
		eq log, ['body','finally']

	test 'finally runs when the body returns early' do
		let log = []
		def run
			try
				return 'early'
				log.push 'never'
			finally
				log.push 'finally'
			'late'
		eq run!, 'early'
		eq log, ['finally']

	test 'finally runs when the body throws and the error propagates' do
		let log = []
		def run
			try
				throw new Error('boom')
			finally
				log.push 'finally'
		let err = rescue run!
		assert err isa Error
		eq err.message, 'boom'
		eq log, ['finally']

	test 'finally does not change the returned value' do
		def run
			let value = 1
			try
				return value
			finally
				value = 2
		eq run!, 1

	test 'a return inside finally overrides the body' do
		def run
			try
				return 'body'
			finally
				return 'finally'
		eq run!, 'finally'

	test 'assigned to a variable' do
		let log = []
		let value = try
			log.push 'body'
			42
		finally
			log.push 'finally'
		eq value, 42
		eq log, ['body','finally']

	test 'as a call argument' do
		let log = []
		let fn = do(v) [v,log.slice!]
		let res = fn(try 'arg' finally log.push('finally'))
		eq res, ['arg',['finally']]

	test 'finally with a postfix condition' do
		let state = {pending: 'a'}
		def release promise
			try
				promise.toUpperCase!
			finally
				state.pending = null if state.pending == promise
		eq release('a'), 'A'
		eq state.pending, null
		state.pending = 'b'
		release('a')
		eq state.pending, 'b'

	test 'finally runs on break and continue' do
		let log = []
		for x in [1,2,3,4]
			try
				continue if x == 2
				break if x == 4
				log.push "body{x}"
			finally
				log.push "fin{x}"
		eq log, ['body1','fin1','fin2','body3','fin3','fin4']

	test 'inside a for expression' do
		let log = []
		let res = for x in [1,2,3]
			try
				x * 10
			finally
				log.push x
		eq res, [10,20,30]
		eq log, [1,2,3]

	test 'nested finally blocks run inside out' do
		let log = []
		def run
			try
				try
					log.push 'inner'
					return 'value'
				finally
					log.push 'inner-finally'
			finally
				log.push 'outer-finally'
		eq run!, 'value'
		eq log, ['inner','inner-finally','outer-finally']

describe 'try ... catch ... finally' do

	def run fail, log
		try
			throw new Error('bad') if fail
			'ok'
		catch e
			log.push 'catch'
			"caught {e.message}"
		finally
			log.push 'finally'

	test 'without an error' do
		let log = []
		eq run(no,log), 'ok'
		eq log, ['finally']

	test 'with an error the catch value is returned' do
		let log = []
		eq run(yes,log), 'caught bad'
		eq log, ['catch','finally']

	test 'finally runs when catch rethrows' do
		let log = []
		def rethrow
			try
				throw new Error('first')
			catch e
				log.push e.message
				throw new Error('second')
			finally
				log.push 'finally'
		let err = rescue rethrow!
		eq err.message, 'second'
		eq log, ['first','finally']

	test 'assigned to a variable' do
		let log = []
		let value = try
			JSON.parse('{')
		catch e
			'fallback'
		finally
			log.push 'finally'
		eq value, 'fallback'
		eq log, ['finally']

	test 'return in catch still runs finally' do
		let log = []
		def run
			try
				null.missing
			catch e
				return 'from-catch'
			finally
				log.push 'finally'
			'late'
		eq run!, 'from-catch'
		eq log, ['finally']

	test 'returned explicitly' do
		def run raw
			return try
				JSON.parse(raw)
			catch e
				null
		eq run('[1]'), [1]
		eq run('{'), null

describe 'catch without a variable' do

	test 'returns the catch block value' do
		def run
			try
				null.missing
			catch
				'caught'
		eq run!, 'caught'

	test 'assigned to a variable' do
		let value = try
			JSON.parse('{')
		catch
			'fallback'
		eq value, 'fallback'

	test 'skipped when nothing throws' do
		let log = []
		try
			log.push 'body'
		catch
			log.push 'catch'
		eq log, ['body']

	test 'with finally' do
		let log = []
		def run
			try
				throw new Error('x')
			catch
				log.push 'catch'
				'caught'
			finally
				log.push 'finally'
		eq run!, 'caught'
		eq log, ['catch','finally']

	test 'inside a loop with continue' do
		let res = []
		for raw in ['1','x','3']
			let value
			try
				value = JSON.parse(raw)
			catch
				continue
			res.push value
		eq res, [1,3]

describe 'try without a catch block' do

	test 'a lone try swallows errors' do
		let log = []
		try
			log.push 'before'
			throw new Error('ignored')
			log.push 'never'
		log.push 'after'
		eq log, ['before','after']

	test 'a one-line try is undefined when it throws' do
		let raw = '{'
		let json = try JSON.parse(raw)
		eq json, undefined
		raw = '[1]'
		json = try JSON.parse(raw)
		eq json, [1]

	test 'a one-line try inside an array' do
		let res = [try JSON.parse('[1]')]
		eq res, [[1]]

	test 'a catch with an empty body yields the error' do
		let res = try JSON.parse('{') catch e
		assert res isa SyntaxError

	test 'an empty catch as the last expression returns the error' do
		def run
			try
				throw new Error('returned')
			catch e
		let res = run!
		assert res isa Error
		eq res.message, 'returned'

describe 'async try' do

	test 'await inside try with finally' do
		let log = []
		def run
			let pending = wait(1,'value')
			try
				let value = await pending
				log.push 'body'
				value + '!'
			finally
				pending = null
				log.push 'finally'
		eq await run!, 'value!'
		eq log, ['body','finally']

	test 'a rejected await is caught and finally runs' do
		let log = []
		def run
			try
				await fail-later('async-fail')
				log.push 'never'
			catch e
				log.push e.message
				'recovered'
			finally
				log.push 'finally'
		eq await run!, 'recovered'
		eq log, ['async-fail','finally']

	test 'a rejection propagates through try ... finally' do
		let log = []
		def run
			try
				await fail-later('passes-through')
			finally
				log.push 'finally'
		let err = rescue await run!
		eq err.message, 'passes-through'
		eq log, ['finally']

	test 'finally clears a timeout around a race' do
		let log = []
		def with-timeout promise, ms
			let timer = null
			let gate = new Promise do(resolve, reject)
				timer = setTimeout(&, ms) do reject(new Error('timeout'))
			try
				await Promise.race([promise, gate])
			finally
				clearTimeout(timer)
				log.push 'cleared'
		eq await with-timeout(wait(1,'fast'), 500), 'fast'
		let err = rescue await with-timeout(wait(500,'slow'), 1)
		eq err.message, 'timeout'
		eq log, ['cleared','cleared']

	test 'an async catch without a variable' do
		def run
			try
				await fail-later('x')
			catch
				'caught'
		eq await run!, 'caught'

	test 'awaits inside finally complete before returning' do
		let log = []
		def run
			try
				'value'
			finally
				await wait(1)
				log.push 'finally'
		let res = await run!
		eq res, 'value'
		eq log, ['finally']
