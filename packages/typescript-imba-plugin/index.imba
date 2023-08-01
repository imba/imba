import * as util from './src/util'

import Compiler from './src/compiler'
import Service from './src/service'
import ImbaScript from './src/script'
import Patcher from './src/patches'

def patch ts
	Patcher(ts)

	Object.defineProperty(ts.server.ScriptInfo.prototype,Symbol.for('#imba'),{
		get: do
			return null unless util.isImba(this.path)
			unless this.##imba
				this.##imba = new ImbaScript(this)
				this.##imba.setup!
			return this.##imba
	})

	Object.defineProperty(ts.server.ScriptInfo.prototype,'im',{get: do this.#imba})
	
def init modules = {}
	let ts = global.ts = global.TS = modules.typescript
	# don't patch if there are no imba files here?
	# console.log('init plugin',Object.keys(modules))
	try
		if ts.#patched =? yes
			
			patch(ts)
			ts.ils = global.ils ||= new Service
			# L `init service`
			# process.exit(0)
			util.log('init plugin')
	catch e
		util.log('error',e)
	return ts.ils

module.exports = init