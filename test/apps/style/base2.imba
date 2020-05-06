const items = ['one','two','three','four']

const labels = [
	{color: 'red', title: 'bug'}
	{color: 'blue', title: 'feature'}
]

const box = .(vsc p-4 flex-1 bg-teal-600/25 teal-600 rounded-2 hover:bg-opacity/50)
const list = .(vsc space(4) mx(-4) md:hsc)

tag x-app
	prop checked = false
	
	def render
		<self.(cursor-default) .checked=checked>
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
			# <checkbox[checked]>
			# <p.(bg:red-200/20 red-900 text:sm/1.5 6xl/1.4 size:4:10:30 )> "Decorators"


imba.mount <x-app .(block p(10))>