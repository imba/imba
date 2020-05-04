const items = ['one','two','three','four']

const labels = [
	{color: 'red', title: 'bug'}
	{color: 'blue', title: 'feature'}
]

tag x-app
	
	def render
		<self>
			# <css(.button) .bg-blue-300 :hover.bg-blue-400>
		
			<button :any.purple-400 :hover.blue-600> "Welcome"
			<p :any.bg-red-200.bgo(0.5) :lg.bg-blue-400 :hover.bgo-100> "Decorators"
			
			<div :up('x-app:hover').font-bold> "Bold when x-app is hovered"

			<ul> for item in items
				<li :odd.purple-600 :even.underline :lg:even.font-bold> item
				
			# <div.markdown innerHTML=generatedMarkdown>
			# 	<css(h1) .mt(10px).text-bold.teal-800 :hover.underline>
			# <tyle(.red) .bg-red-300 :hover.bg-red-400>
				
			<div> for label in labels
				<div .{label.color}> label.title
			
			<div.button> "My button"
				

imba.mount <x-app :any.block.p(10)>