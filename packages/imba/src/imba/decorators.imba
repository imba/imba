
export def @lazy target, key, desc
	if desc.get
		let get = desc.get
		desc.get = do
			let val = get.call(this)
			Object.defineProperty(this,key,{enumerable: no, value: val})
			return val
	return desc

export def @bound target, key, desc
	if desc.value isa Function
		let fn = desc.value
		desc.get = do
			if this == target
				return fn
			let val = fn.bind(this)
			Object.defineProperty(this,key,{enumerable: no, value: val})
			return val
		delete desc.value
		delete desc.writable
	return desc