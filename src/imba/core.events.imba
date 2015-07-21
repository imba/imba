

def emit__ event, args, node
	# var node = cbs[event]
	var prev, cb, ret

	while (prev = node) and (node = node:next)
		if cb = node:listener
			if node:path and cb[node:path]
				ret = args ? cb[node:path].apply(cb,args) : cb[node:path]()
			else
				# check if it is a method?
				ret = args ? cb.apply(node, args) : cb.call(node)

		if node:times && --node:times <= 0
			prev:next = node:next
			node:listener = null
	return

# method for registering a listener on object
def Imba.listen obj, event, listener, path
	var cbs, list, tail
	cbs = obj:__listeners__ ||= {}
	list = cbs[event] ||= {}
	tail = list:tail || (list:tail = (list:next = {}))
	tail:listener = listener
	tail:path = path
	list:tail = tail:next = {}
	return tail

def Imba.once obj, event, listener
	var tail = Imba.listen(obj,event,listener)
	tail:times = 1
	return tail

def Imba.unlisten obj, event, cb, meth
	var node, prev
	var meta = obj:__listeners__
	return unless meta

	if node = meta[event]
		while (prev = node) and (node = node:next)
			if node == cb || node:listener == cb
				prev:next = node:next
				# check for correct path as well?
				node:listener = null
				break
	return

def Imba.emit obj, event, params
	if var cb = obj:__listeners__
		emit__(event,params,cb[event]) if cb[event]
		emit__(event,[event,params],cb:all) if cb:all # and event != 'all'
	return

def Imba.observeProperty observer, key, trigger, target, prev
	if prev and typeof prev == 'object'
		Imba.unlisten(prev,'all',observer,trigger)
	if target and typeof target == 'object'
		Imba.listen(target,'all',observer,trigger)
	self