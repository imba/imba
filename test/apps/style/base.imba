tag x-app
	
	def render
		<self :any.flex.border-solid.border(4).border-red-a400>
			<div :base.p(2).purple-400 :hover.purple-800> "Welcome"
			<p :base.bg-teal-200.bgo(0.25) :hover.bgo(0.1).bg-blue-300> "Decorators"

imba.mount <x-app :any.abs.inset(20).bg-grey-300.font-sans>

###
			<div :{selected}.font-mono>
			<div :all.p-1.font-mono.select-none.opacity(.5)> "Hello"
			
			<h2 :all.text-color(gray-300).text-opacity(.5).text-left>
			<h2 :all.color(gray-300,.5)>
			
			<h2 :all.text-gray-300.text-opacity-50.text-left>
			<h2 :all.text(gray-300).text-opacity(50).text-sm>
			
			<h2 :all.text(gray-300,opacity:50,align:left)>
			
			<h2 :all.text(gray-300,50,left,sm).whitespace(:normal)>
			
			<h2 :all.text-gray-300.text-left.text-sm.ws-normal>
			<h2 :all.text-left|sm|gray-300.ws-normal>
			<h2 :all.bg(50).text-left.text-sm.ws-normal>
###