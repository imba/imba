global css @root ff:Arial c:white/87 bg:black/85
global css a c:indigo5 c@hover:indigo6
global css body m:0 d:flex ja:center h:100vh

tag app-counter
	count = 0
	<self @click=count++> "count is {count}"

		# css without a selector applies to the enclosing element
		css d:inline-block user-select:none cursor:pointer fs:6 bg:gray9
			p:2.5 5 m:6 bd:1px solid transparent rd:4 tween:border-color 250ms
			bc@hover:indigo5

tag app

	# inline styles with square brackets
	<self[max-width:1280px m:0 auto p:2rem ta:center]>

		# this css applies to nested img elements and not parents
		css img h:35 w:auto p:1.5em
			transition:transform 250ms, filter 250ms
			@hover transform:scale(1.1)
				filter:drop-shadow(0 0 4em red5)

		<a href="https://imba.io" target="_blank">
			<img.wing src="https://raw.githubusercontent.com/imba/branding-imba/master/yellow-wing-logo/imba.svg">

		<h1[c:yellow4 fs:3.2em lh:1.1]> "Imba"

		<app-counter>

		css p c:warm1 ws:pre
		css a td:none
		<p>
			"Check out our documentation at "
			<a href="https://imba.io" target="_blank"> "Imba.io"
			"."
		<p>
			"Take the free Imba course on "
			<a href="https://scrimba.com/learn/imba/intro-co3bc40f5b6a7b0cffda32113" target="_blank">
				"Scrimba.com"
			"."

imba.mount <app>
