import {SVGElement} from '../dom'

extend class SVGElement
	
	def flag$ str
		self.className.baseVal = flags$ext = str
		return

	def flagSelf$ str
		# if a tag receives flags from inside <self> we need to
		# redefine the flag-methods to later use both
		self.flag$ = do(str) self.flagSync$(flags$ext = str)
		self.flagSelf$ = do(str) self.flagSync$(flags$own = str)
		return flagSelf$(str)

	def flagSync$
		self.className.baseVal = ((flags$ext or '') + ' ' + (flags$own || '') + ' ' + ($flags or ''))