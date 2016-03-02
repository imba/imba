class Imba.TagManagerClass

	prop inserts
	prop spawns
	prop removes
	prop mountable
	prop mounted

	def initialize
		@spawns = 0
		@inserts = 0
		@removes = 0
		@mountable = []
		@mounted = []

	def insert node, parent
		@inserts++
		return

	def remove node, parent
		@removes++
		return

	def mount node
		return unless $web$

		unless @mountable.indexOf(node) >= 0
			node.@mounted = 2
			@mountable.push(node)

	def refresh
		return unless $web$

		if @inserts and @mountable:length
			tryMount

		if @removes and @mounted:length
			tryUnmount

		@inserts = 0
		@removes = 0
		self

	def unmount node
		self

	def tryMount
		var count = 0

		for item,i in @mountable
			if item and document:body.contains(item.@dom)
				@mounted.push(item)
				item.@mounted = 1
				item.mount
				@mountable[i] = null
				count++
		
		if count
			@mountable = @mountable.filter do |item| item

		self

	def tryUnmount
		var count = 0
		var root = document:body
		for item, i in @mounted
			unless document.contains(item.dom)
				item.@mounted = 0
				if item:unmount
					item.unmount
				elif item.@scheduler
					item.unschedule
				@mounted[i] = null
				count++
		
		if count
			@mounted = @mounted.filter do |item| item

		self