# imba$imbaPath=global
const handler =
	def get target, name
		let ctx = target
		let val = undefined
		while ctx and val == undefined
			if ctx = ctx.#parent
				val = ctx[name]
		return val

extend class imba.dom.Node

	get $context
		console.warn "$context is deprecated - use #context instead"

	get #context
		##context ||= new Proxy(self,handler)