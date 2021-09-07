tag Panel
	
	def toggle
		
		if #domNode
			#attachToParent!
		else
			#detachFromParent!

		self
	
	<self> <div> "panel"
	
tag App
	panel = yes
	
	def toggle
		$panel.toggle!

	<self>
		<div @click=toggle> "Toggle"
		<div @click.log('commit')> "Commit"
		<input type='checkbox' bind=panel>
		if panel
			<Panel$panel>
		else
			<div> "other"
			
imba.mount <App>

test 'attr declaration' do
	yes
	# let el = <A someattr=1>
	# ok el.hasAttribute('someattr')
	