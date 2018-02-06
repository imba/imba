var Imba = require("../imba")

# predefine all supported html tags
tag fragment < element

	def self.createNode
		Imba.document.createDocumentFragment

extend tag html
	def parent
		null


extend tag canvas
	def context type = '2d'
		dom.getContext(type)

class DataValue
	
	def initialize node, path, mods
		@node = node
		@path = path
		@mods = mods or {}
		@setter = Imba.toSetter(@path)
		let valueFn = node:value
		node:value = do mod(valueFn.call(this))

	def data
		@node.data or @node.@owner_.data
		
	def lazy
		@mods:lazy
		
	def get
		let data = self.data
		let val = data[@path]
		return data[@setter] and val isa Function ? data[@path]() : val
		
	def set value
		let data = self.data
		let prev = data[@path]
		if prev isa Function
			if data[@setter] isa Function
				data[@setter](value)
				return self
		data[@path] = value
		
	def isArray val = get
		val and val:splice and val:sort
	
	def mod value
		if value isa Array
			return value.map do mod($1)
		if @mods:trim and value isa String
			value = value.trim
		if @mods:number
			value = parseFloat(value)
		return value

extend tag input
	def model
		@model
	
	def setModel value, mods
		@model ||= DataValue.new(self,value,mods)
		self
		
	def setValue value
		dom:value = @value = value
		self

	def oninput e
		let val = @dom:value
		@localValue = @initialValue != val ? val : undefined
		model and !model.lazy ? model.set(value) : e.silence		
		
	def onchange e
		@modelValue = @localValue = undefined
		return e.silence unless model
		
		if type == 'radio' or type == 'checkbox'
			let checked = @dom:checked
			let mval = model.get
			let dval = @value != undefined ? @value : value
			# console.log "change",type,checked,dval

			if type == 'radio'
				model.set(dval,true)
			elif dom:value == 'on'
				model.set(!!checked,true)
			elif model.isArray
				let idx = mval.indexOf(dval)
				if checked and idx == -1
					mval.push(dval)
				elif !checked and idx >= 0
					mval.splice(idx,1)
			else
				model.set(dval)
		else
			model.set(value)
	
	# overriding end directly for performance
	def end
		return self if !@model or @localValue !== undefined
		let mval = @model.get
		return self if mval == @modelValue
		@modelValue = mval unless model.isArray

		if type == 'radio' or type == 'checkbox'
			let dval = @value
			let checked = if model.isArray
				mval.indexOf(dval) >= 0
			elif dom:value == 'on'
				!!mval
			else
				mval == @value

			@dom:checked = checked
		else
			@dom:value = mval
			@initialValue = @dom:value
		self

extend tag textarea
	def model
		@model

	def setModel value, mods
		@model ||= DataValue.new(self,value,mods)
		return self
	
	def setValue value
		dom:value = value if @localValue == undefined
		return self
	
	def oninput e
		let val = @dom:value
		@localValue = @initialValue != val ? val : undefined
		model and !model.lazy ? model.set(value) : e.silence

	def onchange e
		@localValue = undefined
		model ? model.set(value) : e.silence
		
	def render
		return if @localValue != undefined or !model
		if model
			@dom:value = model.get
		@initialValue = @dom:value
		self

extend tag option
	def setValue value
		if value != @value
			dom:value = @value = value
		self

	def value
		@value or dom:value

extend tag select
	def model
		@model

	def setModel value, mods
		@model ||= DataValue.new(self,value,mods)
		return self
		
	def setValue value
		if value != @value
			@value = value
			if typeof value == 'object'
				for opt,i in dom:options
					let oval = (opt.@tag ? opt.@tag.value : opt:value)
					if value == oval
						dom:selectedIndex = i
						break
			else
				dom:value = value
		return self
		
	def value
		if multiple
			for option in dom:selectedOptions
				option.@tag ? option.@tag.value : option:value
		else
			let opt = dom:selectedOptions[0]
			opt ? (opt.@tag ? opt.@tag.value : opt:value) : null
	
	def onchange e
		model ? model.set(value) : e.silence
		
	def render
		return unless model

		let mval = model.get
		# sync dom value
		if multiple
			for option in dom:options
				let oval = model.mod(option.@tag ? option.@tag.value : option:value)
				let sel = mval.indexOf(oval) >= 0
				option:selected = sel
		else
			setValue(mval)
			# what if mval is rich? Would be nice with some mapping
			# dom:value = mval
		self