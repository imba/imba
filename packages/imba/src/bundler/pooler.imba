const np = require 'path'
const workerPool = require 'workerpool'
const workerScript = np.resolve(__dirname,'..','workers.imba.js')

let pool = null
let refs = 0

def incr
	refs += 1
	pool ||= workerPool.pool(workerScript, maxWorkers:2)

def decr
	refs -= 1
	if refs < 1 and pool
		pool.terminate!

def kill
	if pool
		pool.terminate(yes)
		pool = null

export def compile_imba code, o
	if pool
		pool.exec('compile_imba', [code,o])

export def compile_imba1 code, o
	if pool
		pool.exec('compile_imba1', [code,o])

export def startWorkers
	incr!
	return {
		stop: decr
		kill: kill
		exec: do(...pars) pool.exec(...pars)
	}
