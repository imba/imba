
global class ImbaSelector
	
	prop query

	def initialize sel, scope, nodes

		@query = sel isa ImbaSelector ? sel.query : sel
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
		return global:document unless var ctx = @context
		@scope = ctx:toScope ? ctx.toScope : ctx

	def first
		if @lazy then tag(@first ||= scope.querySelector(query))
		else nodes[0]

	def last
		nodes[@nodes:length - 1]

	def nodes
		return @nodes if @nodes
		var items = scope.querySelectorAll(query)
		@nodes = (tag(node) for node in items)
		@lazy = no
		@nodes
	
	def count do nodes:length
	def len do nodes:length
	def any do count
	
	def at idx
		nodes[idx]

	def forEach block
		nodes.forEach(block)
		self

	def map block
		nodes.map(block)

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

	# TODO IMPLEMENT
	# Get the children of each element in the set of matched elements, 
	# optionally filtered by a selector.
	def children sel
		yes

	# TODO IMPLEMENT
	# Reduce the set of matched elements to those that have a descendant that
	# matches the selector or DOM element.
	def has
		yes

	# TODO IMPLEMENT
	def __union
		p "called ImbaSelector.__union"
		self

	# TODO IMPLEMENT
	def __intersect
		p "called ImbaSelector.__union"
		self

	def reject blk
		filter(blk,no)

	def filter blk, bool = yes
		var fn = blk isa Function and blk or (|n| n.matches(blk) )
		var ary = nodes.filter(|n| fn(n) == bool)
		# if we want to return a new selector for this, we should do that for
		# others as well
		ImbaSelector.new("", @scope, ary)

	def __query__ query, contexts
		var nodes = []
		var i = 0
		var l = contexts:length

		while i < l
			nodes.push(*contexts[i++].querySelectorAll(query))
		return nodes

	def __matches__
		return yes

	# Proxies
	def flag flag
		forEach do |n| n.flag(flag)

	def unflag flag
		forEach do |n| n.unflag(flag)

	def call meth, args = []
		forEach do |n| fn.apply(n,args) if fn = n[meth]

q$ = do |sel,scope| ImbaSelector.new(sel, scope)

q$$ = do |sel,scope| 
	var el = (scope || global:document).querySelector(sel)
	el && tag(el) || nil

# extending tags with query-methods
# must be a better way to reopen classes
extend tag element
	def querySelectorAll q do @dom.querySelectorAll q
	def querySelector q do @dom.querySelector q
	def find sel do ImbaSelector.new(sel,self)

