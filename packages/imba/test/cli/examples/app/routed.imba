export tag App
	<self>
		<nav>
			<a route-to='/home'> "Home"
			<a route-to.sticky='/about'> "About"
			<a route-to='/more'> "More"

		<div route='/home'> "Page: Home"
		
		<div route='/about'>
			<div> "Page: About"
			<aside>
				<a route-to="team"> "Team"
				<a route-to="contact"> "Contact"
			<section>
		
				<div route=''> "Stuff about us. Click the links to the right"
				<div route='team'> "Our team"
				<div route='contact'> "Contact us at"
		<div route='/more'> "Page: More"

if $web$
	imba.mount <App.app>