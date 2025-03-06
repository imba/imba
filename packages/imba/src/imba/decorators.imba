# imba$stdlib=1

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
	let o = this[0] or {}
	let val = desc.value
	let thensym = Symbol!
	let weakmap = new WeakMap
	let meta = thenables.get(target)
	let maxtime = o.timeout or 10s
	let readable = `{target.constructor..name or ''}.{String(key isa 'symbol' ? key.description : key)}`
	meta || thenables.set(target,meta = {})

	if meta.key
		throw new Error(`@thenable {readable} not allowed - @thenable {meta.key} already defined`)

	if val !isa Function
		throw new Error(`@thenable {readable} only supports functions`)

	if val.length > 0
		throw new Error(`@thenable {readable} methods cannot be called with arguments`)

	const warn = do(target)
		console.trace `@thenable {readable} took more than {maxtime}ms - make sure method does not return self.`,target

	const lookup = do(that)
		let m = weakmap.get(that)
		m || weakmap.set(that,m = {})
		return m
	
	const wrapper = do(ok,err)
		let that = this
		let obj = lookup(that)
		
		let promise = obj.promise ||= new Promise do(resolve,reject)
			# TODO should only happen in debug
			let timeout = o.timeout !== no ? setTimeout(warn,o.timeout or 20s,that) : null

			let err = do(error)
				clearTimeout(timeout) if timeout
				obj.met = yes
				obj.error = error
				console.trace `@thenable {readable} threw error`,error
				reject(error)

			that[key]().then(&,err) do
				clearTimeout(timeout) if timeout
				obj.met = yes
				resolve(that)

		return promise.then(ok,err)

	Object.defineProperty(target,'then',{
		enumerable: no,
		configurable: yes,
		get: do return lookup(this).met ? null : wrapper
	})

	desc.value = do(value)
		let m = lookup(this)
		m.wrapped ??= Promise.resolve(val.call(this,m))
		return m.wrapped
	
	desc.value.reset = do(target)
		let m = lookup(target)
		weakmap.delete(target)
		return
	
	desc.value.check = lookup		

	return desc