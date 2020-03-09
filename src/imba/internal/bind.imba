var isGroup = do |obj|
	return obj isa Array or (obj && obj.has isa Function)

var bindHas = do |object,value|
	if object isa Array
		object.indexOf(value) >= 0
	elif object and object.has isa Function
		object.has(value)
	elif object and object.contains isa Function
		object.contains(value)
	elif object == value
		return true
	else
		return false

var bindAdd = do |object,value|
	if object isa Array
		object.push(value)
	elif object and object.add isa Function
		object.add(value)

var bindRemove = do |object,value|
	if object isa Array
		let idx = object.indexOf(value)
		object.splice(idx,1) if idx >= 0
	elif object and object.delete isa Function
		object.delete(value)

def createProxyProperty target
	def getter
		target[0] ? target[0][target[1]] : undefined

	def setter v
		target[0] ? (target[0][target[1]] = v) : null

	return {
		get: getter
		set: setter
	}

###
Data binding
###
extend class Element
	def getRichValue
		@value

	def setRichValue value
		@value = value
	
	def bind$ key, value
		let o = value or []

		if key == 'data'
			unless #f & $TAG_BIND_MODEL$
				#f |= $TAG_BIND_MODEL$
				this.on$('change',{_change$: true},this) if this.change$
				this.on$('input',{capture: true,_input$: true},this) if this.input$

		Object.defineProperty(self,key,o isa Array ? createProxyProperty(o) : o)
		return o

Object.defineProperty(Element.prototype,'richValue',{
	def get
		@getRichValue()
	def set v
		@setRichValue(v)
})

extend class HTMLSelectElement

	def change$ e
		return unless #f & $TAG_BIND_MODEL$

		let model = @data
		let prev = #richValue
		#richValue = undefined
		let values = self.getRichValue()

		if @multiple
			if prev
				for value in prev when values.indexOf(value) == -1
					bindRemove(model,value)

			for value in values
				if !prev or prev.indexOf(value) == -1
					bindAdd(model,value)
		else
			@data = values[0]
		self

	def getRichValue
		if #richValue
			return #richValue

		#richValue = for o in @selectedOptions
			o.richValue

	def syncValue
		let model = @data

		if @multiple
			let vals = []
			for option,i in @options
				let val = option.richValue
				let sel = bindHas(model,val)
				option.selected = sel
				vals.push(val) if sel
			#richValue = vals

		else
			for option,i in @options
				let val = option.richValue
				if val == model
					#richValue = [val]
					break @selectedIndex = i
		return

	def end$
		@syncValue()

extend class HTMLOptionElement
	def setRichValue value
		#richValue = value
		self.value = value

	def getRichValue
		if #richValue !== undefined
			return #richValue
		return self.value

extend class HTMLTextAreaElement
	def setRichValue value
		#richValue = value
		self.value = value

	def getRichValue
		if #richValue !== undefined
			return #richValue
		return self.value

	def input$ e
		@data = @value

	def end$
		@value = @data

extend class HTMLInputElement
	
	def input$ e
		return unless #f & $TAG_BIND_MODEL$
		let typ = @type

		if typ == 'checkbox' or typ == 'radio'
			return

		#richValue = undefined
		@data = @richValue

	def change$ e
		return unless #f & $TAG_BIND_MODEL$

		let model = @data
		let val = @richValue

		if @type == 'checkbox' or @type == 'radio'
			let checked = @checked
			if isGroup(model)
				checked ? bindAdd(model,val) : bindRemove(model,val)
			else
				@data = checked ? val : false

	def setRichValue value
		#richValue = value
		self.value = value

	def getRichValue
		if #richValue !== undefined
			return #richValue

		let value = @value
		let typ = @type

		if typ == 'range' or typ == 'number'
			value = @valueAsNumber
			value = null if Number.isNaN(value)
		elif typ == 'checkbox'
			value = true if value == undefined or value === 'on'

		return value

	def end$
		if #f & $TAG_BIND_MODEL$
			if @type == 'checkbox' or @type == 'radio'
				let val = @data
				if val === true or val === false or val == null
					@checked = !!val
				else
					@checked = bindHas(val,@richValue)
			else
				@richValue = @data