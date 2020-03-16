tag app-filter
	prop value
	prop multi
	@watch! @log! options

	def clear
		value = null
		self

	def valueFlag val = value
		val and val.id ? val.id : null
		
	def body
		<div.value>
			<app-option[value].value> if value

	def expand
		let val = value
		imba.mount <app-menu source=self>
			<div.content.menu>
				if value
					<div.item :tap.{clear!}> "Clear filter"
				for item in options
					<app-option[item].item
						.selected=(value == item)
						:tap.{value = item}>
	
	<body>
		<app-option[value].value> if value
	
	<self
		.{valueFlag(value)}
		.{value != undefined ? 'has-value' : 'unset'}
		:tap.meta.stop.clear
		:tap.expand
	> <$body>


tag app-filter-text < app-filter
	prop placeholder = "Search"

	def focus
		firstElementChild.focus!

	<div.body.text-value>
		<input[value].plain placeholder=placeholder shortcut="s">
	
	<self> <@body>
		
	
	
