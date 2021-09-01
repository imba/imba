tag NestedItem
	
	<self>
		<div> "nested"
		<teleport to='.app' @click.log('app')>

tag App
	hasNested = no
	hasGlobal = yes

	def render
		<self.app>
			<input type='checkbox' bind=hasNested>
			<input type='checkbox' bind=hasGlobal>
			<div.bubble @click.log('bubble')> "Hello"
			<div.stop @click.stop> "Hello"
			
			if hasNested
				<NestedItem>
				
			# listen to global click event
			if hasGlobal
				<global @click.log('global')>
				
# imba.mount <App>

def click sel, expected = []
	document.querySelector(sel).click!
	console.log "{sel} -> ",expected

def run
	let app = <App>
	# should not trigger before clicking
	await click('body',[])
	
	imba.mount(app)
	
	await click('body',['global'])
	# eq clicks, 1
	await click('.bubble',['bubble','global'])
	# eq clicks, 3
	await click('.stop',[])

	app.hasGlobal = no
	app.render!
	await click('body',[])
	
	app.hasNested = yes
	app.render!
	await click('.app',['app'])

run!