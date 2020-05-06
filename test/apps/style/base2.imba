const items = ['one','two','three','four']

const labels = [
	{color: 'red', title: 'bug'}
	{color: 'blue', title: 'feature'}
]

tag x-app
	prop checked = false
	
	def render
		<self .checked=checked>
			<h2> "Is checked? {checked}"
			<button.(purple-400 hover:blue-600)> "Welcome"
			<p.(bg-red-200)> "Decorators"
			<p.(bg-red-200/50) .(font-bold)=checked> "Decorators {checked}"
			<p.(bg-red-200/25 hover:bg-red-200/75)> "Decorators"
			<input[checked] type='checkbox'>
			
			<div .(vsc space(4) mx(-4) md:hsc)> for item in items
				<div.item.(vsc p-4 flex-1 bg-teal-600/25 teal-600 rounded(2) hover:bg-teal-600/30)>
					<span.(hover-item:font-bold even-item:md:underline)> item
					<span.(text-xs hover-item:underline)> "subtitle"
					
					# <span.(hover-item:font-bold even-item:md:underline)> item
					# <span :hover(.item)(font-bold) :even(.item)(underline)> item
					# <span (.item:hover)(font-bold) (.item:even)(underline)> item

			# <checkbox[checked]>
			# <p.(bg:red-200/20 red-900 text:sm/1.5 6xl/1.4 size:4:10:30 )> "Decorators"


imba.mount <x-app .(block p(10))>