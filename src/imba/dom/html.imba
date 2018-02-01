var Imba = require("../imba")

# predefine all supported html tags
tag fragment < element

	def self.createNode
		Imba.document.createDocumentFragment

tag button
	attr autofocus
	attr type

	prop disabled dom: yes

tag canvas
	prop width dom: yes
	prop height dom: yes

	def context type = '2d'
		dom.getContext(type)

tag fieldset
	prop disabled dom: yes

tag form
	attr method
	attr action
	attr enctype
	attr autocomplete
	attr target

	prop novalidate dom: yes

tag html
	def parent
		null

tag input
	attr accept
	attr disabled
	attr form
	attr list
	attr max
	attr maxlength
	attr min
	attr pattern
	attr required
	attr size
	attr step
	attr type

	prop autofocus dom: yes
	prop autocomplete dom: yes
	prop autocorrect dom: yes
	prop value dom: yes
	prop placeholder dom: yes
	prop required dom: yes
	prop disabled dom: yes
	prop multiple dom: yes
	prop checked dom: yes
	prop readOnly dom: yes

tag optgroup
	attr label
	prop disabled dom: yes

tag option
	attr label
	prop disabled dom: yes
	prop selected dom: yes
	prop value dom: yes

tag progress
	attr max
	prop value dom: yes

tag select
	attr size
	attr form
	attr multiple
	prop autofocus dom: yes
	prop disabled dom: yes
	prop required dom: yes

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

tag textarea
	attr rows
	attr cols

	prop autofocus dom: yes
	prop autocomplete dom: yes
	prop autocorrect dom: yes
	prop value dom: yes
	prop disabled dom: yes
	prop required dom: yes
	prop readOnly dom: yes
	prop placeholder dom: yes

yes
