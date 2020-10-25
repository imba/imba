extend class imba.dom.Comment
	# replace this with something else
	def replaceWith$ other
		if other and other.joinBefore$
			other.joinBefore$(this)
		else
			self.parentNode.insertBefore$(other,this)
		# other.insertBeforeBegin$(this)
		self.parentNode.removeChild(this)
		# self.parentNode.replaceChild(other,this)
		return other