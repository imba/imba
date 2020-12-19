# imba$imbaPath=global
import {Element} from './core'

export def domFlags
	yes

export class Flags

	def constructor dom
		dom = dom
		string = ""

	def contains ref
		return dom.classList.contains(ref)

	def add ref
		return self if contains(ref)
		string += (string ? ' ' : '') + ref
		dom.classList.add(ref)
		# sync!
		return self

	def remove ref
		return self unless contains(ref)
		var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*', 'g')
		string = string.replace(regex, '')
		dom.classList.remove(ref)
		# sync!
		return self

	def toggle ref, bool
		bool = !contains(ref) if bool === undefined
		bool ? add(ref) : remove(ref)
		
	def incr ref
		let m = stacks ||= {}
		let c = m[ref] or 0
		add(ref) if c < 1
		m[ref] = Math.max(c,0) + 1
		return self
	
	def decr ref
		let m = stacks ||= {}
		let c = m[ref] or 0
		remove(ref) if c == 1
		m[ref] = Math.max(c,1) - 1
		return self

	def valueOf
		string

	def toString
		string

	def sync
		dom.flagSync$!


extend class Element

	get flags
		unless $flags
			# unless deopted - we want to first cache the extflags
			$flags = new Flags(self)
			if flag$ == Element.prototype.flag$
				flags$ext = self.className
			flagDeopt$()
		return $flags

	def flag$ str
		# Potentially slow
		let ns = flags$ns
		self.className = ns ? (ns + (flags$ext = str)) : (flags$ext = str)
		return
		
	def flagDeopt$
		self.flag$ = self.flagExt$ # do(str) self.flagSync$(flags$ext = str)
		self.flagSelf$ = do(str) self.flagSync$(flags$own = str)
		return
		
	def flagExt$ str
		self.flagSync$(flags$ext = str)

	def flagSelf$ str
		# if a tag receives flags from inside <self> we need to
		# redefine the flag-methods to later use both
		flagDeopt$()
		return flagSelf$(str)

	def flagSync$
		self.className = ((flags$ns or '') + (flags$ext or '') + ' ' + (flags$own || '') + ' ' + ($flags or ''))
