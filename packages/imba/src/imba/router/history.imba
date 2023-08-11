import {session} from '../storage'

const map = new WeakMap

export class State
	static def from router, raw
		return null unless raw
		new self(router,raw)

	def constructor history, object, local = no
		map.set(self,history)
		path = object.path
		data = object.data or {}
		index = object.index
		type = object.type
		local = local

	get history
		map.get(self)

	get next
		history.at(index + 1)

	get prev
		history.at(index - 1)

	def toJSON
		return {path,data,index,type}

	def save
		history.cache[index] = self
		self

	def toString
		"{history.id}|{index}"

export class History
	def constructor router
		router = router
		store = session("router")
		#states = []
		cache = {}
		index = -1

		let curr = global.history.state
		let idx
		if typeof curr == 'string'
			let m = curr.split('|')
			id = parseInt(m[0])
			index = parseInt(m[1])
			cache = store(id)
		else
			id = store.id = (store.id or 0) + 1
			cache = store(id)

		if index == -1
			# could break forward navigation for browser as well
			replaceState({initial: yes},null,router.path)

	get length
		cache.length

	get state
		at(index)

	get states
		let l = length
		let i = 0
		while i < l
			at(i++)
		return #states

	get currentStates
		states.slice(0,length)

	get next
		state.next

	get prev
		state.prev

	def slice a,b = length

		let out = []
		while a < b
			out.push(at(a++))
		return out

	def at index
		return if index >= length
		#states[index] ||= State.from(self,cache[index])

	def buildState data, url, significant = yes
		let state = {
			data: data
			index: index + 1
			path: url or router.path
			type: significant ? 'push' : 'replace'
		}
		return new State(self,state,yes)

	def pushState state, title, url, significant = yes

		unless state isa State
			state = buildState(state,url,significant)

		index = state.index
		cache[index] = state
		#states[index] = state
		#states.length = cache.length = Math.max(state.index + 1,0)
		global.history[significant ? 'pushState' : 'replaceState'](String(state),title or null,state.path)
		return self

	def replaceState state, title, url
		pushState(state,title,url,no)