import {SVGElement} from './dom'

if $web$
	extend class SVGElement
		
		def flag$ str
			@className.baseVal = str
			return

		def flagSelf$ str
			# if a tag receives flags from inside <self> we need to
			# redefine the flag-methods to later use both
			self.flag$ = do |str| self.flagSync$(#extflags = str)
			self.flagSelf$ = do |str| self.flagSync$(#ownflags = str)
			@className.baseVal = (@className.baseVal || '') + ' ' + (#ownflags = str)
			return

		def flagSync$
			@className.baseVal = ((#extflags or '') + ' ' + (#ownflags || ''))