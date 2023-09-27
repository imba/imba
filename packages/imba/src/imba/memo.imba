const MEMOMAP = new WeakMap()
const MEMOS = {}

export def memofunc hash,slf,fn
	if slf != null
		let map = MEMOS[hash] ||= new WeakMap
		return map.get(slf) or map.set(slf,(fn.memoized = hash) && fn).get(slf)
	return fn