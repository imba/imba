let clicks = []
let hasGlobal = yes
let hasNested = no

tag NestedItem
	def render
		<self>
			<div> "nested"
			<teleport to='.app' @click=clicks.push('app')>
			<teleport to=#parent @click=clicks.push('parent')>

tag App
	def render
		<self.app>
			<div.bubble @click=clicks.push('bubble')> "Hello"
			<div.stop @click.stop> "Hello"
			
			if hasNested
				<NestedItem>
				
			# listen to global click event
			if hasGlobal
				<global @click=clicks.push('global')>

def click sel, expected = []
	clicks = []
	await spec.click(sel,no)
	eq clicks,expected
	return clicks

test "click" do
	let app = <App>
	# should not trigger before clicking
	await click('body',[])
	
	imba.mount(app)
	
	await click('body',['global'])
	# eq clicks, 1
	await click('.bubble',['bubble','global'])
	# eq clicks, 3
	await click('.stop',[])

	hasGlobal = no
	app.render!
	await click('body',[])
	
	hasNested = yes
	app.render!
	await click('.app',['app','parent'])
