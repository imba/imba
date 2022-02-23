
export def @lazy target, key, desc
	if desc.get
		let get = desc.get
		desc.get = do
			let val = get.call(this)
			Object.defineProperty(this,key,{enumerable: no, value: val})
			return val
	return desc