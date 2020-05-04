const items = ['one','two','three','four']

const labels = [
	{color: 'red', title: 'bug'}
	{color: 'blue', title: 'feature'}
]

tag x-alert
	
	def render
		<self :any.p-2.bg-indigo-800.items-center.indigo-100.leading-none.flex :lg.rounded-full.inline-flex role="alert">
			<span :any.flex.rounded-full.bg-indigo-500.uppercase.px-2.py-1.text-xs.font-bold.mr-3> "New"
			<span :any.font-semibold.mr-2.text-left.flex-auto> "Get the coolest t-shirts from our brand new store"

tag x-app
	
	def render
		<self>
			# <css(.button) .bg-blue-300 :hover.bg-blue-400>
		
			<button :any.purple-400 :hover.blue-600> "Welcome"
			<p :any.bg-red-200> "Decorators"
			<p :any.bg-red-200/10> "Decorators"
			<p :any.bg-red-200/20.red-900> "Decorators"
			
			<div :any.text-sm :up('x-app:hover').font-bold> "Bold when x-app is hovered"
			
			<input :any.ph-purple-600/50 :focus.ph-opacity(0.8) type='text' placeholder='Placeholder value'>
			
			
			<div :any.flex.space-x/2.space-y/3>
				<button> "one"
				<button> "two"
				<button> "three"

			<ul> for item in items
				# <li :odd( purple-600 grow/50% )  :even(underline) :lg:even.font-bold> item
				<li :odd.purple-600 :even.underline :lg:even.font-bold> item
				
			<div :any.flex.ttb.space(4).mx(-4) :md.ltr> for item in items
				<div :any.center.p-4.flex.flex-grow.bg-teal-600/25.teal-600.rounded(2) :hover.bg-teal-600/30> item
				# <div :any.wh-16.p-4.flex.bg-red-300.rounded-2> item
				
			# badge
			# <div :any.bg-indigo-900.text-center.py-4.opacity-50 :lg.px-4>
			<div :any.bg-indigo-900.text-center.py-4.opacity-50 :lg.px-4 :hover.opacity-100>
				<div :any.p-2.bg-indigo-800.items-center.indigo-100.leading-none.flex :lg.round.inline-flex role="alert">
					<span :any.flex.round.bg-indigo-500.uppercase.px-2.py-1.text-xs.font-bold.mr-3> "New"
					<span :any.font-semibold.mr-2.text-left.flex-auto> "Get the coolest t-shirts from our brand new store"
				  
			# elevated button
			<button :any.bg-white.grey-800.font-semibold.py-2.px-4.border.border-grey-400.rounded.shadow :hover.bg-grey-100> 'Button'
			
			
			# <div :any.wh(100px).bg-red-300.rounded>
			# <div :any.(wh/100px.bg-red-300.rounded(2)>
			# <div.markdown innerHTML=generatedMarkdown>
			# 	<css(h1) .mt(10px).text-bold.teal-800 :hover.underline>
			# <tyle(.red) .bg-red-300 :hover.bg-red-400>
				
			<div> for label in labels
				<div .{label.color}> label.title
			
			<div.button> "My button"
				

imba.mount <x-app :any.block.p(10)>