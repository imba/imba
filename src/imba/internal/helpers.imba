export def setField$ target, key, value, o
	Object.defineProperty(target,key,{value:value})

export def extendTag$ el,cls
	Object.defineProperties(el,Object.getOwnPropertyDescriptors(cls.prototype))
	return el

export def iter$ obj
	let iter 
	return obj ? ((iter = obj.toIterable) ? iter.call(obj) : obj) : []