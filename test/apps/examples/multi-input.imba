const CHR = "\u200b"
# const CHR = "%"

tag multi-input
	@multiple = yes
	@values = []

	get prefixes
		CHR.repeat(@values.length)

	get inputValue
		@input ? @input.value.split(CHR).join('') : ''

	get expectedValue
		@prefixes + @inputValue

	get selStart
		@input ? @input.selectionStart : 0

	get selEnd
		@input ? @input.selectionEnd : 0

	def blur
		@input.blur()
		
	def focus
		unless document.activeElement == @input
			@input.focus()
			@select(@prefixes.length,@input.value.length)
		self

	def submit
		self.addItem(@inputValue)
		
	def addItem value
		@values.push(value or @inputValue)
		@input.value = @prefixes
		self

	def select start, end
		@input.setSelectionRange(start,end or start)

	def onbeforeinput e
		let start = @selStart, end = @selEnd
		console.log 'onbeforeinput',e.inputType,start,end,e
		
		if start != end
			@values.splice(start,end - start)

		elif e.inputType == 'deleteContentBackward' and start != 0
			if @values.length >= start
				if @strict
					@select(start - 1,end)
					return e.cancel
				else
					@values.splice(start - 1,1)

	def render
		let start = self.selStart
		let end = self.selEnd
		let values = self.values

		<self
			.readonly=self.readonly
			.selecting=(start < values.length)
			.writing=@inputValue
		>
			<div.views> for item,i in values
				<div.item .sel=(end > i >= start) .before=(start == end == i)> item

			@input = <input
				type="text"
				:beforeinput.@onbeforeinput
				:selection.commit
				:keydown.enter.prevent.submit()
				:keydown.esc.blur
				:change.stop
				:copy.oncopy
				readonly=self.readonly
				placeholder=self.placeholder
			>

		if @input.value != self.expectedValue
			let charsBefore = @input.value.slice(0,start).split(CHR).join("")
			@input.value = self.expectedValue
			self.select(@prefixes.length + charsBefore.length)

var values = ['one','two','three']
var alternatives = ['one','two','three','four','five']

tag app-root

	def render
		<self>
			<h1> "Basic"
			<multi-input>
			<h1> "Bound"
			<multi-input values=values>
			<div>
				<ul> for value in values
					<li> value
			<div> for alt in alternatives
				<label>
					<input[values] type='checkbox' value=alt>
					<span> alt

imba.mount <app-root>


### css scoped

multi-input {
	display: block;
	padding: 10px;
	margin: 10px;
	border: 1px solid black;
}

.item {
	padding: 2px;
	border: 1px solid transparent;
}

.item.before {
	border-left-color: blue;
}

.item.sel {
	border-color: blue;
}

.selecting input {
	caret-color: transparent;
}

###
