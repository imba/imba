extern window, global

if typeof window !== 'undefined'
	global = window

Imba = {
	VERSION: '0.13.5'
}

var reg = /-./g

def Imba.toCamelCase str
	str.replace(reg) do |m| m.charAt(1).toUpperCase