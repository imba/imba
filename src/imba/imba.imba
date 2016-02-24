var isClient = (typeof window == 'object' and this == window)

if isClient
	# should not go there
	window:global ||= window

###
Imba is the namespace for all runtime related utilities
@namespace
###
Imba = {
	VERSION: '0.14.5'
	CLIENT: isClient
	SERVER: !isClient
	DEBUG: no
}

var reg = /-./g

###
True if running in client environment.
@return {bool}
###
def Imba.isClient
	Imba.CLIENT == yes

###
True if running in server environment.
@return {bool}
###
def Imba.isServer
	Imba.SERVER == yes

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
		Promise.all(value)
	elif value and value:then
		value
	else
		Promise.resolve(value)

def Imba.toCamelCase str
	str.replace(reg) do |m| m.charAt(1).toUpperCase

def Imba.toCamelCase str
	str.replace(reg) do |m| m.charAt(1).toUpperCase

def Imba.indexOf a,b
	return (b && b:indexOf) ? b.indexOf(a) : []:indexOf.call(a,b)

def Imba.prop scope, name, opts
	if scope:defineProperty
		return scope.defineProperty(name,opts)
	return

def Imba.attr scope, name, opts
	if scope:defineAttribute
		return scope.defineAttribute(name,opts)

	let getName = Imba.toCamelCase(name)
	let setName = Imba.toCamelCase('set-' + name)

	scope:prototype[getName] = do
		return this.getAttribute(name)

	scope:prototype[setName] = do |value|
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

Imba
