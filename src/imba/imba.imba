extern window, global

if typeof window !== 'undefined'
	global = window

###
Imba is the namespace for all runtime related utilities
@namespace
###
Imba = {
	VERSION: '0.13.9'
}

var reg = /-./g

###
True if running in client environment.
@return {bool}
###
def Imba.isClient
	Imba.CLIENT === yes

###
True if running in server environment.
@return {bool}
###
def Imba.isServer
	Imba.SERVER === yes

def Imba.subclass obj, sup
	for k,v of sup
		obj[k] = v if sup.hasOwnProperty(k)

	obj:prototype = Object.create(sup:prototype)
	obj:__super__ = obj:prototype:__super__ = sup:prototype
	obj:prototype:initialize = obj:prototype:constructor = obj
	return obj

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

def Imba.indexOf a,b
	return (b && b:indexOf) ? b.indexOf(a) : []:indexOf.call(a,b)