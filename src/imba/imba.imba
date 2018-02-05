###
Imba is the namespace for all runtime related utilities
@namespace
###
var Imba = {VERSION: '1.3.0-beta.3'}

###

Light wrapper around native setTimeout that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after the timeout to let schedulers update (to rerender etc) afterwards.

###
def Imba.setTimeout delay, &block
	setTimeout(&,delay) do
		block()
		Imba.commit

###

Light wrapper around native setInterval that expects the block / function
as last argument (instead of first). It also triggers an event to Imba
after every interval to let schedulers update (to rerender etc) afterwards.

###
def Imba.setInterval interval, &block
	setInterval(block,interval)

###
Clear interval with specified id
###
def Imba.clearInterval id
	clearInterval(id)

###
Clear timeout with specified id
###
def Imba.clearTimeout id
	clearTimeout(id)


def Imba.subclass obj, sup
	for k,v of sup
		obj[k] = v if sup.hasOwnProperty(k)

	obj:prototype = Object.create(sup:prototype)
	obj:__super__ = obj:prototype:__super__ = sup:prototype
	obj:prototype:initialize = obj:prototype:constructor = obj
	return obj

###
Lightweight method for making an object iterable in imbas for/in loops.
If the compiler cannot say for certain that a target in a for loop is an
array, it will cache the iterable version before looping.

```imba
# this is the whole method
def Imba.iterable o
	return o ? (o:toArray ? o.toArray : o) : []

class CustomIterable
	def toArray
		[1,2,3]

# will return [2,4,6]
for x in CustomIterable.new
	x * 2

```
###
def Imba.iterable o
	return o ? (o:toArray ? o.toArray : o) : []

###
Coerces a value into a promise. If value is array it will
call `Promise.all(value)`, or if it is not a promise it will
wrap the value in `Promise.resolve(value)`. Used for experimental
await syntax.
@return {Promise}
###
def Imba.await value
	if value isa Array
		console.warn("await (Array) is deprecated - use await Promise.all(Array)")
		Promise.all(value)
	elif value and value:then
		value
	else
		Promise.resolve(value)

var dashRegex = /-./g
var setterCache = {}

def Imba.toCamelCase str
	if str.indexOf('-') >= 0
		str.replace(dashRegex) do |m| m.charAt(1).toUpperCase
	else
		str
		
def Imba.toSetter str
	setterCache[str] ||= Imba.toCamelCase('set-' + str)

def Imba.indexOf a,b
	return (b && b:indexOf) ? b.indexOf(a) : []:indexOf.call(a,b)

def Imba.len a
	return a && (a:len isa Function ? a:len.call(a) : a:length) or 0

def Imba.prop scope, name, opts
	if scope:defineProperty
		return scope.defineProperty(name,opts)
	return

def Imba.attr scope, name, opts = {}
	if scope:defineAttribute
		return scope.defineAttribute(name,opts)

	let getName = Imba.toCamelCase(name)
	let setName = Imba.toCamelCase('set-' + name)
	let proto = scope:prototype

	if opts:dom
		proto[getName] = do this.dom[name]
		proto[setName] = do |value|
			if value != this[name]()
				this.dom[name] = value
			return this
	else
		proto[getName] = do this.getAttribute(name)
		proto[setName] = do |value|
			this.setAttribute(name,value)
			return this
	return

def Imba.propDidSet object, property, val, prev
	let fn = property:watch
	if fn isa Function
		fn.call(object,val,prev,property)
	elif fn isa String and object[fn]
		object[fn](val,prev,property)
	return


# Basic events
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

# register a listener once
def Imba.once obj, event, listener
	var tail = Imba.listen(obj,event,listener)
	tail:times = 1
	return tail

# remove a listener
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

# emit event
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

module:exports = Imba
