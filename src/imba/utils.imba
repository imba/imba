const dashRegex = /-./g

export def serializeData data
	let map = new Map
	let arr = []
	let logging = no
	let replacer = do(key,value)
		if value and value.#type and key !== ''
			let ref = map.get(value) # value[sym] ||= "$${nr++}$$"
			unless map.has(value)
				map.set(value,ref = "$${arr.length}$$")
				arr.push(value)
			return key == null ? value : ref
		value

	let json = JSON.stringify(data,replacer,2)
	let i = 0
	logging = yes
	while i < arr.length
		arr[i] = JSON.stringify(arr[i],replacer,2)
		i++

	let inject = ""
	for item,i in arr
		inject += "\"$${i}$$\":{item},\n"
	json = '{' + inject + json.slice(1)
	return json
	# json = JSON.stringify(Object.assign({"$$": refs},JSON.parse(json)),replacer,2)
	

export def deserializeData data, reviver = null
	let objects = {}
	let reg = /\$\$\d+\$\$/
	let lookup = do(value)
		return objects[value] ||= reviver ? reviver(value) : {}

	let parser = do(key,value)
		if typeof value == 'string'
			if value[0] == '$' and reg.test(value)
				return lookup(value)
		elif typeof key == 'string' and key[0] == '$' and reg.test(key)
			let obj = lookup(key)
			Object.assign(obj,value)
			return obj

		return value

	let parsed = JSON.parse(data,parser)
	return parsed

	if parsed.$$
		for own k,v of parsed.$$
			if let obj = objects[k]
				Object.assign(obj,v)
		delete parsed.$$
	return parsed

export def patchManifest prev, curr
	let origs = {}
	let diff = {
		added: []
		changed: []
		removed: []
		all: []
		urls: {}
	}

	if prev.assets
		for item in prev.assets
			let ref = item.originalPath or item.path
			origs[ref] = item
			if item.url
				# add old urls to the new manifest
				curr.urls[item.url] ||= item
	
	for item in (curr.assets or [])
		let ref = item.originalPath or item.path
		let orig = origs[ref]

		if item.url and prev.urls
			prev.urls[item.url] = item

		if orig
			if orig.hash != item.hash
				orig.invalidated = Date.now!
				orig.replacedBy = item
				item.replaces = orig
				diff.changed.push(item)
				diff.all.push(item)

				if orig == prev.main
					diff.main = item

			delete origs[ref]
		else
			diff.added.push(item)
			diff.all.push(item)

	# these are the items that are no longer referencd
	for own path,item of origs
		item.removed = Date.now!
		diff.all.push(item)

	for item in diff.all
		let typ = diff[item.type] ||= []
		typ.push(item)

	diff.removed = Object.values(origs)
	curr.changes = diff
	return curr

export def toCamelCase str
	if str.indexOf('-') >= 0
		str.replace(dashRegex) do $1.charAt(1).toUpperCase!
	else
		str


# Basic events - move to separate file?
const emit__ = do(event, args, node)
	let prev
	let cb
	let ret

	while (prev = node) and (node = node.next)
		if cb = node.listener
			if node.path and cb[node.path]
				ret = args ? cb[node.path].apply(cb,args) : cb[node.path]()
			else
				# check if it is a method?
				ret = args ? cb.apply(node, args) : cb.call(node)

		if node.times && --node.times <= 0
			prev.next = node.next
			node.listener = null
	return

# method for registering a listener on object
export def listen obj, event, listener, path
	let cbs
	let list
	let tail
	cbs = obj.#__listeners__ ||= {}
	list = cbs[event] ||= {}
	tail = list.tail || (list.tail = (list.next = {}))
	tail.listener = listener
	tail.path = path
	list.tail = tail.next = {}
	return tail

# register a listener once
export def once obj, event, listener
	let tail = listen(obj,event,listener)
	tail.times = 1
	return tail

# remove a listener
export def unlisten obj, event, cb, meth
	let node
	let prev
	let meta = obj.#__listeners__
	return unless meta

	if node = meta[event]
		while (prev = node) and (node = node.next)
			if node == cb || node.listener == cb
				prev.next = node.next
				# check for correct path as well?
				node.listener = null
				break
	return

# emit event
export def emit obj, event, params
	if let cb = obj.#__listeners__
		emit__(event,params,cb[event]) if cb[event]
		emit__(event,[event,params],cb.all) if cb.all
	return