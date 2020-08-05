tag chico-bird

	css @keyframes 
		blink
			50% transform: translateY(2px)
		flap
			50% transform: rotate(10deg)
		dangle
			50% transform: rotate(10deg)
		crest
			50% transform: rotate(10deg)
		fly
			50% transform: translateY(30px)

	def render
		<self>
			<span.shadow>
			<Legs>
			<WingRight>
			<WingLeft>
			<Crest>
			<Head>
			<Face>