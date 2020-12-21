export class History
	def constructor router
		router = router
		stack = []
		pos = -1
		
	def pushState state, title, url
		stack.length = Math.max(pos,0)
		stack[++pos] = [state,title,url]
		# console.log "pushed state {url}"
		return self
		
	def replaceState state, title, url
		# console.log "replaced state {url}"
		stack.length = pos
		stack[pos] = [state,title,url]
		
	def popState
		stack.length = pos + 1
		pos -= 1
		return stack.pop!

	def currentState
		stack[pos]