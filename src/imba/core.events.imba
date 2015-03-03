

def emit event, args, cbs
	var node, prev, cb, ret
	var node = cbs[event]

	while (prev = node) and (node = node:next)
		if cb = node:callback
			ret = cb.apply(node, args)

		if node:times && --node:times <= 0
			prev:next = node:next
			node:callback = null
	return

# method for registering a listener on object
def Imba.listen obj, event, callback
	var cbs, list, tail
	cbs = obj:__callbacks__ ||= {}
	list = cbs[event] ||= {}
	tail = list:tail || (list:tail = (list:next = {}))
	tail:callback = callback
	list:tail = tail:next = {}
	return tail

def Imba.once obj, event, callback
	var tail = Imba.listen(obj,event,callback)
	tail:times = 1
	return tail

def Imba.unlisten obj, event, cb
	var node, prev
	var meta = obj:__callbacks__
	return unless meta

	if node = meta[event]
		while (prev = node) and (node = node:next)
			if node == cb || node:callback == cb
				prev:next = node:next
				node:callback = null
				break
	return

def Imba.emit obj, event, params
	var cb  = obj:__callbacks__
	emit(event,params,cb) if cb
	emit('all',[event,params],cb) if cb
	return

# def Imba.testEvents
# 	var obj = {name: "Hello"}
# 	var fn = do console.log "event did trigger!!",arguments
# 	FOBJ = obj
# 	Imba.listen(obj,"ping",fn)
# 	Imba.listen(obj,"all",fn)
# 	Imba.emit(obj,"ping",1,2,3)
# 	Imba.unlisten(obj,"ping",fn)
# 	Imba.emit(obj,"ping",1,2,3)
