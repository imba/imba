var Imba = require("../imba")

class Imba.TagManagerClass

	prop inserts
	prop spawns
	prop removes
	prop mounted

	def initialize
		@spawns = 0
		@inserts = 0
		@removes = 0
		@mounted = []
		@hasMountables = no
		self

	def insert node, parent
		@inserts++
		return

	def remove node, parent
		@removes++
		return

	def changes
		@inserts + @removes

	def mount node
		return if $node$
		@hasMountables = yes

	def refresh force = no
		return if $node$
		# console.time('resolveMounts')
		if @inserts and @hasMountables
			tryMount

		if (@removes or force) and @mounted:length
			tryUnmount
		# console.timeEnd('resolveMounts')
		@inserts = 0
		@removes = 0
		self

	def unmount node
		self

	def tryMount
		var count = 0
		var root = document:body
		var items = root.querySelectorAll('.__mount')
		# what if we end up creating additional mountables by mounting?
		for el in items
			if el and el.@tag
				if @mounted.indexOf(el.@tag) == -1
					mountNode(el.@tag)
		return self

	def mountNode node
		@mounted.push(node)
		node.FLAGS |= Imba.TAG_MOUNTED
		node.mount if node:mount
		return

	def tryUnmount
		var count = 0
		var root = document:body
		for item, i in @mounted
			unless document:documentElement.contains(item.@dom)
				item.FLAGS = item.FLAGS & ~Imba.TAG_MOUNTED
				if item:unmount and item.@dom
					item.unmount
				elif item.@scheduler
					# MAYBE FIX THIS?
					item.unschedule
				@mounted[i] = null
				count++
		
		if count
			@mounted = @mounted.filter do |item| item
		self