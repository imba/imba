
tag App
	showMenu = no
	showDetails = no
	number = 0
	name = ''
	
	def scrolling e
		log 'window is scrolling!!',e
		
	def submit
		log 'submit App!!'
	
	<self[d:block bd:blue5 p:4]>
		css div bd:red8 bw:4px p:4
		css .secret div bg:blue3
		
		<input type='checkbox' bind=showMenu>
		<input type='checkbox' bind=showDetails>
		<input type='range' min=0 max=30 bind=number>
		<input type='text' bind=name>
		<div[p:{number}] .{name} @click=log('hello')> "This is a div {Math.random!}"
		<div .{name}> <div> "Inside"
		
		<global
			@click=log('window clicked',e)
			@click.outside=log('clicked outside self!')
			@wheel.passive=scrolling
			@keydown.enter=submit>

		if showMenu
			<div[p:{number}]> "showing menu"
			<global .{name} @click=log('Clicked while showing menu')>
				css div bd:green6 p:{number} m:3
				css &.secret div bg:green4
				<div> "This is rendered at the root of the window"
				if showDetails
					<div> "Works with nested logic etc"

imba.mount <App>
imba.mount <div> "Under app"
