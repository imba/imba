class Group
	
	def constructor data
		data = data
		
	def add item
		data.items.push(item)

	def archived?
		data.archived != null
	
	def active?
		!archived? && !empty?
		
	def empty?
		data.items.length == 0
	
	def empty
		data.items = []
		return self
		
	def emptyOrArchived
		empty? or archived?

test do
	let group = new Group(items: [])
	eq group.empty?,true
	
	group.add(1)
	eq group.empty?,false
	
	group.empty!
	eq group.empty?,true
	
	eq group.active?, false