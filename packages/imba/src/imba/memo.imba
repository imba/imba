const MEMOMAP = new WeakMap()
const MEMOS = {}

export def memofunc hash,slf,fn
	if slf != null
		let map = MEMOS[hash] ||= new WeakMap
		return map.get(slf) or map.set(slf,(fn.memoized = hash) && fn).get(slf)
	return fn

###
Capture-slot variant used for amperfunctions that close over effectively-final
outer variables. Memoized per (hash, slf, ...caps) through a WeakMap/Map trie -
object captures live in WeakMap levels, primitives in Map levels. The compiler
always appends a \u0001-delimited capture-name suffix to these hashes, so they
can never collide with plain memofunc hashes.
###
export def memofuncv hash,slf,fn,caps
	let map = MEMOS[hash] ||= new WeakMap
	let node = map.get(slf)
	map.set(slf,node = {f: null, o: null, p: null}) unless node
	for cap in caps
		let objkey = cap !== null and (typeof cap == 'object' or typeof cap == 'function')
		let level = objkey ? (node.o ||= new WeakMap) : (node.p ||= new Map)
		let next = level.get(cap)
		level.set(cap,next = {f: null, o: null, p: null}) unless next
		node = next
	node.f ||= (fn.memoized = hash) and fn