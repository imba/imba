# imba$imbaPath=global
import {
	Element,
	HTMLSelectElement,
	HTMLInputElement,
	HTMLButtonElement,
	HTMLTextAreaElement,
	HTMLOptionElement,
	HTMLButtonElement
} from './core'

export def use_dom_bind
	yes

const toBind = {
	INPUT: yes
	SELECT: yes
	TEXTAREA: yes
	BUTTON: yes
}

let isGroup = do(obj)
	return obj isa Array or (obj && obj.has isa Function)

let bindHas = do(object,value)
	if object == value
		return true
	elif object isa Array
		object.indexOf(value) >= 0
	elif object and object.has isa Function
		object.has(value)
	elif object and object.contains isa Function
		object.contains(value)
	else
		return false

let bindAdd = do(object,value)
	if object isa Array
		object.push(value)
	elif object and object.add isa Function
		object.add(value)

let bindRemove = do(object,value)
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
		self.value

	def setRichValue value
		self.value = value
	
	def bind$ key, value
		let o = value or []

		if key == 'data' and !$$bound and toBind[nodeName]
			$$bound = yes
			if change$
				addEventListener('change',change$ = change$.bind(this))
			if input$
				addEventListener('input',input$ = input$.bind(this),capture: yes)
			if click$
				addEventListener('click',click$ = click$.bind(this),capture: yes)
			# this.on$('change',{_change$: true},this) if this.change$
			# this.on$('input',{capture: true,_input$: true},this) if this.input$

		Object.defineProperty(self,key,o isa Array ? createProxyProperty(o) : o)
		return o

Object.defineProperty(imba.dom.Element.prototype,'richValue',{
	get: do this.getRichValue()
	set: do(v) this.setRichValue(v)
})

extend class HTMLSelectElement

	def change$ e
		let model = self.data
		let prev = $$value
		$$value = undefined
		let values = self.getRichValue()

		if self.multiple
			if prev
				for value in prev when values.indexOf(value) == -1
					bindRemove(model,value)

			for value in values
				if !prev or prev.indexOf(value) == -1
					bindAdd(model,value)
		else
			self.data = values[0]
		imba.commit!
		self

	def getRichValue
		if $$value
			return $$value

		$$value = for o in self.selectedOptions
			o.richValue

	def syncValue
		let model = self.data

		if self.multiple
			let vals = []
			for option,i in self.options
				let val = option.richValue
				let sel = bindHas(model,val)
				option.selected = sel
				vals.push(val) if sel
			$$value = vals

		else
			for option,i in self.options
				let val = option.richValue
				if val == model
					$$value = [val]
					break self.selectedIndex = i
		return

	def end$
		self.syncValue()

extend class HTMLOptionElement
	def setRichValue value
		$$value = value
		self.value = value

	def getRichValue
		if $$value !== undefined
			return $$value
		return self.value

extend class HTMLTextAreaElement
	def setRichValue value
		$$value = value
		self.value = value

	def getRichValue
		if $$value !== undefined
			return $$value
		return self.value

	def input$ e
		self.data = self.value
		imba.commit!

	def end$
		if $$bound and self.value != self.data
			self.value = self.data


extend class HTMLInputElement
	
	def input$ e
		let typ = self.type

		if typ == 'checkbox' or typ == 'radio'
			return

		$$value = undefined
		self.data = self.richValue
		imba.commit!

	def change$ e
		let model = self.data
		let val = self.richValue

		if self.type == 'checkbox' or self.type == 'radio'
			let checked = self.checked
			if isGroup(model)
				checked ? bindAdd(model,val) : bindRemove(model,val)
			else
				self.data = checked ? val : false
		imba.commit!

	def setRichValue value
		if $$value !== value
			$$value = value

			if self.value !== value
				self.value = value
		return

	def getRichValue
		if $$value !== undefined
			return $$value

		let value = self.value
		let typ = self.type

		if typ == 'range' or typ == 'number'
			value = self.valueAsNumber
			value = null if Number.isNaN(value)
		elif typ == 'checkbox'
			value = true if value == undefined or value === 'on'

		return value

	def end$
		if $$bound
			let typ = self.type
			if typ == 'checkbox' or typ == 'radio'
				let val = self.data
				if val === true or val === false or val == null
					self.checked = !!val
				else
					self.checked = bindHas(val,self.richValue)
			else
				self.richValue = self.data
		return
		
extend class HTMLButtonElement

	get checked
		$checked
		
	set checked val
		if val != $checked
			$checked = val
			flags.toggle('checked',!!val)
	
	def setRichValue value
		$$value = value
		self.value = value

	def getRichValue
		if $$value !== undefined
			return $$value
		return self.value
		
	def click$ e
		let data = self.data
		let toggled = self.checked
		let val = self.richValue
		# if self.type == 'checkbox' or self.type == 'radio'
		if isGroup(data)
			toggled ? bindRemove(data,val) : bindAdd(data,val)
		else
			self.data = toggled ? null : val
		end$!
		imba.commit!

	def end$
		if $$bound
			let val = self.data
			if val === true or val === false or val == null
				self.checked = !!val
			else
				self.checked = bindHas(val,self.richValue)
		return