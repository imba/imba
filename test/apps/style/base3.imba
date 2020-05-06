const items = ['one','two','three','four']

const labels = [
	{color: 'red', title: 'bug'}
	{color: 'blue', title: 'feature'}
	{color: 'teal', title: 'idea'}
	{color: 'yellow', title: 'idea'}
]

const box = .(vsc p-4 flex-1 rounded-2)
const teal-box = .(bg-teal-600/25 teal-600 hover:bg-opacity/50)
const list = .(vsc space(4) mx(-4) md:hsc)

const colors =
	blue: .(bg:blue-200 color:blue-800 hover{color:blue-900 bg:blue-300} hover:bg-blue-300)
	teal: .(bg:teal-200 color:teal-800 hover:teal-900 hover:bg-teal-300)
	red: .(bg:red-200 color:red-800 hover:red-900 hover:bg-red-300)
	yellow: .(bg:yellow-200 color:yellow-800 hover:yellow-900 hover:bg-yellow-300)

tag x-app
	prop checked = false
	
	def render
		<self.(cursor-default bg-white) .checked=checked>
			<h2> "Is checked? {checked}"
			<button.(purple-400 hover:blue-600)> "Welcome"
			<button.(purple-400 hover:blue-600)> "Welcome"
			<p.(bg-red-200)> "Decorators"
			<p.(bg-red-200/50) .(font-bold)=checked> "Decorators {checked}"
			<p.(bg-red-200/25 hover:bg-red-200/75)> "Decorators"
			<input[checked] type='checkbox'>
			
			
			<div.{list}> for item,i in items
				<div.item.{box} .warn=(i > 1)>
					<span.(hover-item:font-bold)> item
					<span.(text-xs hover-item:underline)> "subtitle"
					<span.(blue-700 in-warn:red-600)> "warning?"
			
			<div.{list}> for item,i in items
				<div.item.{box}> <span.(font-bold)> item
				
			<div.{list}> for item,i in labels
				<div.{box}.{colors[item.color]}> <span> item.title

imba.mount <x-app .(block p(10))>