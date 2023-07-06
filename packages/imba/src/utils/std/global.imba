global.LL = console.log

global.sleep = do(ms = 0, cb)
	new Promise do(resolve)
		setTimeout(&,ms) do
			cb! if cb
			resolve!
