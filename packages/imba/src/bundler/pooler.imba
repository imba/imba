import np from 'path'
import os from 'os'
import * as workerPool from 'workerpool'
const workerScript = np.resolve(__dirname,'..','workers.imba.js')

# Compile workers are CPU-bound. Scale with the machine but leave a core for the
# main thread (esbuild, the dev server, transform/write), and cap it so a big
# build on a many-core box doesn't spawn a worker per core - each one loads the
# compiler. Workers are created on demand, so this is only a ceiling. Override
# with IMBA_MAX_WORKERS.
const cpuCount = (os.availableParallelism ? os.availableParallelism! : os.cpus!.length) or 4
const envWorkers = parseInt(process.env.IMBA_MAX_WORKERS)
const maxWorkers = envWorkers > 0 ? envWorkers : Math.max(2,Math.min(cpuCount - 1,8))

let pool = null
let refs = 0

def incr
	refs += 1
	pool ||= workerPool.pool(workerScript, maxWorkers: maxWorkers)

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
