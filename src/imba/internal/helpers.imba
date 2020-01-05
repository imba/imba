export def setField$ target, key, value, o
	Object.defineProperty(target,key,{value:value})

export def extendTag$ el,cls
	Object.defineProperties(el,Object.getOwnPropertyDescriptors(cls.prototype))
	return el

export def iter$ obj
	return obj ? (obj.toIterable ? obj.toIterable() : obj) : []