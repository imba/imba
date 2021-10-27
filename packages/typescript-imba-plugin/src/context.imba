import * as util from './util'

export default class Context
	
	constructor script, pos
		self.script = script
		self.pos = pos
		setup!
			
	def setup
		self
	
	get context
		#context ||= script.doc.getContextAtOffset(pos)
		
	get itoken
		context.token