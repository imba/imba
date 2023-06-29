global.L = do(...args)
	if $node$
		args.unshift('DL'.bold)
	else
		if typeof args[0] == 'string'
			args[0] = 'DL '+args[0]
		else
			args.unshift('DL')
	console.log(...args)

global.LL = console.log

global.sleep = do(ms = 0, cb)
	new Promise do(resolve)
		setTimeout(&,ms) do
			cb! if cb
			resolve!
