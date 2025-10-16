global.sleep = do(ms = 0, cb=null)
	new Promise do(resolve)
		setTimeout(&,ms) do
			cb! if cb
			resolve!
