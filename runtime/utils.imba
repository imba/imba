const dashRegex = /-./g

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