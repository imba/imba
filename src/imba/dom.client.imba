# Extending Imba.Tag#css to work without prefixes by inspecting
# the properties of a CSSStyleDeclaration and creating a map

# var prefixes = ['-webkit-','-ms-','-moz-','-o-','-blink-']
# var props = ['transform','transition','animation']

if Imba.CLIENT
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

	extend tag element

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
			
	unless document:documentElement:classList
		extend tag element

			def hasFlag ref
				return RegExp.new('(^|\\s)' + ref + '(\\s|$)').test(@dom:className)

			def addFlag ref
				return self if hasFlag(ref)
				@dom:className += (@dom:className ? ' ' : '') + ref
				return self

			def unflag ref
				return self unless hasFlag(ref)
				var regex = RegExp.new('(^|\\s)*' + ref + '(\\s|$)*', 'g')
				@dom:className = @dom:className.replace(regex, '')
				return self

			def toggleFlag ref
				hasFlag(ref) ? unflag(ref) : flag(ref)

			def flag ref, bool
				if arguments:length == 2 and !!bool === no
					return unflag(ref)
				return addFlag(ref)
		true