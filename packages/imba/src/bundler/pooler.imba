const np = require 'path'
const workerPool = require 'workerpool'
# temporary hack - we know that we compile to bin/
# const workerScript = np.resolve(__dirname,'..','dist','compiler-worker.js')
const workerScript = np.resolve(__dirname,'..','workers.imba.js')

# #workers ||= workerPool.pool(workerScript, maxWorkers:2)

let pool = null
let refs = 0

def incr
	refs += 1
	pool ||= workerPool.pool(workerScript, maxWorkers:2)

def decr
	refs -= 1
	if refs < 1 and pool
		pool.terminate!

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
		exec: do(...pars) pool.exec(...pars)
	}


