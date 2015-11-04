# Extending Imba.Tag#css to work without prefixes by inspecting
# the properties of a CSSStyleDeclaration and creating a map

# var prefixes = ['-webkit-','-ms-','-moz-','-o-','-blink-']
# var props = ['transform','transition','animation']

var styles = window.getComputedStyle(document:documentElement, '')

Imba.CSSKeyMap = {}

for prefixed in styles
	var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'')
	var camelCase = unprefixed.replace(/-(\w)/g) do |m,a| a.toUpperCase

	# if there exists an unprefixed version -- always use this
	if prefixed != unprefixed
		continue if styles.hasOwnProperty(unprefixed)

	# register the prefixes
	Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed

extend tag htmlelement

	# override the original css method
	def css key, val
		if key isa Object
			css(k,v) for own k,v of key
			return self

		key = Imba.CSSKeyMap[key] or key

		if val == null
			dom:style.removeProperty(key)
		elif val == undefined
			return dom:style[key]
		else
			if val isa Number and key.match(/width|height|left|right|top|bottom/)
				val = val + "px"
			dom:style[key] = val
		self