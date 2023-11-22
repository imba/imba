# imba$stdlib=1

export const renderContext = {
	context: null

}

class Renderer

	stack = []

	def push el
		stack.push(el)

	def pop el
		stack.pop!

export const renderer = new Renderer

export class RenderContext < Map
	def constructor parent,sym = null
		super()
		self._ = parent
		self.sym = sym

	def pop
		renderContext.context = null

	def #getRenderContext sym
		let out = self.get(sym)
		out || self.set(sym,out = new RenderContext(self._,sym))
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
	return renderContext.context = cache[key] ||= new RenderContext(up,key)

export def getRenderContext
	let ctx = renderContext.context
	let res = ctx or new RenderContext(null)
	if global.DEBUG_IMBA
		if !ctx and renderer.stack.length > 0
			console.warn "detected unmemoized nodes in",renderer.stack.slice(0),"see https://imba.io",res

	renderContext.context = null if ctx
	return res
	# {map:new Map}