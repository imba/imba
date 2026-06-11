export tag Tile
	nr

	css d:flex ja:center bg:blue6 bg@odd:blue5 fs.won:50px

	def render
		let placed = data.moves.indexOf(nr)
		let won = data.winner and data.winner.indexOf(nr) >= 0
		<self .won=won> <span> <slot>
# ~bg@odd|16,-3.6,-0.8,40,,45,80,2.8,0.3/-~ Style property modifiers