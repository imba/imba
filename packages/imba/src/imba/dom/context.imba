

export const renderContext = {
	context: null
}

export class RenderContext < Map
	def constructor parent
		super()
		self._ = parent

	def pop
		renderContext.context = null
	
	def #getRenderContext sym, key
		ns(sym)

		# createRenderContext(self,sym)
	def #getDynamicContext sym, key
		#getRenderContext(sym).#getRenderContext(key)

	def ns key
		let out = self.get(key)
		out || self.set(key,out = new RenderContext(self._))
		return renderContext.context = out

export def createRenderContext cache,key = Symbol!,up = cache,ns = null
	let ctx = renderContext.context = cache[key] ||= new RenderContext(up)
	return ns ? ctx.ns(ns) : ctx
	# 
	# 	return ctx.ns(ns)
	# 	unless ctx.map.get(ns)
	# 		console.log "create new map!",ctx
	# 	return renderContext.context = ctx.map.get(ns) or (ctx.map.set(ns,ctx = {_:up,map:new Map}) and ctx)
	# eturn ctx


export def getRenderContext
	let ctx = renderContext.context
	renderContext.context = null if ctx
	return ctx or new RenderContext(null)
	# {map:new Map}