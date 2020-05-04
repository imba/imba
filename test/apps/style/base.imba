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
			<p :any.bg-red-200> "Decorators"
			<p :any.bg-red-200/10> "Decorators"
			<p :any.bg-red-200/20.red-900> "Decorators"
			
			<div :any.text-sm :up('x-app:hover').font-bold> "Bold when x-app is hovered"
			
			<input :any.ph-purple-600-a.pho(0.5) :focus.pho(1) type='text' placeholder='Placeholder value'>
			
			
			<div :any.flex.space-x/2.space-y/3>
				<button> "one"
				<button> "two"
				<button> "three"

			<ul> for item in items
				<li :odd.purple-600 :even.underline :lg:even.font-bold> item
				
			# <div.markdown innerHTML=generatedMarkdown>
			# 	<css(h1) .mt(10px).text-bold.teal-800 :hover.underline>
			# <tyle(.red) .bg-red-300 :hover.bg-red-400>
				
			<div> for label in labels
				<div .{label.color}> label.title
			
			<div.button> "My button"
				

imba.mount <x-app :any.block.p(10)>