var Imba = require("../imba")

unless $drop_deprecated$
	###
	The special syntax for selectors in Imba creates Imba.Selector
	instances.
	###
	class Imba.Selector
		
		def self.one sel, scope
			var el = (scope || Imba.document).querySelector(sel)
			el && tag(el) || null

		def self.all sel, scope
			Imba.Selector.new(sel,scope)

		prop query

		def initialize sel, scope, nodes

			@query = sel isa Imba.Selector ? sel.query : sel
			@context = scope

			if nodes
				@nodes = (tag(node) for node in nodes)

			@lazy = !nodes
			return self

		def reload
			@nodes = null
			self

		def scope
			return @scope if @scope
			return Imba.document unless var ctx = @context
			@scope = ctx:toScope ? ctx.toScope : ctx

		###
		@returns {Imba.Tag} first node matching this selector
		###
		def first
			if @lazy then tag(@first ||= scope.querySelector(query))
			else nodes[0]

		###
		@returns {Imba.Tag} last node matching this selector
		###
		def last
			nodes[@nodes:length - 1]

		###
		@returns [Imba.Tag] all nodes matching this selector
		###
		def nodes
			return @nodes if @nodes
			var items = scope.querySelectorAll(query)
			@nodes = (tag(node) for node in items)
			@lazy = no
			@nodes
		
		###
		The number of nodes matching this selector
		###
		def count do nodes:length

		def len do nodes:length

		###
		@todo Add support for block or selector?
		###
		def some
			count >= 1
		
		###
		Get node at index
		###
		def at idx
			nodes[idx]

		###
		Loop through nodes
		###
		def forEach block
			nodes.forEach(block)
			self

		###
		Map nodes
		###
		def map block
			nodes.map(block)

		###
		Returns a plain array containing nodes. Implicitly called
		when iterating over a selector in Imba `(node for node in $(selector))`
		###
		def toArray
			nodes
		
		# Get the first element that matches the selector, 
		# beginning at the current element and progressing up through the DOM tree
		def closest sel
			# seems strange that we alter this selector?
			@nodes = map do |node| node.closest(sel)
			self

		# Get the siblings of each element in the set of matched elements, 
		# optionally filtered by a selector.
		# TODO remove duplicates?
		def siblings sel
			@nodes = map do |node| node.siblings(sel)
			self

		# Get the descendants of each element in the current set of matched 
		# elements, filtered by a selector.
		def find sel
			@nodes = __query__(sel.query, nodes)
			self

		def reject blk
			filter(blk,no)

		###
		Filter the nodes in selector by a function or other selector
		###
		def filter blk, bool = yes
			var fn = blk isa Function and blk or (|n| n.matches(blk) )
			var ary = nodes.filter(|n| fn(n) == bool)
			# if we want to return a new selector for this, we should do that for
			# others as well
			Imba.Selector.new("", @scope, ary)

		def __query__ query, contexts
			var nodes = []
			var i = 0
			var l = contexts:length

			while i < l
				nodes.push(*contexts[i++].querySelectorAll(query))
			return nodes

		def __matches__
			return yes

		###
		Add specified flag to all nodes in selector
		###
		def flag flag
			forEach do |n| n.flag(flag)

		###
		Remove specified flag from all nodes in selector
		###
		def unflag flag
			forEach do |n| n.unflag(flag)


	# def Imba.querySelectorAll
	Imba:q$ = do |sel,scope| Imba.Selector.new(sel, scope)

	# def Imba.Selector.one
	Imba:q$$ = do |sel,scope| 
		var el = (scope || Imba.document).querySelector(sel)
		el && tag(el) || nil


	# extending tags with query-methods
	# must be a better way to reopen classes
	extend tag element
		def querySelectorAll q do @dom.querySelectorAll q
		def querySelector q do @dom.querySelector q

		# should be moved to Imba.Tag instead?
		# or we should implement all of them here
		def find sel do Imba.Selector.new(sel,self)

