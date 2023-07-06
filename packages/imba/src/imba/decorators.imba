
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


const thenables = new WeakMap

export def @thenable target, key, desc

	let val = desc.value
	let sym = Symbol!
	let meta = thenables.get(target)
	meta || thenables.set(target,meta = [])

	if meta.length
		throw new Error(`@thenable {target.constructor..name}.{key} not allowed - @thenable {meta[0][0]} already defined`)

	const warn = do
		console.trace `@thenable {target.constructor..name}.{key} takes long - make sure method does not return self`

	meta.push([key,sym])

	if val isa Function
		if val.length > 0
			throw new Error(`@thenable methods cannot be called with arguments ({key})`)

		Object.defineProperty(target,'then',{
			enumerable: no,
			value: do(ok,err)
				let that = this
				let promise = new Promise do(resolve,reject)
					# TODO should only happen in debug
					let timeout = setTimeout(warn,2s)

					let err = do(error)
						clearTimeout(timeout)
						reject(error)

					that[key]().then(&,err) do
						clearTimeout(timeout)
						Object.defineProperty(that,'then',{value: null, writable: yes, configurable: yes})
						resolve(that)

				promise.then(ok,err)
		})

		desc.value = do(value)
			this[sym] ||= Promise.resolve(val.call(this))

		# You can reset thenables explicitly by calling instance.myfunction.reset(instance)
		desc.value.reset = do(target)
			if target and target[sym]
				delete target[sym]
				delete target.then

	return desc