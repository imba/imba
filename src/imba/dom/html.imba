var Imba = require("../imba")

# predefine all supported html tags
tag fragment < element

	def self.createNode
		Imba.document.createDocumentFragment

extend tag canvas
	def context type = '2d'
		dom.getContext(type)

tag html
	def parent
		null

extend tag select
	def value= value
		value = String(value)
	
		if dom:value != value
			dom:value = value
		
			if dom:value != value
				@delayedValue = value

		self
	
	def value
		dom:value
	
	def syncValue
		if @delayedValue != undefined
			dom:value = @delayedValue
			@delayedValue = undefined
		self
	
	def setChildren
		super
		syncValue

yes
