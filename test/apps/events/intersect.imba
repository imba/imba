var sections = ['Hero','About','Features','Resources']

# Play around
tag page-section
		
	prop ratio
	
	def render
		<self.block
			@intersect(0,0.5,1)=(ratio = e.ratio)
			@intersect.in=reveal
			@intersect.out=concealed
		> 
			<h2> data
			<p> "ratio is {ratio}"
			if ratio > 0.5
				<p> "More than half-way"
		
	def half e
		console.info 'around half',e,e.delta,e.ratio

	def intersecting e,info
		let ratio = e.ratio
		console.info 'intersecting',ratio,data,info

	def reveal e
		console.info 'revealing',e.ratio,data,e.delta
	
	def concealed e
		console.info 'concealed',e.ratio,data,e.delta

imba.mount do
	<div.app>
		for section,i in sections
			<page-section.p-10
				css:height=300
				.bg-blue-{i * 100 + 200}
				data=section>

### css
.app {
	padding-top: 101vh;
}
page-section {
	display: block;
	height: 400px;
	background: #90cdf4;
	padding: 40px;
}

page-section:nth-child(odd){
	background: #d6bcfa;
}

###