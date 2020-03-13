import {SVGElement} from './dom'

if $web$
	extend class SVGElement
		
		def flag$ str
			self.className.baseVal = str
			return

		def flagSelf$ str
			# if a tag receives flags from inside <self> we need to
			# redefine the flag-methods to later use both
			self.flag$ = do |str| self.flagSync$(#extflags = str)
			self.flagSelf$ = do |str| self.flagSync$(#ownflags = str)
			self.className.baseVal = (self.className.baseVal || '') + ' ' + (#ownflags = str)
			return

		def flagSync$
			self.className.baseVal = ((#extflags or '') + ' ' + (#ownflags || ''))