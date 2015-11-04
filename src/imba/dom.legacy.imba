unless document:documentElement:classList
	extend tag htmlelement

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
