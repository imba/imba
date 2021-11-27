

export const renderContext = {
	context: null
}

export class RenderContext < Map
	def constructor parent
		super()
		self._ = parent

	def pop
		renderContext.context = null
	
	def #getRenderContext sym
		let out = self.get(sym)
		out || self.set(sym,out = new RenderContext(self._))
		return renderContext.context = out

		# createRenderContext(self,sym)
	def #getDynamicContext sym, key
		#getRenderContext(sym).#getRenderContext(key)

	def run value
		self.value = value
		renderContext.context = null if renderContext.context == self
		return self.get(value)

	def cache val
		self.set(self.value,val)
		return val

export def createRenderContext cache,key = Symbol!,up = cache
	return renderContext.context = cache[key] ||= new RenderContext(up)

export def getRenderContext
	let ctx = renderContext.context
	renderContext.context = null if ctx
	return ctx or new RenderContext(null)
	# {map:new Map}